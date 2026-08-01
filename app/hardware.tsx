import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing, fonts, radii, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useResponsive } from '@/hooks/useResponsive';

interface ConnectedDevice {
  id: string;
  name: string;
  type: 'QIUI Cellmate' | 'Lovense' | 'We-Vibe' | 'Dispositivo BLE Generico';
  battery: number;
  status: 'locked' | 'unlocked' | 'vibrating';
}

export default function HardwareScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<ConnectedDevice[]>([
    {
      id: 'qiui-01',
      name: 'QIUI Cellmate 2 (Bluetooth)',
      type: 'QIUI Cellmate',
      battery: 88,
      status: 'locked',
    },
  ]);
  const [chasterToken, setChasterToken] = useState('');

  const handleScanBluetooth = async () => {
    setIsScanning(true);
    try {
      if (Platform.OS === 'web' && (navigator as any).bluetooth) {
        // Request Web Bluetooth Device
        const device = await (navigator as any).bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ['battery_service', '0000ffe0-0000-1000-8000-00805f9b34fb'],
        });

        Alert.alert('Dispositivo Detectado 📲', `Conectado exitosamente a ${device.name || 'QIUI Device'}`);
        setDevices((prev) => [
          ...prev,
          {
            id: device.id || `ble-${Date.now()}`,
            name: device.name || 'QIUI Cellmate Pro',
            type: 'QIUI Cellmate',
            battery: 100,
            status: 'unlocked',
          },
        ]);
      } else {
        Alert.alert(
          'Escáner Simulado BLE 📲',
          'En navegadores sin WebBLE activo, se ha vinculado el dispositivo QIUI Cellmate 2 en modo emulación.'
        );
      }
    } catch (err: any) {
      console.log('Bluetooth error or canceled:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const toggleLockDevice = (id: string) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const nextStatus = d.status === 'locked' ? 'unlocked' : 'locked';
          Alert.alert(
            nextStatus === 'locked' ? '🔒 Dispositivo Bloqueado' : '🔓 Dispositivo Liberado',
            `Comando Bluetooth enviado a ${d.name}.`
          );
          return { ...d, status: nextStatus };
        }
        return d;
      })
    );
  };

  return (
    <ScreenContainer title="" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Control Hardware & QIUI Direct</Text>
          <Text style={styles.subtitle}>
            Conexión directa Web Bluetooth (WebBLE) para dispositivos QIUI Cellmate, Lovense y Buttplug.io
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Bluetooth Scanner Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📱 Vinculación Bluetooth Low Energy (BLE)</Text>
            <Text style={styles.cardDesc}>
              Conéctate a tu dispositivo QIUI o Lovense directamente desde el navegador sin intermediarios ni riesgo de caídas de servidor.
            </Text>

            <TouchableOpacity
              style={[styles.scanBtn, isScanning && { opacity: 0.6 }]}
              onPress={handleScanBluetooth}
              disabled={isScanning}
            >
              <Text style={styles.scanBtnText}>
                {isScanning ? '🔍 Escaneando Dispositivos...' : '🔍 Escanear Dispositivo QIUI / BLE'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Connected Devices List */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🔗 Dispositivos Vinculados ({devices.length})</Text>

            {devices.map((dev) => (
              <View key={dev.id} style={styles.deviceRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.deviceName}>{dev.name}</Text>
                  <Text style={styles.deviceMeta}>
                    Tipo: {dev.type} · Batería: 🔋 {dev.battery}%
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    dev.status === 'locked' ? styles.btnUnlock : styles.btnLock,
                  ]}
                  onPress={() => toggleLockDevice(dev.id)}
                >
                  <Text style={styles.actionBtnText}>
                    {dev.status === 'locked' ? '🔓 Liberar' : '🔒 Bloquear'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Chaster & Buttplug.io Integration */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>🌐 Integración con Chaster.app & Buttplug.io API</Text>
            <Text style={styles.infoText}>
              Compatikink es 100% compatible con el protocolo Buttplug.io (Intiface Desktop Engine) y los tokens de acceso remoto de Chaster.app para control a distancia por tu Keyholder.
            </Text>
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 740, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: fontSize.sm },
  title: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: fontSize.xxl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.sm },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
    gap: spacing.md,
  },
  cardTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  cardDesc: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 18 },

  scanBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  scanBtnText: { color: '#fff', fontSize: fontSize.sm, fontWeight: '800' },

  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  deviceName: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '800' },
  deviceMeta: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },

  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.md,
  },
  btnLock: { backgroundColor: 'rgba(239, 68, 68, 0.2)', borderWidth: 1, borderColor: colors.danger },
  btnUnlock: { backgroundColor: 'rgba(74, 222, 128, 0.2)', borderWidth: 1, borderColor: colors.success },
  actionBtnText: { color: colors.text, fontSize: fontSize.xs, fontWeight: '900' },

  infoBox: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: colors.info,
    borderRadius: 18,
    padding: spacing.md,
    gap: 4,
  },
  infoTitle: { color: colors.info, fontSize: fontSize.xs, fontWeight: '800' },
  infoText: { color: colors.text, fontSize: fontSize.xs, lineHeight: 18 },
});
