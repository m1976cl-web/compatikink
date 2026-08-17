import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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
} from '@/lib/partnerJournal';
import { VaultLockGateAPI, readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';
import { PartnerLinksTab } from '@/components/journal/PartnerLinksTab';
import { JournalEntriesTab } from '@/components/journal/JournalEntriesTab';
import { PartnerChallengesTab } from '@/components/journal/PartnerChallengesTab';
import { KinkDiplomasTab } from '@/components/journal/KinkDiplomasTab';
import { BurnoutAssessmentTab, BurnoutCheckIn } from '@/components/journal/BurnoutAssessmentTab';

const STORAGE_KEY_BURNOUT = 'kink_burnout_checkins_v1';

export default function PartnerJournalScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const [activeTab, setActiveTab] = useState<'links' | 'journal' | 'challenges' | 'diplomas' | 'burnout'>('links');
  const [vaultUnlocked, setVaultUnlocked] = useState(() => VaultLockGateAPI.isUnlocked());

  // Burnout Assessment State
  const [physicalFatigue, setPhysicalFatigue] = useState(2);
  const [emotionalBattery, setEmotionalBattery] = useState(2);
  const [aftercareQuality, setAftercareQuality] = useState(4);
  const [burnoutLogs, setBurnoutLogs] = useState<BurnoutCheckIn[]>([]);

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

  // Reward Form
  const [rewTitle, setRewTitle] = useState('');

  // Modal State
  const [selectedDiploma, setSelectedDiploma] = useState<KinkDiploma | null>(null);

  useEffect(() => {
    readJsonStorage<BurnoutCheckIn[]>(STORAGE_KEY_BURNOUT, []).then((saved: BurnoutCheckIn[]) => {
      if (Array.isArray(saved)) setBurnoutLogs(saved);
    });
  }, []);

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

  const handleSaveBurnoutCheckin = async () => {
    const totalScore = physicalFatigue + emotionalBattery + (6 - aftercareQuality);
    let rec = '🟢 Bajo Riesgo: Excelente equilibrio en tus dinámicas.';
    if (totalScore >= 10) {
      rec = '🔴 Alto Riesgo de Burnout: Se recomienda activar el Protocolo de Pausa Consensuada D/s y priorizar descanso.';
    } else if (totalScore >= 7) {
      rec = '🟡 Riesgo Moderado: Aumentar el tiempo de Aftercare y la frecuencia de check-ins verbales.';
    }

    const entry: BurnoutCheckIn = {
      id: `bo-${Date.now()}`,
      timestamp: new Date().toISOString().split('T')[0],
      physicalFatigue,
      emotionalBattery,
      aftercareQuality,
      totalScore,
      recommendation: rec,
    };

    const nextLogs = [entry, ...burnoutLogs];
    setBurnoutLogs(nextLogs);
    await writeJsonStorage(STORAGE_KEY_BURNOUT, nextLogs);
    Alert.alert('Diagnóstico Registrado 📊', `${rec}`);
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
    await createChallenge(selectedPartnerId, chTitle.trim(), chDesc.trim(), 100);
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
    await createReward(selectedPartnerId, rewTitle.trim(), 200);
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
              { key: 'journal', label: '📖 Diario' },
              { key: 'challenges', label: '🎯 Desafíos' },
              { key: 'diplomas', label: '📜 Diplomas' },
              { key: 'burnout', label: '📊 Burnout' },
            ].map((t) => (
              <TouchableOpacity
                key={t.key}
                style={[styles.tab, activeTab === t.key && styles.tabActive]}
                onPress={() => setActiveTab(t.key as any)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {activeTab === 'links' && (
              <PartnerLinksTab
                newPartnerName={newPartnerName}
                setNewPartnerName={setNewPartnerName}
                newPartnerType={newPartnerType}
                setNewPartnerType={setNewPartnerType}
                onAddPartner={handleAddPartner}
                partnerLinks={partnerLinks}
                selectedPartnerId={selectedPartnerId}
                onSelectPartner={setSelectedPartnerId}
              />
            )}

            {activeTab === 'journal' && (
              <JournalEntriesTab
                activePartner={activePartner}
                sessionTitle={sessionTitle}
                setSessionTitle={setSessionTitle}
                activitiesDone={activitiesDone}
                setActivitiesDone={setActivitiesDone}
                gearUsedInput={gearUsedInput}
                setGearUsedInput={setGearUsedInput}
                safewordUsed={safewordUsed}
                setSafewordUsed={setSafewordUsed}
                subspaceLevel={subspaceLevel}
                setSubspaceLevel={setSubspaceLevel}
                aftercareRating={aftercareRating}
                setAftercareRating={setAftercareRating}
                debriefNotes={debriefNotes}
                setDebriefNotes={setDebriefNotes}
                onSaveJournalEntry={handleSaveJournalEntry}
                journalEntries={journalEntries}
              />
            )}

            {activeTab === 'challenges' && (
              <PartnerChallengesTab
                activePartner={activePartner}
                chTitle={chTitle}
                setChTitle={setChTitle}
                chDesc={chDesc}
                setChDesc={setChDesc}
                onCreateChallenge={handleCreateChallenge}
                challenges={challenges}
                onCompleteChallenge={handleCompleteChallenge}
                rewTitle={rewTitle}
                setRewTitle={setRewTitle}
                onCreateReward={handleCreateReward}
                rewards={rewards}
                onRedeemReward={handleRedeemReward}
              />
            )}

            {activeTab === 'diplomas' && (
              <KinkDiplomasTab
                diplomas={diplomas}
                onSelectDiploma={setSelectedDiploma}
              />
            )}

            {activeTab === 'burnout' && (
              <BurnoutAssessmentTab
                physicalFatigue={physicalFatigue}
                setPhysicalFatigue={setPhysicalFatigue}
                emotionalBattery={emotionalBattery}
                setEmotionalBattery={setEmotionalBattery}
                aftercareQuality={aftercareQuality}
                setAftercareQuality={setAftercareQuality}
                onSaveBurnoutCheckin={handleSaveBurnoutCheckin}
                burnoutLogs={burnoutLogs}
              />
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
});
