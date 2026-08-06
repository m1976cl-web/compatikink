import { useMemo } from 'react';
import { View, TextInput, ScrollView, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { ModuleTile } from '@/components/ModuleTile';
import { CategoryTabs, CategoryTab } from '@/components/CategoryTabs';
import { useHomeStore } from '@/lib/stores/useHomeStore';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { STATIC_MODULES, ACCENT_COLORS, CATEGORY_TABS } from '@/data/homeModules';
import { useResponsive } from '@/hooks/useResponsive';
import { exportUserDataJSON, importUserDataJSON } from '@/lib/storage';

export type ModuleDef = {
  title: string;
  description: string;
  mark: string;
  category: string;
  route?: string;
  onPress?: () => void;
};

interface ModuleGridProps {
  activeTab: string;
  onChangeTab: (tab: string) => void;
  searchQuery: string;
  onChangeSearch: (q: string) => void;
  onShowPWAInstallModal?: () => void;
  onShowA11yModal?: () => void;
}

export function ModuleGrid({
  activeTab,
  onChangeTab,
  searchQuery,
  onChangeSearch,
  onShowPWAInstallModal,
  onShowA11yModal,
}: ModuleGridProps) {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const vaultUnlocked = useHomeStore((s) => s.vaultUnlocked);
  const loadHomeData = useHomeStore((s) => s.loadHomeData);

  const handleBackup = () => {
    const askPassphrase = (title: string): string | null => {
      if (typeof globalThis !== 'undefined' && 'prompt' in globalThis) {
        return (globalThis as unknown as { prompt: (m: string) => string | null }).prompt(title);
      }
      return null;
    };
    Alert.alert('Copia de seguridad cifrada', 'Backups con PBKDF2 + AES-GCM.', [
      {
        text: 'Exportar',
        onPress: async () => {
          const passphrase = askPassphrase('Contraseña para cifrar el backup (mín. 4):');
          if (!passphrase || passphrase.length < 4) {
            Alert.alert('Cancelado', 'Se requiere contraseña.');
            return;
          }
          try {
            const json = await exportUserDataJSON(passphrase);
            await Clipboard.setStringAsync(json);
            Alert.alert('Backup listo', 'Ciphertext copiado. Guarda también tu contraseña.');
          } catch (e: any) {
            Alert.alert('Error', e?.message || 'No se pudo exportar.');
          }
        },
      },
      {
        text: 'Importar',
        onPress: async () => {
          const str = await Clipboard.getStringAsync();
          const passphrase = askPassphrase('Contraseña del backup (si está cifrado):') || undefined;
          try {
            const count = await importUserDataJSON(str, passphrase);
            Alert.alert('Restaurado', `Se restauraron ${count} registros locales.`);
            await loadHomeData();
          } catch (e: any) {
            Alert.alert('Error', e?.message || 'Backup inválido o contraseña incorrecta.');
          }
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const go = (path: string) => () => router.push(path as any);

  const allModules: ModuleDef[] = useMemo(
    () => [
      ...STATIC_MODULES,
      { title: 'Bóveda Privada', description: 'Álbum de fotos cifrado AES-GCM', mark: '🖼️', category: 'vault', route: '/private-album' },
      { title: 'Cuenta & Bóveda', description: 'Acceso Zero-Knowledge', mark: '🔑', category: 'vault', route: '/auth' },
      { title: 'Backup Cifrado', description: 'Exportar / importar en JSON', mark: '📦', category: 'vault', route: '/backup' },
      { title: 'Admin', description: 'Requiere bóveda + rol local', mark: '🛡️', category: 'vault', route: '/admin' },
      { title: 'Instalar App', description: 'PWA en el dispositivo', mark: '📱', category: 'vault', onPress: onShowPWAInstallModal },
      { title: 'Accesibilidad', description: 'Contraste y tipografía', mark: '♿', category: 'vault', onPress: onShowA11yModal },
    ],
    [onShowPWAInstallModal, onShowA11yModal]
  );

  const filteredModules = useMemo(() => {
    let list = allModules;

    // Filter by tab if search is empty
    if (!searchQuery.trim()) {
      list = list.filter((m) => m.category === activeTab);
    } else {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q)
      );
    }

    // Hide vault modules if vault is locked and active tab is vault
    if (activeTab === 'vault' && !vaultUnlocked && !searchQuery.trim()) {
      return list.filter((m) => m.route === '/auth');
    }

    return list;
  }, [allModules, activeTab, searchQuery, vaultUnlocked]);

  return (
    <View style={styles.container}>
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar módulos, herramientas o guías..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={onChangeSearch}
          clearButtonMode="while-editing"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => onChangeSearch('')} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {!searchQuery.trim() ? (
        <CategoryTabs
          tabs={CATEGORY_TABS}
          activeKey={activeTab}
          onTabChange={onChangeTab}
        />
      ) : (
        <Text style={styles.searchLabel}>
          Resultados de búsqueda ({filteredModules.length}):
        </Text>
      )}

      <View style={styles.grid}>
        {filteredModules.map((m, index) => (
          <View key={m.title} style={isDesktop ? styles.gridColDesktop : styles.gridColMobile}>
            <ModuleTile
              index={index}
              title={m.title}
              description={m.description}
              mark={m.mark}
              accent={ACCENT_COLORS[m.category] || colors.primary}
              onPress={m.onPress || (m.route ? go(m.route) : () => {})}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: spacing.xs },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(21,13,36,0.9)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(192,132,252,0.35)',
    paddingHorizontal: spacing.md,
    height: 48,
    marginBottom: spacing.xs,
  },
  searchIcon: { fontSize: 16, marginRight: spacing.xs },
  searchInput: { flex: 1, color: colors.text, fontFamily: fonts.body, fontSize: fontSize.md },
  clearBtn: { padding: spacing.xs },
  clearBtnText: { color: colors.textMuted, fontSize: 14, fontWeight: '700' },
  searchLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    color: colors.primary,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginHorizontal: -spacing.xs,
  },
  gridColDesktop: { width: '49%' },
  gridColMobile: { width: '100%' },
});
