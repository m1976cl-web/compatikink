# Plan de Refactorización — CompatKink

> Fecha: 2026-08-05  
> Estado: Planificación — listo para ejecutar por fases

---

## Resumen Ejecutivo

El archivo `app/index.tsx` actualmente maneja ~15 estados locales, decenas de handlers y lógica de negocio mezclada con UI. Este plan divide el trabajo en **4 fases independientes**, cada una con verificaciones para evitar romper la app.

---

## Fase 1: Estado Global con Zustand

### Objetivo
Extraer todo el estado de datos del Home a un store global, dejando en `index.tsx` solo estados de UI pura (formularios, modales).

### Instalación

```bash
npm install zustand
```

### 1.1 Crear `stores/homeStore.ts`

```ts
import { create } from 'zustand';
import { UserProfile, Session, SceneAgreement } from '@/types';
import {
  getCurrentProfile,
  listAllProfiles,
  listMyLocalSessions,
  getAllSceneAgreements,
} from '@/lib/storage';

interface HomeState {
  profile: UserProfile | null;
  profilesList: UserProfile[];
  sessions: Session[];
  sceneAgreements: { sessionId: string; agreements: SceneAgreement[] }[];
  vaultOpen: boolean;
  isLoading: boolean;

  loadHomeData: () => Promise<void>;
  setVaultOpen: (open: boolean) => void;
  reset: () => void;
}

export const useHomeStore = create<HomeState>((set) => ({
  profile: null,
  profilesList: [],
  sessions: [],
  sceneAgreements: [],
  vaultOpen: false,
  isLoading: false,

  loadHomeData: async () => {
    set({ isLoading: true });
    const [curProfile, allProfs, mySessions, agreements] = await Promise.all([
      getCurrentProfile(),
      listAllProfiles(),
      listMyLocalSessions(),
      getAllSceneAgreements(),
    ]);
    set({
      profile: curProfile,
      profilesList: allProfs,
      sessions: mySessions,
      sceneAgreements: agreements,
      isLoading: false,
    });
  },

  setVaultOpen: (open) => set({ vaultOpen: open }),
  reset: () =>
    set({
      profile: null,
      profilesList: [],
      sessions: [],
      sceneAgreements: [],
    }),
}));
```

### 1.2 Crear `hooks/useVaultSubscription.ts`

```ts
import { useEffect } from 'react';
import { useHomeStore } from '@/stores/homeStore';
import { VaultLockGateAPI } from '@/lib/cryptoVault';

export function useVaultSubscription() {
  const setVaultOpen = useHomeStore((s) => s.setVaultOpen);

  useEffect(() => {
    const unsub = VaultLockGateAPI.subscribe((snap) => {
      setVaultOpen(snap.unlocked);
    });
    return unsub;
  }, [setVaultOpen]);
}
```

### 1.3 Simplificar `app/index.tsx`

```tsx
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useHomeStore } from '@/stores/homeStore';
import { useVaultSubscription } from '@/hooks/useVaultSubscription';
import { ProfileBar } from '@/components/home/ProfileBar';
import { QuickInviteForm } from '@/components/home/QuickInviteForm';
import { GuestJoinSection } from '@/components/home/GuestJoinSection';
import { SessionList } from '@/components/home/SessionList';
import { ModuleGrid } from '@/components/home/ModuleGrid';
import { HomeActions } from '@/components/home/HomeActions';
import { HeroSection } from '@/components/home/HeroSection';

import { colors, fonts } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';

export default function HomeScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  // Solo estados de UI pura
  const [guestCode, setGuestCode] = useState('');
  const [showQuickInvite, setShowQuickInvite] = useState(false);
  const [activeTab, setActiveTab] = useState('explore');
  const [searchQuery, setSearchQuery] = useState('');

  // Datos globales
  const { profile, sessions, loadHomeData, isLoading } = useHomeStore();
  useVaultSubscription();

  useEffect(() => {
    loadHomeData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <HeroSection />
        <ProfileBar />
        <GuestJoinSection
          guestCode={guestCode}
          onChangeCode={setGuestCode}
        />
        <QuickInviteForm
          visible={showQuickInvite}
          onToggle={setShowQuickInvite}
        />
        <SessionList sessions={sessions} />
        <ModuleGrid
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          searchQuery={searchQuery}
          onChangeSearch={setSearchQuery}
        />
        <HomeActions />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
```

### Verificación Fase 1
- [ ] `npm start` carga sin errores
- [ ] Login/logout funciona igual
- [ ] El vault se desbloquea correctamente
- [ ] No hay re-render innecesarios (verificar con React DevTools Profiler)

---

## Fase 2: Extraer Secciones en Componentes

### Nueva estructura de carpetas

```
components/
├── home/
│   ├── HeroSection.tsx
│   ├── ProfileBar.tsx
│   ├── QuickInviteForm.tsx
│   ├── GuestJoinSection.tsx
│   ├── SessionList.tsx
│   ├── ModuleGrid.tsx
│   └── HomeActions.tsx
```

### 2.1 `components/home/ProfileBar.tsx`

```tsx
import { View, Text, TextInput, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useHomeStore } from '@/stores/homeStore';
import { loginProfile, logoutProfile } from '@/lib/storage';
import { colors, fonts, spacing } from '@/constants/theme';

export function ProfileBar() {
  const { profile, profilesList, loadHomeData } = useHomeStore();
  const [loginNick, setLoginNick] = useState('');
  const [loginPin, setLoginPin] = useState('');

  const handleLogin = async () => {
    if (!loginNick.trim()) {
      Alert.alert('Datos incompletos', 'Selecciona o ingresa tu nick.');
      return;
    }
    const res = await loginProfile(loginNick.trim(), loginPin);
    if (res) {
      setLoginPin('');
      await loadHomeData();
    } else {
      Alert.alert('Error de login', 'Nick o PIN incorrecto.');
    }
  };

  const handleLogout = async () => {
    await logoutProfile();
    await loadHomeData();
  };

  if (profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.greeting}>Hola, {profile.nickname}</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.button}>
          <Text style={styles.buttonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nick"
        placeholderTextColor={colors.textMuted}
        value={loginNick}
        onChangeText={setLoginNick}
      />
      <TextInput
        style={styles.input}
        placeholder="PIN"
        placeholderTextColor={colors.textMuted}
        value={loginPin}
        onChangeText={setLoginPin}
        secureTextEntry
        keyboardType="number-pad"
      />
      <TouchableOpacity onPress={handleLogin} style={styles.button}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md },
  greeting: { fontFamily: fonts.heading, color: colors.text, fontSize: 18 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: colors.background, fontFamily: fonts.bodySemi },
});
```

### 2.2 `components/home/ModuleGrid.tsx`

```tsx
import { useMemo, useState } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { ModuleTile } from '@/components/ModuleTile';
import { CategoryTabs, CategoryTab } from '@/components/CategoryTabs';
import { useHomeStore } from '@/stores/homeStore';
import { colors, fonts, spacing } from '@/constants/theme';

type ModuleDef = {
  title: string;
  description: string;
  mark: string;
  category: string;
  route?: string;
  onPress?: () => void;
};

const ACCENT_COLORS: Record<string, string> = {
  explore: '#c084fc',
  scenes: '#f472b6',
  social: '#38bdf8',
  ai: '#4ade80',
  vault: '#fbbf24',
};

const CATEGORY_TABS: CategoryTab[] = [
  { key: 'explore', label: 'Explorar', icon: '🔮', accent: ACCENT_COLORS.explore },
  { key: 'scenes', label: 'Escenas', icon: '🎭', accent: ACCENT_COLORS.scenes },
  { key: 'social', label: 'Social', icon: '🌐', accent: ACCENT_COLORS.social },
  { key: 'ai', label: 'IA', icon: '🤖', accent: ACCENT_COLORS.ai },
  { key: 'vault', label: 'Bóveda', icon: '🔒', accent: ACCENT_COLORS.vault },
];

const MODULES: ModuleDef[] = [
  // TODO: migrar desde app/index.tsx
];

interface ModuleGridProps {
  activeTab: string;
  onChangeTab: (tab: string) => void;
  searchQuery: string;
  onChangeSearch: (q: string) => void;
}

export function ModuleGrid({
  activeTab,
  onChangeTab,
  searchQuery,
  onChangeSearch,
}: ModuleGridProps) {
  const vaultOpen = useHomeStore((s) => s.vaultOpen);

  const filteredModules = useMemo(() => {
    let list = MODULES.filter((m) => m.category === activeTab);

    if (activeTab === 'vault' && !vaultOpen) {
      return []; // o mostrar estado bloqueado
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeTab, searchQuery, vaultOpen]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar módulos..."
        placeholderTextColor={colors.textMuted}
        value={searchQuery}
        onChangeText={onChangeSearch}
      />
      <CategoryTabs
        tabs={CATEGORY_TABS}
        active={activeTab}
        onChange={onChangeTab}
      />
      <ScrollView contentContainerStyle={styles.grid}>
        {filteredModules.map((m) => (
          <ModuleTile key={m.route ?? m.title} {...m} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    color: colors.text,
    marginBottom: spacing.md,
    fontFamily: fonts.body,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
```

### Verificación Fase 2
- [ ] Todas las secciones renderizan correctamente
- [ ] Tabs filtran módulos
- [ ] Búsqueda funciona
- [ ] Vault bloquea/desbloquea sección correctamente

---

## Fase 3: Hooks de Negocio Reutilizables

### 3.1 `hooks/useQuickInvite.ts`

```ts
import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useHomeStore } from '@/stores/homeStore';
import { createLocalSession } from '@/lib/storage';
import { useRouter } from 'expo-router';

export function useQuickInvite() {
  const router = useRouter();
  const profile = useHomeStore((s) => s.profile);
  const loadHomeData = useHomeStore((s) => s.loadHomeData);
  const [isCreating, setIsCreating] = useState(false);

  const createInvite = useCallback(
    async (
      guestNick: string,
      guestNotes: string,
      expiryOption: '24h' | '7d' | 'none'
    ) => {
      if (!profile?.baseResponses?.length) {
        Alert.alert('Sin respuestas', 'Responde tu cuestionario base primero.');
        return;
      }
      if (!guestNick.trim()) {
        Alert.alert('Nombre requerido', 'Ingresa el nombre de la otra persona.');
        return;
      }

      setIsCreating(true);
      try {
        let expiresAt: string | undefined;
        if (expiryOption === '24h') {
          expiresAt = new Date(Date.now() + 86400000).toISOString();
        } else if (expiryOption === '7d') {
          expiresAt = new Date(Date.now() + 604800000).toISOString();
        }

        const session = await createLocalSession(
          profile.nickname,
          profile.baseResponses,
          profile,
          expiresAt
        );

        const { saveGuestProfile } = await import('@/lib/storage');
        await saveGuestProfile(session.id, {
          nickname: guestNick.trim(),
          notes: guestNotes.trim(),
        });

        await loadHomeData();
        router.push({
          pathname: '/invite',
          params: { token: session.initiatorToken },
        });
      } catch {
        Alert.alert('Error', 'No se pudo crear la sesión de invitación.');
      } finally {
        setIsCreating(false);
      }
    },
    [profile, loadHomeData, router]
  );

  return { createInvite, isCreating };
}
```

### 3.2 `hooks/useBackup.ts` (reemplaza `globalThis.prompt`)

```ts
import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { exportUserDataJSON } from '@/lib/storage';

export function useBackup() {
  const [isExporting, setIsExporting] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [showPassphraseModal, setShowPassphraseModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'export' | 'import' | null>(null);

  const requestPassphrase = useCallback((action: 'export' | 'import') => {
    setPendingAction(action);
    setShowPassphraseModal(true);
  }, []);

  const confirmPassphrase = useCallback(async () => {
    if (!passphrase || passphrase.length < 4) {
      Alert.alert('Contraseña inválida', 'Mínimo 4 caracteres.');
      return;
    }

    setShowPassphraseModal(false);

    if (pendingAction === 'export') {
      setIsExporting(true);
      try {
        const json = await exportUserDataJSON(passphrase);
        await Clipboard.setStringAsync(json);
        Alert.alert('Exportado', 'Backup copiado al portapapeles.');
      } catch {
        Alert.alert('Error', 'No se pudo exportar.');
      } finally {
        setIsExporting(false);
        setPassphrase('');
      }
    }

    // TODO: implementar import
    setPassphrase('');
  }, [passphrase, pendingAction]);

  const cancelPassphrase = useCallback(() => {
    setShowPassphraseModal(false);
    setPassphrase('');
    setPendingAction(null);
  }, []);

  return {
    isExporting,
    passphrase,
    setPassphrase,
    showPassphraseModal,
    requestPassphrase,
    confirmPassphrase,
    cancelPassphrase,
  };
}
```

### 3.3 `components/modals/BackupPassphraseModal.tsx`

```tsx
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors, fonts, spacing } from '@/constants/theme';

interface Props {
  visible: boolean;
  passphrase: string;
  onChangePassphrase: (p: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function BackupPassphraseModal({
  visible,
  passphrase,
  onChangePassphrase,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Copia de seguridad cifrada</Text>
          <Text style={styles.subtitle}>
            Backups con PBKDF2 + AES-GCM. Mínimo 4 caracteres.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Contraseña de cifrado"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            value={passphrase}
            onChangeText={onChangePassphrase}
          />
          <View style={styles.actions}>
            <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={styles.confirmBtn}>
              <Text style={styles.confirmText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontFamily: fonts.heading,
    color: colors.text,
    fontSize: 18,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    color: colors.text,
    marginBottom: spacing.md,
    fontFamily: fonts.body,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  cancelBtn: {
    padding: spacing.sm,
  },
  cancelText: {
    color: colors.textMuted,
    fontFamily: fonts.body,
  },
  confirmBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  confirmText: {
    color: colors.background,
    fontFamily: fonts.bodySemi,
  },
});
```

### Verificación Fase 3
- [ ] Crear invitación funciona igual que antes
- [ ] Backup pide contraseña en modal nativo (no `globalThis.prompt`)
- [ ] Exportar copia JSON al portapapeles funciona en iOS y Android

---

## Fase 4: Limpieza Final y Estructura

### 4.1 Estructura de carpetas objetivo

```
compatikink/
├── app/                          # Expo Router (solo pantallas)
│   ├── _layout.tsx
│   ├── index.tsx                 # ~150 líneas (antes >1000)
│   ├── questionnaire/
│   ├── invite/
│   ├── report/
│   ├── share/
│   └── guest/
│
├── components/
│   ├── ui/                       # Atómicos reutilizables
│   │   ├── Button.tsx
│   │   ├── Section.tsx
│   │   ├── EmptyState.tsx
│   │   └── ScreenContainer.tsx
│   ├── home/                     # Secciones del Home
│   │   ├── HeroSection.tsx
│   │   ├── ProfileBar.tsx
│   │   ├── QuickInviteForm.tsx
│   │   ├── GuestJoinSection.tsx
│   │   ├── SessionList.tsx
│   │   ├── ModuleGrid.tsx
│   │   └── HomeActions.tsx
│   └── modals/                   # Todos los modales
│       ├── OfficeModeModal.tsx
│       ├── OnboardingOverlay.tsx
│       ├── BackupPassphraseModal.tsx
│       ├── AgeVerificationModal.tsx
│       └── ...
│
├── hooks/                        # Lógica reutilizable
│   ├── useHomeData.ts
│   ├── useQuickInvite.ts
│   ├── useBackup.ts
│   ├── useVaultSubscription.ts
│   └── useResponsive.ts
│
├── stores/                       # Zustand
│   ├── homeStore.ts
│   ├── authStore.ts              # (futuro) Perfil, login, PIN
│   └── vaultStore.ts             # (futuro) Estado de la bóveda
│
├── lib/                          # Infraestructura
│   ├── supabase.ts
│   ├── storage.ts
│   ├── cryptoVault.ts
│   └── exportPDF.ts
│
├── types/                        # TypeScript
├── constants/                    # Theme, fonts
├── supabase/                     # Schema SQL
└── scripts/
```

### 4.2 Checklist de migración

| Paso | Acción | Verificación |
|------|--------|-------------|
| 1 | Instalar Zustand, crear `stores/homeStore.ts` | `npm start` sigue funcionando |
| 2 | Mover estados de datos al store, dejar solo UI en `index.tsx` | Home carga igual, modales abren |
| 3 | Extraer `ProfileBar.tsx` | Login/logout funciona |
| 4 | Extraer `ModuleGrid.tsx` | Tabs y búsqueda filtran bien |
| 5 | Extraer `useQuickInvite.ts` | Crear invitación funciona igual |
| 6 | Crear `BackupPassphraseModal.tsx` | Exportar backup pide contraseña en móvil |
| 7 | Borrar código muerto de `index.tsx` | ESLint no reporta variables sin usar |
| 8 | Actualizar `tsconfig.json` paths si es necesario | Imports `@/stores/*` resuelven |

---

## Notas Técnicas

### Sobre `globalThis.prompt`

El código actual usa `globalThis.prompt` para pedir la contraseña de backup. Esto **falla silenciosamente en iOS/Android** porque React Native no tiene `window.prompt`. La solución propuesta (modal custom) funciona en todas las plataformas.

### Sobre re-renders

Con Zustand, cada componente solo se re-renderiza cuando cambia el slice que consume. Por ejemplo:

```ts
// Esto solo re-renderiza cuando cambia vaultOpen
const vaultOpen = useHomeStore((s) => s.vaultOpen);

// Esto re-renderiza cuando cambia CUALQUIER cosa del store
const state = useHomeStore(); // ❌ evitar
```

### Sobre imports dinámicos

El código actual hace `await import('@/lib/storage')` dentro de handlers. Con el store y hooks, todas las importaciones pueden ser estáticas en la cabecera, mejorando el tree-shaking y el análisis de TypeScript.

---

## Próximos pasos post-refactor

1. **Testing**: Agregar Jest + React Native Testing Library para los hooks extraídos.
2. **CI/CD**: Workflow de GitHub Actions con `tsc --noEmit` y lint en cada PR.
3. **Feature flags**: Sistema simple para activar/desactivar módulos experimentales.
4. **Biometría**: Integrar `expo-local-authentication` como alternativa al PIN.

---

> Generado para el repositorio [m1976cl-web/compatikink](https://github.com/m1976cl-web/compatikink)
