import { createSession as createRemoteZkSession, isSupabaseConfigured } from '@/lib/supabase';
import {
  createLocalSession,
  getLocalSessionByCode,
  getLocalSessionByToken,
  submitLocalGuestResponses,
  saveInitiatorToken,
  saveGuestProfile,
} from '@/lib/storage';
import { ActivityResponse, Session, GuestProfile, UserProfile } from '@/types';
import {
  generateInviteSecret,
  generateDataEncryptionKeyBytes,
  bytesToBase64,
  wrapDek,
  unwrapDek,
  sealWithDek,
  openWithDek,
} from '@/lib/cryptoVault';
import { generateInviteCode, generateToken } from '@/lib/utils';

export interface SessionPayload {
  nickname: string;
  profile?: UserProfile;
  responses: ActivityResponse[];
}

async function decryptRemoteSession(
  session: Session,
  dekRaw: Uint8Array
): Promise<Session> {
  const next: Session = { ...session, sessionDekB64: bytesToBase64(dekRaw) };

  if (session.initiatorCiphertext) {
    try {
      const init = await openWithDek<SessionPayload>(session.initiatorCiphertext, dekRaw);
      next.initiatorNickname = init.nickname;
      next.initiatorProfile = init.profile ?? { nickname: init.nickname };
      next.initiatorResponses = init.responses ?? [];
    } catch (err) {
      console.warn('Failed to decrypt initiator ciphertext', err);
    }
  }

  if (session.guestCiphertext) {
    try {
      const guest = await openWithDek<SessionPayload>(session.guestCiphertext, dekRaw);
      next.guestNickname = guest.nickname;
      next.guestProfile = guest.profile ?? { nickname: guest.nickname };
      next.guestResponses = guest.responses ?? [];
    } catch (err) {
      console.warn('Failed to decrypt guest ciphertext', err);
    }
  }

  return next;
}

export async function createSession(
  nickname: string,
  responses: ActivityResponse[],
  privateGuestNotes?: GuestProfile,
  initiatorProfile?: UserProfile,
  /** Local TTL hint. Remote ZK sessions always use server 48h default. */
  expiresAt?: string
): Promise<Session> {
  const inviteSecret = generateInviteSecret();
  const dekRaw = generateDataEncryptionKeyBytes();
  const dekWrapInvite = await wrapDek(dekRaw, inviteSecret);
  const initiatorCiphertext = await sealWithDek(
    {
      nickname,
      profile: initiatorProfile ?? { nickname },
      responses,
    } satisfies SessionPayload,
    dekRaw
  );

  let session: Session;

  if (isSupabaseConfigured) {
    try {
      const inviteCode = generateInviteCode();
      const token = generateToken();
      const remotePromise = createRemoteZkSession(
        inviteCode,
        token,
        dekWrapInvite,
        initiatorCiphertext,
        nickname
      );
      const remote = await Promise.race([
        remotePromise,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout creando sesión remota')), 15_000)
        ),
      ]);
      session = {
        ...remote,
        inviteSecret,
        sessionDekB64: bytesToBase64(dekRaw),
        initiatorNickname: nickname,
        initiatorProfile: initiatorProfile ?? { nickname },
        initiatorResponses: responses,
        guestResponses: null,
      };
      // Keep a local mirror so initiator can decrypt after refresh without re-deriving
      await persistLocalDekMirror(session);
      await saveInitiatorToken(token);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const schemaMissing =
        /PGRST202|Could not find the function|create_zk_session/i.test(msg) ||
        /schema cache/i.test(msg);
      if (schemaMissing) {
        throw new Error(
          'Supabase aún no tiene el schema ZK (falta create_zk_session). Ejecuta supabase/schema.sql en el SQL Editor del proyecto piegesepycvipfzjbraz. Ver docs/REMOTE_INVITES.md.'
        );
      }
      console.warn('Remote ZK session failed; falling back to local session.', err);
      session = await createLocalSession(nickname, responses, initiatorProfile, expiresAt);
      if (!session.inviteSecret) {
        session.inviteSecret = inviteSecret;
        session.sessionDekB64 = bytesToBase64(dekRaw);
        session.dekWrapInvite = dekWrapInvite;
        session.initiatorCiphertext = initiatorCiphertext;
      }
    }
  } else {
    session = await createLocalSession(nickname, responses, initiatorProfile, expiresAt);
    // Local path already generates inviteSecret/DEK; ensure consistent
    if (!session.inviteSecret) {
      session.inviteSecret = inviteSecret;
      session.sessionDekB64 = bytesToBase64(dekRaw);
      session.dekWrapInvite = dekWrapInvite;
      session.initiatorCiphertext = initiatorCiphertext;
    }
  }

  if (privateGuestNotes) {
    await saveGuestProfile(session.id, privateGuestNotes);
  }

  return session;
}

/** Store DEK + secret on the initiator device alongside local session index. */
async function persistLocalDekMirror(session: Session): Promise<void> {
  const { writeJsonStorage, readJsonStorage } = await import('@/lib/cryptoVault');
  const SESSIONS_KEY = 'local_sessions';
  const sessions = await readJsonStorage<Record<string, Session>>(SESSIONS_KEY, {});
  sessions[session.initiatorToken] = session;
  await writeJsonStorage(SESSIONS_KEY, sessions);
}

export async function getSessionByToken(token: string): Promise<Session | null> {
  const local = await getLocalSessionByToken(token);
  if (local?.sessionDekB64) {
    if (isSupabaseConfigured && local.initiatorCiphertext) {
      // Merge remote status if available
      try {
        const { getSessionByToken: remote } = await import('@/lib/supabase');
        const remoteSession = await remote(token);
        if (remoteSession) {
          const { base64ToBytes } = await import('@/lib/cryptoVault');
          const merged = await decryptRemoteSession(
            {
              ...remoteSession,
              inviteSecret: local.inviteSecret,
              sessionDekB64: local.sessionDekB64,
            },
            base64ToBytes(local.sessionDekB64)
          );
          return merged;
        }
      } catch {
        /* use local */
      }
    }
    return local;
  }

  if (isSupabaseConfigured) {
    const { getSessionByToken: remote } = await import('@/lib/supabase');
    const session = await remote(token);
    if (session && local?.sessionDekB64) {
      const { base64ToBytes } = await import('@/lib/cryptoVault');
      return decryptRemoteSession(
        { ...session, inviteSecret: local.inviteSecret, sessionDekB64: local.sessionDekB64 },
        base64ToBytes(local.sessionDekB64)
      );
    }
    // Without local DEK, return opaque ciphertext session
    if (session) return session;
  }
  return local;
}

export async function getSessionByInviteCode(
  code: string,
  inviteSecret?: string
): Promise<Session | null> {
  if (isSupabaseConfigured) {
    const { getSessionByInviteCode: remote } = await import('@/lib/supabase');
    const session = await remote(code);
    if (session) {
      if (inviteSecret && session.dekWrapInvite) {
        try {
          const dek = await unwrapDek(session.dekWrapInvite, inviteSecret);
          return decryptRemoteSession({ ...session, inviteSecret }, dek);
        } catch {
          return { ...session, inviteSecret };
        }
      }
      return inviteSecret ? { ...session, inviteSecret } : session;
    }
  }

  const local = await getLocalSessionByCode(code);
  if (local && inviteSecret) {
    return { ...local, inviteSecret };
  }
  return local;
}

export async function submitGuestResponses(
  inviteCode: string,
  guestNickname: string,
  guestResponses: ActivityResponse[],
  guestProfile?: UserProfile,
  inviteSecret?: string
): Promise<Session> {
  const secret = inviteSecret;

  if (isSupabaseConfigured) {
    const { getSessionByInviteCode: remoteGet, submitGuestCiphertext } = await import(
      '@/lib/supabase'
    );
    const remote = await remoteGet(inviteCode);
    if (!remote) throw new Error('Sesión no encontrada');
    if (!remote.dekWrapInvite) throw new Error('Sesión sin DEK wrap (schema ZK requerido)');
    if (!secret) {
      throw new Error(
        'Falta el secreto de invitación (#k=… en el enlace). Sin él no se puede cifrar el payload.'
      );
    }

    const dek = await unwrapDek(remote.dekWrapInvite, secret);
    const guestCiphertext = await sealWithDek(
      {
        nickname: guestNickname,
        profile: guestProfile ?? { nickname: guestNickname },
        responses: guestResponses,
      } satisfies SessionPayload,
      dek
    );

    const updated = await submitGuestCiphertext(inviteCode, guestCiphertext, guestNickname);
    return decryptRemoteSession({ ...updated, inviteSecret: secret }, dek);
  }

  const session = await submitLocalGuestResponses(
    inviteCode,
    guestNickname,
    guestResponses,
    guestProfile,
    secret
  );
  if (!session) throw new Error('Sesión no encontrada o ya completada');
  return session;
}

export async function refreshSession(session: Session): Promise<Session | null> {
  if (isSupabaseConfigured) {
    return getSessionByToken(session.initiatorToken);
  }
  return getSessionByToken(session.initiatorToken);
}

/** Parse invite secret from URL hash (`#k=…`) or query (`?k=`). */
export function parseInviteSecretFromUrl(href?: string): string | undefined {
  const raw =
    href ??
    (typeof globalThis !== 'undefined' && 'location' in globalThis
      ? (globalThis as unknown as { location?: { href?: string; hash?: string; search?: string } })
          .location?.href
      : undefined);
  if (!raw) {
    if (typeof globalThis !== 'undefined' && 'location' in globalThis) {
      const loc = (globalThis as unknown as { location: { hash?: string; search?: string } }).location;
      const hash = loc.hash || '';
      const m = hash.match(/[#&]k=([^&]+)/);
      if (m) return decodeURIComponent(m[1]);
      const q = loc.search || '';
      const mq = q.match(/[?&]k=([^&]+)/);
      if (mq) return decodeURIComponent(mq[1]);
    }
    return undefined;
  }
  try {
    const u = new URL(raw, 'https://compatikink.local');
    const fromQuery = u.searchParams.get('k');
    if (fromQuery) return fromQuery;
    const hash = u.hash.replace(/^#/, '');
    const params = new URLSearchParams(hash.includes('=') ? hash : `k=${hash}`);
    return params.get('k') ?? undefined;
  } catch {
    return undefined;
  }
}
