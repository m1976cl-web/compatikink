import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { encryptPayload, decryptPayload } from './cryptoVault';

export async function exportEncryptedBackup(passphrase: string): Promise<string> {
  const keys = await AsyncStorage.getAllKeys();
  const pairs = await AsyncStorage.multiGet(keys);
  
  const payload: Record<string, string | null> = {};
  pairs.forEach(([key, value]) => {
    payload[key] = value;
  });

  const encrypted = await encryptPayload(payload, passphrase);
  // encrypted is 'ck1:base64...'
  if (encrypted.startsWith('ck1:')) {
    return 'ckbak1:' + encrypted.substring(4);
  }
  return 'ckbak1:' + encrypted;
}

export async function importEncryptedBackup(backupString: string, passphrase: string): Promise<{ restored: number, skipped: number }> {
  if (!backupString.startsWith('ckbak1:')) {
    throw new Error('Formato de backup inválido. Debe comenzar con ckbak1:');
  }
  const toDecrypt = 'ck1:' + backupString.substring(7);
  
  const payload = await decryptPayload<Record<string, string | null>>(toDecrypt, passphrase);
  if (!payload || typeof payload !== 'object') {
    throw new Error('Contenido de backup inválido');
  }

  const pairs: [string, string][] = [];
  let skipped = 0;
  for (const [key, value] of Object.entries(payload)) {
    if (value !== null && typeof value === 'string') {
      pairs.push([key, value]);
    } else {
      skipped++;
    }
  }

  if (pairs.length > 0) {
    await AsyncStorage.multiSet(pairs);
  }

  return { restored: pairs.length, skipped };
}

export function downloadBackupAsFile(backupString: string, filename = 'compatikink-backup.ckb'): void {
  if (Platform.OS === 'web') {
    const blob = new Blob([backupString], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } else {
    // Para React Native / Expo, podríamos usar expo-file-system y expo-sharing
    console.log('Descarga de backup no implementada en nativo aún. Tamaño del backup:', backupString.length);
  }
}
