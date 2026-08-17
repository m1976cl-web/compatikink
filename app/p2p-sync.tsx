import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { getCurrentProfile } from '@/lib/storage';
import { generateP2PSharePayload, parseAndDecryptP2PPayload } from '@/lib/p2pPairing';
import { DirectComparisonModal } from '@/components/profile/DirectComparisonModal';
import { triggerSuccessHaptic, triggerLightHaptic } from '@/lib/haptics';
import { UserProfile, ActivityResponse } from '@/types';

export default function P2PSyncScreen() {
  const router = useRouter();
  const [myProfile, setMyProfile] = useState<UserProfile | null>(null);
  const [myResponses, setMyResponses] = useState<ActivityResponse[]>([]);

  const [passphrase, setPassphrase] = useState<string>('compatikink123');
  const [generatedPayload, setGeneratedPayload] = useState<string>('');

  const [inputPayload, setInputPayload] = useState<string>('');
  const [partnerProfile, setPartnerProfile] = useState<UserProfile | null>(null);
  const [partnerResponses, setPartnerResponses] = useState<ActivityResponse[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const p = await getCurrentProfile();
      if (p) {
        setMyProfile(p);
        setMyResponses(p.baseResponses ?? []);
      }
    })();
  }, []);

  const handleGenerateQR = async () => {
    if (!myProfile) return;
    triggerLightHaptic();
    const code = await generateP2PSharePayload(myProfile, myResponses, passphrase);
    setGeneratedPayload(code);
    triggerSuccessHaptic();
  };

  const handleDecryptReceived = async () => {
    if (!inputPayload.trim()) {
      Alert.alert('Error', 'Pega el código P2P escaneado o compartido por tu pareja.');
      return;
    }

    try {
      triggerLightHaptic();
      const result = await parseAndDecryptP2PPayload(inputPayload.trim(), passphrase);
      setPartnerProfile(result.profile);
      setPartnerResponses(result.responses);
      setShowComparisonModal(true);
      triggerSuccessHaptic();
    } catch (err: any) {
      Alert.alert('Error de Descifrado', 'Clave incorrecta o formato P2P no válido.');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <AppHeader
          brand
          title="Sincronización P2P Cara a Cara (100% Offline)"
          subtitle="Intercambia y compara tus respuestas directamente por aire/QR sin pasar por internet."
        />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔑 Clave Secreta de Pareja (Passphrase)</Text>
          <Text style={styles.cardSub}>
            Define una palabra clave acordada en persona para cifrar el código P2P.
          </Text>
          <TextInput
            style={styles.textInput}
            secureTextEntry
            value={passphrase}
            onChangeText={setPassphrase}
            placeholder="Clave de pareja"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Generar Mi Código */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📲 Paso 1: Generar Mi Código de Intercambio</Text>
          <Button title="Generar Código P2P Cifrado 🔐" onPress={handleGenerateQR} />
          {generatedPayload ? (
            <View style={styles.payloadBox}>
              <Text style={styles.payloadBoxTitle}>Tu Código P2P Cifrado (Copia y entrega a tu pareja):</Text>
              <Text style={styles.payloadBoxCode} numberOfLines={4}>
                {generatedPayload}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Pegar Código Recibido */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📥 Paso 2: Descifrar Código Recibido de Pareja</Text>
          <TextInput
            style={[styles.textInput, { height: 70 }]}
            multiline
            value={inputPayload}
            onChangeText={setInputPayload}
            placeholder="Pega el código ckp2p:... recibido"
            placeholderTextColor={colors.textMuted}
          />
          <Button title="Descifrar & Comparar Test Ahora ⚡" onPress={handleDecryptReceived} />
        </View>

        {showComparisonModal && partnerProfile && myProfile ? (
          <DirectComparisonModal
            visible={showComparisonModal}
            targetProfile={partnerProfile}
            currentProfile={myProfile}
            currentResponses={myResponses}
            targetResponses={partnerResponses}
            onClose={() => setShowComparisonModal(false)}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.md, gap: spacing.md, maxWidth: 640, width: '100%', alignSelf: 'center' },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.xl,
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardTitle: { color: colors.text, fontFamily: fonts.displaySemi, fontSize: fontSize.sm, fontWeight: '800' },
  cardSub: { color: colors.textMuted, fontFamily: fonts.body, fontSize: fontSize.xs },
  textInput: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.text,
    fontSize: fontSize.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  payloadBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: colors.neonPurple,
    borderRadius: radii.md,
    padding: spacing.sm,
    gap: 4,
    marginTop: 6,
  },
  payloadBoxTitle: { color: colors.neonPurple, fontSize: 10, fontFamily: fonts.bodyBold },
  payloadBoxCode: { color: colors.textMuted, fontSize: 9, fontFamily: fonts.body },
});
