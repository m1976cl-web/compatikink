import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, fontSize, radii, spacing, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useResponsive } from '@/hooks/useResponsive';
import { VaultLockGate } from '@/components/VaultLockGate';
import { DiplomaModal } from '@/components/DiplomaModal';
import {
  PartnerLink,
  SessionJournalEntry,
  PartnerChallenge,
  PartnerReward,
  KinkDiploma,
  RelationshipType,
  RELATIONSHIP_LABELS,
  getPartnerLinks,
  addPartnerLink,
  getJournalEntries,
  addJournalEntry,
  getChallenges,
  createChallenge,
  completeChallenge,
  getRewards,
  createReward,
  redeemReward,
  getDiplomas,
  addDiploma,
} from '@/lib/partnerJournal';
import { VaultLockGateAPI } from '@/lib/cryptoVault';
import { PartnerLinkCard } from '@/components/journal/PartnerLinkCard';

export default function PartnerJournalScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const [activeTab, setActiveTab] = useState<'links' | 'journal' | 'challenges' | 'diplomas'>('links');
  const [vaultUnlocked, setVaultUnlocked] = useState(() => VaultLockGateAPI.isUnlocked());

  // Data States
  const [partnerLinks, setPartnerLinks] = useState<PartnerLink[]>([]);
  const [journalEntries, setJournalEntries] = useState<SessionJournalEntry[]>([]);
  const [challenges, setChallenges] = useState<PartnerChallenge[]>([]);
  const [rewards, setRewards] = useState<PartnerReward[]>([]);
  const [diplomas, setDiplomas] = useState<KinkDiploma[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);

  // Form States
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerType, setNewPartnerType] = useState<RelationshipType>('pareja');
  
  // Journal Form
  const [sessionTitle, setSessionTitle] = useState('');
  const [activitiesDone, setActivitiesDone] = useState('');
  const [gearUsedInput, setGearUsedInput] = useState('');
  const [safewordUsed, setSafewordUsed] = useState<'ninguna' | 'verde' | 'amarillo' | 'rojo'>('ninguna');
  const [subspaceLevel, setSubspaceLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [aftercareRating, setAftercareRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [debriefNotes, setDebriefNotes] = useState('');

  // Challenge Form
  const [chTitle, setChTitle] = useState('');
  const [chDesc, setChDesc] = useState('');
  const [chXp, setChXp] = useState('100');

  // Reward Form
  const [rewTitle, setRewTitle] = useState('');
  const [rewCost, setRewCost] = useState('200');

  // Modal State
  const [selectedDiploma, setSelectedDiploma] = useState<KinkDiploma | null>(null);

  useEffect(() => {
    return VaultLockGateAPI.subscribe((snap) => setVaultUnlocked(snap.unlocked));
  }, []);

  useEffect(() => {
    if (vaultUnlocked) loadAllData();
  }, [vaultUnlocked, selectedPartnerId]);

  const loadAllData = async () => {
    const links = await getPartnerLinks();
    setPartnerLinks(links);
    if (links.length > 0 && !selectedPartnerId) {
      setSelectedPartnerId(links[0].id);
    }

    const jEntries = await getJournalEntries(selectedPartnerId ?? undefined);
    setJournalEntries(jEntries);

    if (selectedPartnerId) {
      const chs = await getChallenges(selectedPartnerId);
      setChallenges(chs);
      const rews = await getRewards(selectedPartnerId);
      setRewards(rews);
    }

    const dips = await getDiplomas();
    setDiplomas(dips);
  };

  const handleAddPartner = async () => {
    if (!newPartnerName.trim()) {
      Alert.alert('Nombre requerido', 'Ingresa el apodo o nombre de tu pareja/amigo de juego.');
      return;
    }
    const created = await addPartnerLink(newPartnerName.trim(), newPartnerType);
    setNewPartnerName('');
    setSelectedPartnerId(created.id);
    Alert.alert('Vínculo Creado 🔗', `Se ha creado el vínculo con ${created.partnerName}.`);
    await loadAllData();
  };

  const handleSaveJournalEntry = async () => {
    if (!sessionTitle.trim() || !selectedPartnerId) {
      Alert.alert('Título requerido', 'Selecciona un vínculo e ingresa un título para la sesión.');
      return;
    }
    const activeLink = partnerLinks.find((l) => l.id === selectedPartnerId);
    if (!activeLink) return;

    await addJournalEntry({
      partnerLinkId: selectedPartnerId,
      partnerName: activeLink.partnerName,
      title: sessionTitle.trim(),
      activitiesDone: activitiesDone.split(',').map((s) => s.trim()).filter(Boolean),
      gearUsed: gearUsedInput.split(',').map((s) => s.trim()).filter(Boolean),
      safewordUsed,
      subspaceLevel,
      aftercareRating,
      overallRating: 5,
      debriefNotes: debriefNotes.trim(),
    });

    setSessionTitle('');
    setActivitiesDone('');
    setGearUsedInput('');
    setDebriefNotes('');
    Alert.alert('Sesión Registrada 📖', 'Se ha guardado tu diario de sesión con debriefing (+50 XP de afinidad otorgados).');
    await loadAllData();
  };

  const handleCreateChallenge = async () => {
    if (!chTitle.trim() || !selectedPartnerId) {
      Alert.alert('Campo requerido', 'Ingresa un título para el desafío.');
      return;
    }
    await createChallenge(selectedPartnerId, chTitle.trim(), chDesc.trim(), parseInt(chXp) || 100);
    setChTitle('');
    setChDesc('');
    Alert.alert('Desafío Propuesto 🎯', 'El desafío está activo para tu pareja/amigo de juego.');
    await loadAllData();
  };

  const handleCompleteChallenge = async (chId: string) => {
    await completeChallenge(chId);
    Alert.alert('¡Desafío Ganado! 🎉', '¡Felicidades! Han obtenido los puntos XP de afinidad.');
    await loadAllData();
  };

  const handleCreateReward = async () => {
    if (!rewTitle.trim() || !selectedPartnerId) {
      Alert.alert('Campo requerido', 'Ingresa un nombre para la recompensa.');
      return;
    }
    await createReward(selectedPartnerId, rewTitle.trim(), parseInt(rewCost) || 200);
    setRewTitle('');
    Alert.alert('Recompensa Creada 🎁', 'Recompensa disponible en la tienda de pareja.');
    await loadAllData();
  };

  const handleRedeemReward = async (rewId: string) => {
    const success = await redeemReward(rewId);
    if (success) {
      Alert.alert('¡Recompensa Canjeada! 👑', '¡Puntos descontados con éxito! Disfruta tu premio concedido.');
    } else {
      Alert.alert('Puntos insuficientes', 'Tu vínculo no tiene suficientes puntos XP acumulados aún.');
    }
    await loadAllData();
  };

  const activePartner = partnerLinks.find((l) => l.id === selectedPartnerId);

  return (
    <ScreenContainer title="Vínculos & Diario" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Vínculos, Diario & Desafíos 🔗</Text>
          <Text style={styles.subtitle}>
            Bitácora confidencial de parejas, debriefing post-escena, sistema de XP y diplomas cifrados
          </Text>
        </View>

        <VaultLockGate
          title="Bóveda de Vínculos & Diario"
          subtitle="Desbloquea con tu PIN para acceder al diario cifrado y tus acuerdos."
          showLockButton
        >
          {/* Main Navigation Tabs */}
          <View style={styles.tabsRow}>
            {[
              { key: 'links', label: '🔗 Vínculos' },
              { key: 'journal', label: '📖 Diario & Debrief' },
              { key: 'challenges', label: '🎯 Desafíos & XP' },
              { key: 'diplomas', label: '📜 Diplomas' },
            ].map((t) => (
              <TouchableOpacity
                key={t.key}
                style={[styles.tab, activeTab === t.key && styles.tabActive]}
                onPress={() => setActiveTab(t.key as any)}
              >
                <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* TAB 1: VÍNCULOS DE PAREJA */}
            {activeTab === 'links' && (
              <View style={styles.sectionGap}>
                <View style={styles.cardBox}>
                  <Text style={styles.cardBoxTitle}>➕ Crear Nuevo Vínculo (Pareja / Playmate)</Text>

                  <Text style={styles.fieldLabel}>Nombre / Apodo de tu Vínculo</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: Morgan, Sam, Mi Sumisa..."
                    placeholderTextColor={colors.textDim}
                    value={newPartnerName}
                    onChangeText={setNewPartnerName}
                  />

                  <Text style={styles.fieldLabel}>Tipo de Relación / Dinámica</Text>
                  <View style={styles.chipGrid}>
                    {(Object.keys(RELATIONSHIP_LABELS) as RelationshipType[]).map((type) => {
                      const sel = newPartnerType === type;
                      return (
                        <TouchableOpacity
                          key={type}
                          style={[styles.chip, sel && styles.chipActive]}
                          onPress={() => setNewPartnerType(type)}
                        >
                          <Text style={[styles.chipText, sel && styles.chipTextActive]}>
                            {RELATIONSHIP_LABELS[type].emoji} {RELATIONSHIP_LABELS[type].label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <TouchableOpacity style={styles.primaryBtn} onPress={handleAddPartner}>
                    <Text style={styles.primaryBtnText}>Vincular Pareja 🔗</Text>
                  </TouchableOpacity>
                </View>

                {/* List of active partner links */}
                <Text style={styles.sectionHeader}>Mis Vínculos Activos ({partnerLinks.length}):</Text>
                {partnerLinks.map((link) => (
                  <PartnerLinkCard
                    key={link.id}
                    link={link}
                    isSelected={selectedPartnerId === link.id}
                    onSelect={setSelectedPartnerId}
                  />
                ))}
              </View>
            )}

            {/* TAB 2: DIARIO DE SESIONES & DEBRIEFING */}
            {activeTab === 'journal' && (
              <View style={styles.sectionGap}>
                <View style={styles.cardBox}>
                  <Text style={styles.cardBoxTitle}>📖 Registrar Nueva Sesión & Debriefing</Text>
                  
                  {activePartner ? (
                    <Text style={styles.activePartnerBanner}>
                      Vínculo Seleccionado: <Text style={{ color: colors.primary, fontWeight: '800' }}>{activePartner.partnerName}</Text>
                    </Text>
                  ) : (
                    <Text style={styles.warningBanner}>⚠️ Crea o selecciona un vínculo arriba antes de registrar.</Text>
                  )}

                  <Text style={styles.fieldLabel}>Título de la Escena / Sesión</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: Noche de Shibari & Sensaciones, Protocolo Dominante..."
                    placeholderTextColor={colors.textDim}
                    value={sessionTitle}
                    onChangeText={setSessionTitle}
                  />

                  <Text style={styles.fieldLabel}>Prácticas Realizadas (sep. por coma)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: Ataduras, Spanking, Cera tibia, Aftercare"
                    placeholderTextColor={colors.textDim}
                    value={activitiesDone}
                    onChangeText={setActivitiesDone}
                  />

                  <Text style={styles.fieldLabel}>🧰 Juguetes y Equipamiento Utilizados (sep. por coma)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: Cuerdas Yute 6mm, Pala de cuero, Antaz de seda"
                    placeholderTextColor={colors.textDim}
                    value={gearUsedInput}
                    onChangeText={setGearUsedInput}
                  />

                  <Text style={styles.fieldLabel}>Safeword Utilizada en la Escena</Text>
                  <View style={styles.chipGrid}>
                    {(['ninguna', 'verde', 'amarillo', 'rojo'] as const).map((sw) => (
                      <TouchableOpacity
                        key={sw}
                        style={[styles.chip, safewordUsed === sw && styles.chipActive]}
                        onPress={() => setSafewordUsed(sw)}
                      >
                        <Text style={[styles.chipText, safewordUsed === sw && styles.chipTextActive]}>
                          {sw === 'ninguna' ? '✓ Ninguna (Fluido)' : sw === 'verde' ? '🟢 Verde' : sw === 'amarillo' ? '🟡 Amarillo' : '🔴 Rojo'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.fieldLabel}>Profundidad de Subspace / Trance (1 a 5)</Text>
                  <View style={styles.chipGrid}>
                    {([1, 2, 3, 4, 5] as const).map((lvl) => (
                      <TouchableOpacity
                        key={lvl}
                        style={[styles.chip, subspaceLevel === lvl && styles.chipActive]}
                        onPress={() => setSubspaceLevel(lvl)}
                      >
                        <Text style={[styles.chipText, subspaceLevel === lvl && styles.chipTextActive]}>
                          {'★'.repeat(lvl)} ({lvl})
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.fieldLabel}>Evaluación del Aftercare (1 a 5)</Text>
                  <View style={styles.chipGrid}>
                    {([1, 2, 3, 4, 5] as const).map((rating) => (
                      <TouchableOpacity
                        key={rating}
                        style={[styles.chip, aftercareRating === rating && styles.chipActive]}
                        onPress={() => setAftercareRating(rating)}
                      >
                        <Text style={[styles.chipText, aftercareRating === rating && styles.chipTextActive]}>
                          {'🫂'.repeat(rating)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.fieldLabel}>Notas Privadas de Debriefing</Text>
                  <TextInput
                    style={[styles.input, { height: 70 }]}
                    placeholder="¿Cómo se sintieron después? Reflexiones, cosas a mejorar..."
                    placeholderTextColor={colors.textDim}
                    value={debriefNotes}
                    onChangeText={setDebriefNotes}
                    multiline
                  />

                  <TouchableOpacity style={styles.primaryBtn} onPress={handleSaveJournalEntry}>
                    <Text style={styles.primaryBtnText}>Guardar en Diario Cifrado 📖</Text>
                  </TouchableOpacity>
                </View>

                {/* History of logged journal entries */}
                <Text style={styles.sectionHeader}>Historial de Sesiones Cifradas ({journalEntries.length}):</Text>
                {journalEntries.map((j) => (
                  <View key={j.id} style={styles.journalCard}>
                    <View style={styles.journalHeader}>
                      <Text style={styles.journalTitle}>{j.title}</Text>
                      <Text style={styles.journalDate}>{new Date(j.date).toLocaleDateString()}</Text>
                    </View>
                    <Text style={styles.journalPartner}>Vínculo: {j.partnerName}</Text>
                    
                    {j.activitiesDone.length > 0 && (
                      <Text style={styles.journalSub}>Practicas: {j.activitiesDone.join(' · ')}</Text>
                    )}
                    {j.gearUsed.length > 0 && (
                      <Text style={styles.journalGear}>🧰 Equipamiento: {j.gearUsed.join(' · ')}</Text>
                    )}

                    <View style={styles.journalMetaRow}>
                      <Text style={styles.metaBadge}>Safeword: {j.safewordUsed.toUpperCase()}</Text>
                      <Text style={styles.metaBadge}>Subspace: {'★'.repeat(j.subspaceLevel)}</Text>
                      <Text style={styles.metaBadge}>Aftercare: {'🫂'.repeat(j.aftercareRating)}</Text>
                    </View>

                    {j.debriefNotes ? <Text style={styles.debriefNotesText}>"{j.debriefNotes}"</Text> : null}
                  </View>
                ))}
              </View>
            )}

            {/* TAB 3: DESAFÍOS & ECONOMÍA DE PUNTOS (XP) */}
            {activeTab === 'challenges' && (
              <View style={styles.sectionGap}>
                {activePartner ? (
                  <View style={styles.xpBanner}>
                    <Text style={styles.xpBannerTitle}>
                      Puntos XP con {activePartner.partnerName}: <Text style={{ color: '#fbbf24' }}>{activePartner.totalXp} XP</Text> (Nivel {activePartner.level})
                    </Text>
                  </View>
                ) : null}

                {/* Create Challenge Form */}
                <View style={styles.cardBox}>
                  <Text style={styles.cardBoxTitle}>🎯 Proponer Nuevo Desafío en Pareja</Text>

                  <Text style={styles.fieldLabel}>Título del Desafío</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: Masaje tántrico de 20 min, Día de protocolo..."
                    placeholderTextColor={colors.textDim}
                    value={chTitle}
                    onChangeText={setChTitle}
                  />

                  <Text style={styles.fieldLabel}>Descripción del Reto</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Detalles o instrucciones del desafío..."
                    placeholderTextColor={colors.textDim}
                    value={chDesc}
                    onChangeText={setChDesc}
                  />

                  <TouchableOpacity style={styles.primaryBtn} onPress={handleCreateChallenge}>
                    <Text style={styles.primaryBtnText}>Publicar Desafío 🎯</Text>
                  </TouchableOpacity>
                </View>

                {/* Active Challenges List */}
                <Text style={styles.sectionHeader}>Desafíos Activos ({challenges.length}):</Text>
                {challenges.map((ch) => (
                  <View key={ch.id} style={styles.challengeCard}>
                    <View style={styles.chHeader}>
                      <Text style={styles.chTitle}>{ch.title}</Text>
                      <Text style={styles.chXp}>+{ch.xpReward} XP</Text>
                    </View>
                    {ch.description ? <Text style={styles.chDesc}>{ch.description}</Text> : null}

                    {ch.completed ? (
                      <Text style={styles.completedText}>✓ Completado el {new Date(ch.completedAt!).toLocaleDateString()}</Text>
                    ) : (
                      <TouchableOpacity style={styles.completeBtn} onPress={() => handleCompleteChallenge(ch.id)}>
                        <Text style={styles.completeBtnText}>Marcar como Cumplido ✓</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}

                {/* Create & Redeem Rewards Shop */}
                <View style={styles.cardBox}>
                  <Text style={styles.cardBoxTitle}>🎁 Tienda de Recompensas de Pareja</Text>
                  <Text style={styles.fieldLabel}>Crear Nueva Recompensa Canjeable</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: 1 Deseo Concedido, Elección de próxima escena..."
                    placeholderTextColor={colors.textDim}
                    value={rewTitle}
                    onChangeText={setRewTitle}
                  />
                  <TouchableOpacity style={styles.primaryBtn} onPress={handleCreateReward}>
                    <Text style={styles.primaryBtnText}>Agregar Recompensa 🎁</Text>
                  </TouchableOpacity>

                  <Text style={[styles.sectionHeader, { marginTop: 12 }]}>Recompensas Disponibles ({rewards.length}):</Text>
                  {rewards.map((rew) => (
                    <View key={rew.id} style={styles.rewardCard}>
                      <View style={styles.chHeader}>
                        <Text style={styles.chTitle}>{rew.title}</Text>
                        <Text style={styles.rewCost}>{rew.xpCost} XP</Text>
                      </View>
                      {rew.redeemed ? (
                        <Text style={styles.completedText}>👑 Canjeado el {new Date(rew.redeemedAt!).toLocaleDateString()}</Text>
                      ) : (
                        <TouchableOpacity style={styles.redeemBtn} onPress={() => handleRedeemReward(rew.id)}>
                          <Text style={styles.redeemBtnText}>Canjear Recompensa 👑</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* TAB 4: DIPLOMAS & CERTIFICADOS */}
            {activeTab === 'diplomas' && (
              <View style={styles.sectionGap}>
                <Text style={styles.sectionHeader}>Diplomas y Certificados Cifrados ({diplomas.length}):</Text>
                <View style={styles.diplomaGrid}>
                  {diplomas.map((dip) => (
                    <TouchableOpacity
                      key={dip.id}
                      style={styles.diplomaCard}
                      onPress={() => setSelectedDiploma(dip)}
                    >
                      <Text style={styles.diplomaEmoji}>{dip.sealEmoji || '📜'}</Text>
                      <Text style={styles.diplomaTitle}>{dip.title}</Text>
                      <Text style={styles.diplomaCategory}>{dip.practiceCategory}</Text>
                      <Text style={styles.diplomaRecipient}>Otorgado a: {dip.recipientName}</Text>

                      <View style={styles.viewCertBtn}>
                        <Text style={styles.viewCertBtnText}>Ver Diploma Cifrado 📜</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={{ height: 60 }} />
          </ScrollView>
        </VaultLockGate>
      </View>

      {/* Diploma Modal */}
      <DiplomaModal
        visible={selectedDiploma !== null}
        diploma={selectedDiploma}
        onClose={() => setSelectedDiploma(null)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 760, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: fontSize.sm },
  title: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: fontSize.xxl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.sm },

  tabsRow: { flexDirection: 'row', gap: spacing.xs, marginVertical: spacing.sm },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.primary,
  },
  tabText: {
    fontFamily: fonts.bodySemi,
    color: colors.textMuted,
    fontSize: 11,
  },
  tabTextActive: { color: colors.primary },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },
  sectionGap: { gap: spacing.md },

  cardBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: spacing.sm,
  },
  cardBoxTitle: {
    fontFamily: fonts.bodySemi,
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '800',
  },
  activePartnerBanner: {
    backgroundColor: 'rgba(192, 132, 252, 0.12)',
    borderRadius: radii.md,
    padding: spacing.sm,
    color: colors.text,
    fontSize: fontSize.xs,
  },
  warningBanner: {
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderRadius: radii.md,
    padding: spacing.sm,
    color: colors.warning,
    fontSize: fontSize.xs,
  },
  fieldLabel: { ...typography.label, marginTop: 4 },
  input: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.primary,
  },
  chipText: { color: colors.textMuted, fontSize: fontSize.xs },
  chipTextActive: { color: colors.primary, fontWeight: '800' },

  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    marginTop: 6,
  },
  primaryBtnText: { fontFamily: fonts.bodySemi, color: colors.onPrimary, fontSize: fontSize.sm, fontWeight: '800' },

  sectionHeader: { fontFamily: fonts.bodySemi, color: colors.text, fontSize: fontSize.sm, fontWeight: '800', marginTop: 4 },
  partnerCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: 4,
  },
  partnerCardActive: { borderColor: colors.primary, backgroundColor: 'rgba(192, 132, 252, 0.08)' },
  partnerCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  partnerName: { color: colors.text, fontSize: fontSize.md, fontFamily: fonts.bodySemi, fontWeight: '800' },
  relBadge: { backgroundColor: colors.accentSoft, borderRadius: radii.sm, paddingHorizontal: 8, paddingVertical: 2 },
  relBadgeText: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '700' },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  xpText: { color: '#fbbf24', fontSize: fontSize.xs, fontWeight: '800' },
  dateText: { color: colors.textDim, fontSize: 10 },
  chatLinkBtn: {
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 6,
    alignItems: 'center',
    marginTop: 6,
  },
  chatLinkBtnText: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '800' },

  journalCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: 4,
  },
  journalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  journalTitle: { color: colors.text, fontSize: fontSize.sm, fontWeight: '800' },
  journalDate: { color: colors.textDim, fontSize: 10 },
  journalPartner: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '700' },
  journalSub: { color: colors.textMuted, fontSize: fontSize.xs },
  journalGear: { color: '#fbbf24', fontSize: fontSize.xs },
  journalMetaRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 4 },
  metaBadge: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, color: colors.textMuted, fontSize: 10 },
  debriefNotesText: { color: colors.text, fontStyle: 'italic', fontSize: fontSize.xs, marginTop: 4 },

  xpBanner: {
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  xpBannerTitle: { color: colors.text, fontSize: fontSize.sm, fontWeight: '800' },

  challengeCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: 4,
  },
  chHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chTitle: { color: colors.text, fontSize: fontSize.sm, fontWeight: '800' },
  chXp: { color: '#fbbf24', fontSize: fontSize.xs, fontWeight: '900' },
  chDesc: { color: colors.textMuted, fontSize: fontSize.xs },
  completeBtn: { backgroundColor: 'rgba(74, 222, 128, 0.15)', borderWidth: 1, borderColor: colors.success, borderRadius: radii.md, paddingVertical: 6, alignItems: 'center', marginTop: 4 },
  completeBtnText: { color: colors.success, fontSize: fontSize.xs, fontWeight: '800' },
  completedText: { color: colors.success, fontSize: fontSize.xs, fontWeight: '800', marginTop: 2 },

  rewardCard: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    padding: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  rewCost: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '800' },
  redeemBtn: { backgroundColor: colors.primary, borderRadius: radii.sm, paddingVertical: 4, alignItems: 'center', marginTop: 2 },
  redeemBtnText: { color: colors.onPrimary, fontSize: 11, fontWeight: '800' },

  diplomaGrid: { gap: spacing.md },
  diplomaCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: '#fbbf24',
    alignItems: 'center',
    gap: 4,
  },
  diplomaEmoji: { fontSize: 36 },
  diplomaTitle: { color: '#fbbf24', fontSize: fontSize.md, fontWeight: '800', textAlign: 'center' },
  diplomaCategory: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '700' },
  diplomaRecipient: { color: colors.textMuted, fontSize: fontSize.xs },
  viewCertBtn: { backgroundColor: 'rgba(251, 191, 36, 0.15)', borderWidth: 1, borderColor: '#fbbf24', borderRadius: radii.md, paddingHorizontal: 12, paddingVertical: 6, marginTop: 6 },
  viewCertBtnText: { color: '#fbbf24', fontSize: fontSize.xs, fontWeight: '800' },
});
