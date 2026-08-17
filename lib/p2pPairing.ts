import { encryptPayload, decryptPayload } from '@/lib/cryptoVault';
import { ActivityResponse, UserProfile } from '@/types';

export interface P2PPairingPayload {
  version: 'v1';
  timestamp: string;
  senderNickname: string;
  encryptedResponses: string;
  nonce: string;
}

export async function generateP2PSharePayload(
  profile: UserProfile,
  responses: ActivityResponse[],
  passphraseSecret: string
): Promise<string> {
  const rawData = JSON.stringify({
    profile,
    responses,
    createdAt: new Date().toISOString(),
  });

  const encrypted = await encryptPayload(rawData, passphraseSecret);
  const payload: P2PPairingPayload = {
    version: 'v1',
    timestamp: new Date().toISOString(),
    senderNickname: profile.nickname,
    encryptedResponses: encrypted,
    nonce: Math.random().toString(36).substring(2, 8),
  };

  return `ckp2p:${btoa(JSON.stringify(payload))}`;
}

export async function parseAndDecryptP2PPayload(
  qrString: string,
  passphraseSecret: string
): Promise<{ profile: UserProfile; responses: ActivityResponse[]; senderNickname: string }> {
  if (!qrString.startsWith('ckp2p:')) {
    throw new Error('Formato QR de emparejamiento no válido. Debe comenzar con ckp2p:');
  }

  const encodedJson = qrString.replace('ckp2p:', '');
  const decodedStr = atob(encodedJson);
  const payload: P2PPairingPayload = JSON.parse(decodedStr);

  const decryptedJson = await decryptPayload(payload.encryptedResponses, passphraseSecret);
  if (!decryptedJson) {
    throw new Error('No se pudo descifrar el payload. Verifica la clave secreta.');
  }
  const parsed = typeof decryptedJson === 'string' ? JSON.parse(decryptedJson) : decryptedJson;

  return {
    profile: parsed.profile,
    responses: parsed.responses,
    senderNickname: payload.senderNickname,
  };
}
