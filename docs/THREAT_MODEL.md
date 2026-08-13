# CompatKink — Zero-Knowledge Threat Model & Security Architecture

**Document Version:** 1.0.0  
**Effective Date:** August 2026  
**Classification:** Public Security Specification  
**Repository:** [m1976cl-web/compatikink](https://github.com/m1976cl-web/compatikink)

---

## 1. System Overview & Core Philosophy

**CompatKink** is a privacy-first mobile and web application designed for asymmetric, mutual-consent compatibility assessment involving sensitive personal data (intimate preferences, sexual boundaries, roles, and safety protocols).

Because intimate preferences represent **Special Category Data** under GDPR Article 9 and Chilean Data Protection Law N° 21.719, CompatKink enforces a **Zero-Knowledge (ZK) Encryption Architecture**. 

### Core Guarantees:
1. **Server Blindness**: Supabase and host infrastructure never store, transmit, or process unencrypted sensitive user data.
2. **Client-Side Cryptography**: All encryption, decryption, and key derivation occur exclusively within the client application runtime (WebCrypto API / Native Crypto).
3. **Ephemeral Memory Hygiene**: Encryption keys reside strictly in transient RAM while the vault is active and are purged immediately upon locking, auto-lock timeout, or panic wipe.

---

## 2. Cryptographic Architecture Specification

### 2.1 Key Derivation Function (KDF)
- **Algorithm**: `PBKDF2` with `HMAC-SHA-256`.
- **Iteration Count**: `310,000` iterations.
- **Salt**: 16-byte cryptographically secure random salt (`crypto.getRandomValues`) unique per profile.
- **Output**: 256-bit AES-GCM Master Key (`CryptoKey`).

### 2.2 Symmetric Data Encryption
- **Algorithm**: `AES-GCM-256` (Galois/Counter Mode).
- **IV (Initialization Vector)**: 12-byte cryptographically random IV generated per encryption operation.
- **Ciphertext Format**: `ck1:<base64(iv + ciphertext + authTag)>`
- **Integrity**: Authenticated Encryption with Associated Data (AEAD) ensures ciphertexts cannot be tampered with or modified without triggering decryption failure.

### 2.3 Guest Session Asymmetric Key Wrapping (DEK)
When an initiator generates an invitation code:
1. A unique Data Encryption Key (`DEK`) is generated client-side.
2. The `DEK` is wrapped into a `#k=` URL fragment secret.
3. URL fragments are never sent to HTTP servers by browsers, guaranteeing the invite secret remains strictly client-to-client.

---

## 3. Threat Matrix & Adversary Analysis

| Threat / Adversary | Capability | Countermeasure / Security Control | Residual Risk Level |
|---|---|---|---|
| **Supabase DB Compromise** | Attacker dumps entire remote SQL database | All sensitive records (`sessions`, `profiles`, `scene_agreements`) are stored strictly as `ck1:` AES-GCM ciphertexts. Without user PIN/passphrase, data is unreadable. | **NEGLIGIBLE** |
| **Server Admin / Cloud Provider** | Full access to Supabase infrastructure & logs | Zero-Knowledge architecture: no encryption keys or master PINs exist on server. Server functions only as ciphertext relay. | **NEGLIGIBLE** |
| **Network Eavesdropper (MITM)** | Intercepts HTTPS traffic | TLS 1.3 encryption in transit + payload-level `ck1:` AES-GCM double encryption. Intercepted payloads are useless without client-side key. | **NEGLIGIBLE** |
| **Physical Device Theft (Locked App)** | Physical access to unlocked or locked device | Device storage only contains `ck1:` ciphertexts. Key is derived on demand from PIN. Auto-lock clears RAM key after 5 minutes of inactivity. | **LOW** |
| **Coercion / Duress (Physical Forcing)** | Attacker forces user to enter PIN under threat | **Canary (Decoy) PIN**: Entering secondary decoy PIN unlocks a static, harmless synthetic environment without exposing real vault data or key existence. | **LOW** |
| **Brute Force (6-Char Invite Code)** | Attacker guesses 6-char invitation token | Rate-limiting (20 attempts / 15 min), short 48-hour expiration window, invite secret `#k=`, and single-use claim invalidation. | **LOW** |

---

## 4. Key Management Lifecycle

```
[User PIN Input] ──> PBKDF2 (310k iterations) ──> Master CryptoKey (RAM Only)
                                                       │
                                 ┌─────────────────────┴─────────────────────┐
                                 ▼                                           ▼
                      Decrypt Local Vault                        Encrypt Storage Write
                        (AsyncStorage)                           (AES-GCM-256 + IV)
                                 │                                           │
                                 └─────────────────────┬─────────────────────┘
                                                       │
[Lock / Auto-Lock / Panic Wipe] ──────────────────> Purge RAM Key (Set null)
```

---

## 5. Right to Be Forgotten & Permanent Data Erasure

CompatKink provides a single-click **"Eliminar mis datos" (Permanent Data Erasure)** function:
1. Clears all local `AsyncStorage` keys (`local_sessions`, `local_user_profiles`, `private_album_photos_v1`, etc.).
2. Issues `DELETE` requests to Supabase for remote sessions and profile records tied to the user's tokens.
3. Clears encryption keys from memory and resets application state to fresh install.

---

## 6. Verification & Auditing

The security model is continuously validated via automated test suites:
- `tests/vault.verify.ts`: Validates AEAD roundtrips, wrong PIN rejection, and ciphertext formatting.
- `tests/vault.canary.test.ts`: Validates Decoy PIN isolation and storage write protection.
- `tests/vault.rotation.test.ts`: Validates zero-downtime master PIN rotation and re-encryption.
