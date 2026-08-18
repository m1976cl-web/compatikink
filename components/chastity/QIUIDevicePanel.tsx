import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Animated } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { createQIUIManager, QIUIDevice, QIUIManager } from '@/lib/qiui';
import { VaultSession } from '@/lib/cryptoVault';

export function QIUIDevicePanel() {
  const [manager] = useState<QIUIManager>(() => createQIUIManager());
  const [devices, setDevices] = useState<QIUIDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<QIUIDevice | null>(null);
  const [scanning, setScanning] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const unsubFound = manager.addEventListener('deviceFound', (dev: QIUIDevice) => {
      setDevices((prev) => {
        if (prev.find((d) => d.id === dev.id)) return prev;
        return [...prev, dev];
      });
    });
    const unsubConnected = manager.addEventListener('connected', (dev: QIUIDevice) => {
      setConnectedDevice(dev);
      setConnectingId(null);
    });
    const unsubDisconnected = manager.addEventListener('disconnected', () => {
      setConnectedDevice(null);
    });
    const unsubStatus = manager.addEventListener('statusUpdate', (dev: QIUIDevice) => {
      setConnectedDevice({ ...dev });
    });

    return () => {
      unsubFound();
      unsubConnected();
      unsubDisconnected();
      unsubStatus();
      manager.stopScan();
    };
  }, [manager]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const handleScan = async () => {
    if (scanning) {
      manager.stopScan();
      setScanning(false);
      return;
    }
    setDevices([]);
    setScanning(true);
    await manager.startScan((dev) => {
      // handled by event listener
    });
  };

  const handleConnect = async (deviceId: string) => {
    try {
      setConnectingId(deviceId);
      await manager.connect(deviceId);
    } catch (err) {
      Alert.alert('Error', 'No se pudo conectar al dispositivo');
      setConnectingId(null);
    }
  };

  const handleDisconnect = async () => {
    if (!connectedDevice) return;
    await manager.disconnect(connectedDevice.id);
  };

  const handleAction = async (action: 'lock' | 'unlock') => {
    if (!connectedDevice) return;
    if (!VaultSession.isUnlocked()) {
      Alert.alert('Bóveda bloqueada', 'Desbloquea la bóveda para controlar el dispositivo.');
      return;
    }
    
    setWorking(true);
    try {
      if (action === 'lock') {
        await manager.lock(connectedDevice.id);
      } else {
        await manager.unlock(connectedDevice.id);
      }
    } catch (e) {
      Alert.alert('Error', 'Fallo al ejecutar el comando');
    } finally {
      setWorking(false);
    }
  };

  const getStatusColor = () => {
    if (connectedDevice) return colors.success;
    if (scanning) return colors.warning;
    return colors.danger;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.title}>🔗 Dispositivos QIUI</Text>
          <Animated.View style={[styles.statusDot, { backgroundColor: getStatusColor(), opacity: pulseAnim }]} />
        </View>
        {!connectedDevice && (
          <TouchableOpacity style={styles.scanBtn} onPress={handleScan}>
            <Text style={styles.scanBtnText}>{scanning ? 'Detener Escaneo' : 'Escanear'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {!connectedDevice && devices.length > 0 && (
        <View style={styles.deviceList}>
          {devices.map((dev) => (
            <View key={dev.id} style={styles.deviceItem}>
              <View>
                <Text style={styles.deviceName}>{dev.name}</Text>
                <Text style={styles.deviceRssi}>RSSI: {dev.rssi}</Text>
              </View>
              <TouchableOpacity
                style={styles.connectBtn}
                onPress={() => handleConnect(dev.id)}
                disabled={connectingId === dev.id}
              >
                {connectingId === dev.id ? (
                  <ActivityIndicator color={colors.onPrimary} size="small" />
                ) : (
                  <Text style={styles.connectBtnText}>Conectar</Text>
                )}
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {connectedDevice && (
        <View style={styles.connectedCard}>
          <View style={styles.connectedHeader}>
            <Text style={styles.connectedName}>{connectedDevice.name}</Text>
            <TouchableOpacity onPress={handleDisconnect}>
              <Text style={styles.disconnectText}>Desconectar</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.deviceStats}>
            <Text style={styles.statText}>Batería: {connectedDevice.batteryLevel}%</Text>
            <Text style={styles.statText}>
              Estado: <Text style={{ color: connectedDevice.locked ? colors.error : colors.success }}>
                {connectedDevice.locked ? 'Bloqueado 🔒' : 'Desbloqueado 🔓'}
              </Text>
            </Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.controlBtn, styles.lockBtn, connectedDevice.locked && { opacity: 0.5 }]}
              onPress={() => handleAction('lock')}
              disabled={working || connectedDevice.locked}
            >
              {working && !connectedDevice.locked ? <ActivityIndicator color="#fff" /> : <Text style={styles.controlBtnText}>Bloquear 🔒</Text>}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.controlBtn, styles.unlockBtn, !connectedDevice.locked && { opacity: 0.5 }]}
              onPress={() => handleAction('unlock')}
              disabled={working || !connectedDevice.locked}
            >
              {working && connectedDevice.locked ? <ActivityIndicator color="#fff" /> : <Text style={styles.controlBtnText}>Desbloquear 🔓</Text>}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#120b22',
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontFamily: fonts.bodyBold,
    color: colors.text,
    fontSize: fontSize.md,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scanBtn: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  scanBtnText: {
    color: colors.primary,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
  },
  deviceList: {
    gap: spacing.sm,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    padding: spacing.sm,
    borderRadius: radii.lg,
  },
  deviceName: {
    color: colors.text,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.sm,
  },
  deviceRssi: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
  },
  connectBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.md,
    minWidth: 80,
    alignItems: 'center',
  },
  connectBtnText: {
    color: colors.onPrimary,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
  connectedCard: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  connectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  connectedName: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.lg,
  },
  disconnectText: {
    color: colors.danger,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.sm,
  },
  deviceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
  },
  controls: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  controlBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  lockBtn: {
    backgroundColor: colors.danger,
  },
  unlockBtn: {
    backgroundColor: colors.success,
  },
  controlBtnText: {
    color: '#fff',
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
  },
});
