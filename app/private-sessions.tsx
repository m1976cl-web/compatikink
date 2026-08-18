import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { VaultLockGate } from '@/components/VaultLockGate';
import { ScreenContainer } from '@/components/ScreenContainer';
import { 
  PrivateSession, 
  SessionGearItem, 
  getPrivateSessions, 
  savePrivateSession, 
  createEmptyPrivateSession,
  deletePrivateSession
} from '@/lib/privateSessions';
import { BagCheckModal } from '@/components/sessions/BagCheckModal';
import { colors, fonts, fontSize, radii, spacing, typography } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GearItem } from './gear-closet';

const ROLE_TAGS = ['Dom/Top', 'Sub/Bottom', 'Switch', 'Rigger', 'Modelo Cuerdas', 'Keyholder', 'Portador'];
const ACTIVITY_TAGS = ['Shibari', 'Impacto/Spanking', 'Cera', 'Temperatura', 'Restricción', 'Roleplay', 'Castidad', 'Sensorial'];
const SENSATION_TAGS = ['Calor', 'Frío', 'Cosquilleo', 'Dolor Dulce', 'Electricidad', 'Tensión', 'Contención', 'Fatiga Placentera'];
const FEELING_TAGS = ['Subspace', 'Domspace', 'Vulnerabilidad', 'Conexión Profunda', 'Euforia', 'Trance', 'Paz', 'Catarsis', 'Gratitud'];

export default function PrivateSessionsScreen() {
  const router = useRouter();
  const { new: isNew, gearIds } = useLocalSearchParams<{ new?: string, gearIds?: string }>();
  
  const [sessions, setSessions] = useState<PrivateSession[]>([]);
  const [activeSession, setActiveSession] = useState<PrivateSession | null>(null);
  const [isBagCheckVisible, setIsBagCheckVisible] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (isNew === 'true') {
      handleCreateNew(gearIds);
    }
  }, [isNew, gearIds]);

  const loadSessions = async () => {
    const list = await getPrivateSessions();
    setSessions(list.sort((a, b) => {
      const dateA = a.date || '';
      const dateB = b.date || '';
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    }));
  };

  const handleCreateNew = async (initialGearIds?: string) => {
    const session = createEmptyPrivateSession();
    
    if (initialGearIds) {
      try {
        const ids = initialGearIds.split(',');
        const raw = await AsyncStorage.getItem('user_gear_closet_items_v2');
        if (raw) {
          const closetItems: GearItem[] = JSON.parse(raw);
          const matched = closetItems.filter(g => ids.includes(g.id));
          session.gearInventory = matched.map(m => ({
            id: m.id,
            name: m.name,
            category: m.category,
            photoUri: m.photoUri,
            packedOut: true,
            packedIn: false
          }));
        }
      } catch (e) {
        console.error('Failed to import gear', e);
      }
    }
    
    setActiveSession(session);
  };

  const handleSaveSession = async () => {
    if (!activeSession) return;
    
    let sessionToSave = { ...activeSession };
    if (!sessionToSave.title?.trim()) {
      sessionToSave.title = `Sesión del ${sessionToSave.date || 'hoy'}`;
    }
    
    await savePrivateSession(sessionToSave);
    setActiveSession(null);
    loadSessions();
    Alert.alert('Guardado', 'Sesión guardada encriptada en tu bóveda.');
  };

  const toggleTag = (field: 'roles' | 'activities' | 'sensations' | 'feelings', tag: string) => {
    if (!activeSession) return;
    const currentTags = activeSession[field] || [];
    const isSelected = currentTags.includes(tag);
    let newTags = [...currentTags];
    if (isSelected) {
      newTags = newTags.filter(e => e !== tag);
    } else {
      newTags.push(tag);
    }
    setActiveSession({ ...activeSession, [field]: newTags });
  };

  const renderTags = (field: 'roles' | 'activities' | 'sensations' | 'feelings', allTags: string[]) => {
    return (
      <View style={styles.tagsContainer}>
        {allTags.map(tag => {
          const selected = (activeSession?.[field] || []).includes(tag);
          return (
            <TouchableOpacity 
              key={tag} 
              style={[styles.tag, selected && styles.tagSelected]}
              onPress={() => toggleTag(field, tag)}
            >
              <Text style={[styles.tagText, selected && styles.tagTextSelected]}>{tag}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderStars = (value?: number, onChange?: (v: number) => void) => {
    return (
      <View style={{ flexDirection: 'row', gap: spacing.md, justifyContent: 'center', marginTop: spacing.sm }}>
        {[1, 2, 3, 4, 5, 6, 7].map(star => {
          const isSelected = value === star;
          return (
            <TouchableOpacity 
              key={star} 
              onPress={() => onChange?.(star)}
              style={[
                styles.ratingCircle, 
                isSelected ? styles.ratingCircleSelected : null
              ]}
            >
              <Text style={[
                styles.ratingText, 
                isSelected ? styles.ratingTextSelected : null
              ]}>
                {star}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  if (activeSession) {
    return (
      <VaultLockGate>
        <ScreenContainer title="Nueva Sesión">
          <TouchableOpacity onPress={() => setActiveSession(null)} style={{ paddingHorizontal: spacing.md, marginBottom: spacing.md }}>
            <Text style={{ color: colors.primary, fontSize: fontSize.md }}>← Volver</Text>
          </TouchableOpacity>
          <ScrollView style={styles.formContainer} contentContainerStyle={{ paddingBottom: 60 }}>
            
            <View style={styles.card}>
              <Text style={styles.label}>Título (Opcional)</Text>
              <TextInput 
                style={styles.input} 
                value={activeSession.title || ''} 
                onChangeText={v => setActiveSession({ ...activeSession, title: v })}
                placeholder={`Ej. Sesión del ${activeSession.date || 'hoy'}`}
                placeholderTextColor={colors.textMuted}
              />
              
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>📍 Lugar</Text>
                  <TextInput 
                    style={styles.input} 
                    value={activeSession.location || ''} 
                    onChangeText={v => setActiveSession({ ...activeSession, location: v })}
                    placeholder="Ej. Mi casa"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>📅 Fecha</Text>
                  <TextInput 
                    style={styles.input} 
                    value={activeSession.date || ''} 
                    onChangeText={v => setActiveSession({ ...activeSession, date: v })}
                    placeholder="YYYY-MM-DD o texto"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>

              <Text style={styles.label}>👥 Participaron</Text>
              <TextInput 
                style={styles.input} 
                value={activeSession.participants || ''} 
                onChangeText={v => setActiveSession({ ...activeSession, participants: v })}
                placeholder="Ej. Alex, Pareja, Trío..."
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>🎭 Roles</Text>
              {renderTags('roles', ROLE_TAGS)}
              <TextInput 
                style={[styles.input, { marginTop: spacing.sm }]} 
                placeholder="Añadir otro rol..."
                placeholderTextColor={colors.textMuted}
                onSubmitEditing={(e) => {
                  const val = e.nativeEvent.text.trim();
                  if(val) toggleTag('roles', val);
                  (e.currentTarget as any).clear();
                }}
              />

              <Text style={[styles.cardTitle, { marginTop: spacing.md }]}>🪢 Actividades Hechas</Text>
              {renderTags('activities', ACTIVITY_TAGS)}
              <TextInput 
                style={[styles.input, { marginTop: spacing.sm }]} 
                placeholder="Añadir otra actividad..."
                placeholderTextColor={colors.textMuted}
                onSubmitEditing={(e) => {
                  const val = e.nativeEvent.text.trim();
                  if(val) toggleTag('activities', val);
                  (e.currentTarget as any).clear();
                }}
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>⚡ Sensaciones</Text>
              {renderTags('sensations', SENSATION_TAGS)}
              <TextInput 
                style={[styles.input, { marginTop: spacing.sm }]} 
                placeholder="Añadir otra sensación..."
                placeholderTextColor={colors.textMuted}
                onSubmitEditing={(e) => {
                  const val = e.nativeEvent.text.trim();
                  if(val) toggleTag('sensations', val);
                  (e.currentTarget as any).clear();
                }}
              />

              <Text style={[styles.cardTitle, { marginTop: spacing.md }]}>💭 Sentimientos / Emociones</Text>
              {renderTags('feelings', FEELING_TAGS)}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>📊 Nota de 1 a 7</Text>
              {renderStars(activeSession.rating1to7, v => setActiveSession({ ...activeSession, rating1to7: v }))}
              
              <Text style={[styles.cardTitle, { marginTop: spacing.md, textAlign: 'center' }]}>🔄 ¿Repetiría la sesión?</Text>
              <View style={styles.repeatRow}>
                <TouchableOpacity 
                  style={[styles.repeatBtn, activeSession.wouldRepeat === 'yes' && styles.repeatBtnSelected]}
                  onPress={() => setActiveSession({ ...activeSession, wouldRepeat: 'yes' })}
                >
                  <Text style={styles.repeatBtnText}>💚 SÍ</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.repeatBtn, activeSession.wouldRepeat === 'maybe' && styles.repeatBtnSelected]}
                  onPress={() => setActiveSession({ ...activeSession, wouldRepeat: 'maybe' })}
                >
                  <Text style={styles.repeatBtnText}>💛 QUIZÁS</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.repeatBtn, activeSession.wouldRepeat === 'no' && styles.repeatBtnSelected]}
                  onPress={() => setActiveSession({ ...activeSession, wouldRepeat: 'no' })}
                >
                  <Text style={styles.repeatBtnText}>🧡 NO</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>🎒 Control de Equipamiento & Bag Check</Text>
              <Text style={styles.desc}>Fotos Pre/Post y checklist de juguetes.</Text>
              
              <TouchableOpacity style={styles.primaryBtn} onPress={() => setIsBagCheckVisible(true)}>
                <Text style={styles.primaryBtnText}>📸 Abrir Bag Check ({(activeSession.gearInventory || []).length} ítems)</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>📝 Notas Libres / Debrief</Text>
              <TextInput 
                style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
                multiline
                value={activeSession.notes || ''} 
                onChangeText={v => setActiveSession({ ...activeSession, notes: v })}
                placeholder="Escribe lo que quieras recordar..."
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveSession}>
              <Text style={styles.saveBtnText}>💾 Guardar Sesión en Bóveda</Text>
            </TouchableOpacity>

          </ScrollView>

          <BagCheckModal 
            visible={isBagCheckVisible}
            onClose={() => setIsBagCheckVisible(false)}
            gearList={activeSession.gearInventory || []}
            onToggleItem={(id, packedIn) => {
              const newInv = (activeSession.gearInventory || []).map(g => g.id === id ? { ...g, packedIn } : g);
              setActiveSession({ ...activeSession, gearInventory: newInv });
            }}
            prePhotoUri={activeSession.prePhotoUri}
            postPhotoUri={activeSession.postPhotoUri}
            onSelectPhoto={(type, uri) => {
              setActiveSession({
                ...activeSession,
                ...(type === 'pre' ? { prePhotoUri: uri } : { postPhotoUri: uri })
              });
            }}
          />
        </ScreenContainer>
      </VaultLockGate>
    );
  }

  return (
    <VaultLockGate>
      <ScreenContainer title="🎒 Mis Sesiones & Debrief">
        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', paddingHorizontal: spacing.md, paddingBottom: spacing.sm }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: colors.primary, fontSize: fontSize.md }}>← Volver</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.container}>
          <TouchableOpacity style={styles.addBtn} onPress={() => handleCreateNew()}>
            <Text style={styles.addBtnText}>➕ Nueva Sesión</Text>
          </TouchableOpacity>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
            {sessions.length === 0 ? (
              <Text style={styles.emptyText}>Aún no has registrado ninguna sesión.</Text>
            ) : (
              sessions.map(session => {
                const unverified = (session.gearInventory || []).filter(g => !g.packedIn).length;
                return (
                  <TouchableOpacity key={session.id} style={styles.sessionCard} onPress={() => setActiveSession(session)}>
                    <View style={styles.sessionHeader}>
                      <Text style={styles.sessionTitle}>{session.title}</Text>
                      <Text style={styles.sessionDate}>{session.date}</Text>
                    </View>
                    
                    {session.location ? <Text style={styles.infoText}>📍 {session.location}</Text> : null}
                    
                    {session.rating1to7 !== undefined && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs }}>
                        <Text style={{ fontSize: fontSize.md, color: colors.primary }}>Nota: </Text>
                        <Text style={{ fontWeight: 'bold', color: colors.text, fontSize: fontSize.md }}>{session.rating1to7}/7</Text>
                      </View>
                    )}

                    {session.roles && session.roles.length > 0 && (
                      <View style={styles.emotionsRow}>
                        {session.roles.map(r => (
                          <View key={r} style={styles.smallTag}><Text style={styles.smallTagText}>{r}</Text></View>
                        ))}
                      </View>
                    )}

                    <View style={[styles.badge, unverified === 0 ? styles.badgeSuccess : styles.badgeWarning]}>
                      <Text style={styles.badgeText}>
                        {unverified === 0 ? '🎒 100% Empacado' : `⚠️ ${unverified} Ítems pendientes`}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </ScreenContainer>
    </VaultLockGate>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md },
  addBtn: { backgroundColor: colors.primary, padding: spacing.md, borderRadius: radii.md, alignItems: 'center', marginBottom: spacing.md },
  addBtnText: { color: colors.background, fontWeight: 'bold', fontSize: fontSize.md },
  emptyText: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl },
  
  sessionCard: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radii.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  sessionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: 'bold' },
  sessionDate: { color: colors.textMuted, fontSize: fontSize.sm },
  infoText: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: spacing.xs },
  emotionsRow: { flexDirection: 'row', marginTop: spacing.sm, flexWrap: 'wrap', gap: spacing.xs },
  smallTag: { backgroundColor: colors.background, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radii.sm, borderWidth: 1, borderColor: colors.border },
  smallTagText: { color: colors.text, fontSize: fontSize.xs },
  
  badge: { marginTop: spacing.md, padding: spacing.sm, borderRadius: radii.sm, alignSelf: 'flex-start' },
  badgeSuccess: { backgroundColor: 'rgba(76, 175, 80, 0.2)' },
  badgeWarning: { backgroundColor: 'rgba(255, 193, 7, 0.2)' },
  badgeText: { fontSize: fontSize.sm, fontWeight: 'bold', color: colors.text },

  formContainer: { flex: 1, padding: spacing.md },
  card: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radii.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  cardTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: 'bold', marginBottom: spacing.sm },
  desc: { color: colors.textMuted, fontSize: fontSize.sm, marginBottom: spacing.md },
  label: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: 'bold', marginBottom: spacing.xs, marginTop: spacing.sm },
  input: { backgroundColor: colors.background, color: colors.text, padding: spacing.sm, borderRadius: radii.sm, borderWidth: 1, borderColor: colors.border },
  row: { flexDirection: 'row' },

  primaryBtn: { backgroundColor: colors.background, padding: spacing.md, borderRadius: radii.md, alignItems: 'center', borderWidth: 1, borderColor: colors.primary },
  primaryBtnText: { color: colors.primary, fontWeight: 'bold' },

  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  tag: { backgroundColor: colors.background, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.border },
  tagSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  tagText: { color: colors.text, fontSize: fontSize.sm },
  tagTextSelected: { color: colors.background, fontWeight: 'bold' },

  ratingCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  ratingCircleSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  ratingText: { color: colors.text, fontWeight: 'bold', fontSize: fontSize.md },
  ratingTextSelected: { color: colors.background },

  repeatRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm, marginTop: spacing.sm },
  repeatBtn: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', backgroundColor: colors.background, borderRadius: radii.sm, borderWidth: 1, borderColor: colors.border },
  repeatBtnSelected: { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: colors.primary },
  repeatBtnText: { color: colors.text, fontWeight: 'bold', fontSize: fontSize.sm },

  saveBtn: { backgroundColor: colors.primary, padding: spacing.md, borderRadius: radii.md, alignItems: 'center', marginTop: spacing.sm },
  saveBtnText: { color: colors.background, fontWeight: 'bold', fontSize: fontSize.md }
});
