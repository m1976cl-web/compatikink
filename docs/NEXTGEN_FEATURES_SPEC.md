# CompatKink Next-Gen Features Technical Specification

**Document**: `docs/NEXTGEN_FEATURES_SPEC.md`  
**Author**: Explorer 3 (Technical Specification & Security Specialist)  
**Date**: 2026-08-10  
**Target Milestone**: Milestone 1 / Next-Gen Architecture & Integration Specification  
**Status**: APPROVED / IMPLEMENTATION READY  

---

## Executive Summary & System Guarantees

This document specifies the technical architecture, data models, UI design system standards, local zero-knowledge (ZK) cryptographic protections, and SSC/RACK safety protocols for the **Three Next-Gen Core Modules** of **CompatKink**:

1. **Module A**: D/s Tasks & Habits Engine with Rewards (inspired by *Obedience*)
2. **Module B**: 24h ZK Ephemeral Chats & Wishes Engine (inspired by *Pure*)
3. **Module C**: Linked Profiles / Explorer Couples Engine (inspired by *Feeld* & *3Fun*)

All three modules maintain CompatKink's strict zero-knowledge architecture: no plaintext fetish responses, task histories, wish broadcasts, or paired message logs touch remote servers or unencrypted local persistence.

---

## 1. Architectural Foundations & Cross-Cutting Protocols

### 1.1 Cryptographic Engine Integration (`lib/cryptoVault.ts`)

All Next-Gen modules leverage CompatKink's client-side WebCrypto engine (`globalThis.crypto.subtle`):

* **Key Derivation**: `PBKDF2-SHA-256` with 310,000 iterations and 16-byte random salt per profile.
* **Cipher Suite**: `AES-GCM-256` with 12-byte random IV.
* **Ciphertext Format**: Sealed data prefixed with `ck1:` + Base64 `(IV || Ciphertext || AuthTag)`.
* **RAM Key Management**: `VaultSession` holds the `CryptoKey` in JavaScript Heap memory only; destroyed on auto-lock, logout, tab hide, or panic wipe.
* **Storage Interceptor & Registration**:
  The following storage keys are registered in `SENSITIVE_STORAGE_KEYS` and `SENSITIVE_KEY_PREFIXES` in `lib/cryptoVault.ts`:
  ```typescript
  export const NEXTGEN_SENSITIVE_KEYS = [
    'ds_tasks_habits_v1',
    'ds_rewards_v1',
    'ephemeral_chats_v1',
    'user_wishes_v1',
    'linked_profiles_v1',
    'pair_link_tokens_v1',
  ] as const;
  ```
* **Decoy Mode Protection**: When unlocked via Duress PIN, sensitive storage reads return harmless static decoy payloads (e.g. empty arrays `[]` or standard vanilla habit placeholders), and writes are suppressed to prevent corrupting primary master blobs.

---

### 1.2 Noir Íntimo / Latex Negro Brillante UI Design System

The visual language combines deep obsidian black background surfaces (`#09090B` / `#0a0612`), shiny latex gloss cards, metallic gold highlights (`#D4AF37`), crimson warnings (`#990000` / `#f43f5e`), neon purple accents (`#c084fc`), glassmorphism specular borders, and sleek typography (`Cormorant Garamond` for display headers, `Source Sans 3` for body text).

#### Visual Design Tokens Matrix

```typescript
export const LATEX_NEXTGEN_THEME = {
  // Obsidian Background Layers
  bgObsidian: '#09090B',
  bgSurfaceDark: '#0a0612',
  bgSurfaceCard: '#150d24',
  bgSurfaceGloss: '#21133b',
  bgSurfaceElevated: '#2a164a',

  // Accent Highlights
  goldMetallic: '#D4AF37',          // Rewards, Dominance points, Couple badges
  crimsonHighlight: '#990000',      // Overdue tasks, Hard limit warnings, Emergency exits
  crimsonGlow: '#f43f5e',           // Active timers, Impact play highlights
  neonPurple: '#c084fc',            // Core brand glow & primary buttons
  neonCyan: '#38bdf8',              // Ephemeral chat timers & tech badges
  neonEmerald: '#10b981',           // SSC verification & completed tasks

  // Glassmorphism & Borders
  borderGlassSubtle: 'rgba(192, 132, 252, 0.28)',
  borderGoldMetallic: 'rgba(212, 175, 55, 0.45)',
  borderCrimson: 'rgba(244, 63, 94, 0.5)',
  specularShineTop: 'inset 0 1px 0 rgba(255, 255, 255, 0.18)',
  boxShadowGloss: '0 8px 32px rgba(7, 4, 13, 0.85), 0 0 20px rgba(192, 132, 252, 0.2)',
};
```

---

### 1.3 SSC / RACK Safety Protocols Architecture

Safety is non-negotiable. Every Next-Gen module incorporates three foundational safety mechanisms:

1. **RGB Safeword Traffic Light System**:
   * **🔴 ROJO (Red)**: Absolute stop. Immediately suspends active tasks, purges active ephemeral chats, and notifies partner.
   * **🟡 AMARILLO (Yellow)**: Pause / Reduce intensity. Triggers an automatic pause in task deadlines or lowers interaction intensity.
   * **🟢 VERDE (Green)**: All clear / Continue consensual dynamic.
2. **Boundary Collision Engine (`BOUNDARY_COLLISION_ALERT`)**:
   * Automatically cross-references incoming tasks, wishes, or couple activities against both users' stored `Hard Limit` vectors.
   * If a conflict is detected, the UI displays a prominent Crimson Boundary Warning modal blocking execution unless explicitly overridden by informed dual consent.
3. **Panic Wipe & Duress Handling**:
   * One-tap Panic Wipe (`panicWipeData()`) purges all task logs, ephemeral chat histories, and couple link tokens across local storage.
   * Duress PIN entry boots into a decoy profile displaying innocuous tasks (e.g., "Drink 2L water", "10-minute meditation").

---

## 2. Module A: D/s Tasks & Habits Engine with Rewards (inspired by Obedience)

### 2.1 Module Overview & User Dynamics

Module A provides a structured D/s (Dominant/Submissive) task and habit management system. Dominants (or self-directed users) assign daily/weekly habits, time-bound tasks, and streak goals. Submissives execute tasks, log completion proof (text or encrypted image), earn **Dominance Points / Gold Tokens**, and redeem unlocked rewards created by the Dominant.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    D/S TASKS & HABITS ENGINE WORKFLOW                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  DOMINANT / KEYHOLDER                 SUBMISSIVE / CAPTIVE                  │
│                                                                             │
│  1. Create Task / Habit        ───►  2. Consent Gate (Opt-In Review)        │
│     (Set points, deadline,              (Hard Limit Boundary Check)         │
│      category & intensity)                   │                              │
│                                              ▼                              │
│  4. Verify & Approve Proof    ◄───  3. Mark Complete & Submit Proof         │
│     (Release Gold Points)               (Earn Points & Build Streak 🔥)     │
│          │                                                                  │
│          ▼                                                                  │
│  5. Unlock Rewards Store Item (Submissives Redeem Unlocked Privileges)      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 2.2 Data Models & TypeScript Interfaces

```typescript
// types/dsTask.ts

export type DsTaskCategory =
  | 'service'
  | 'chastity'
  | 'bondage'
  | 'fitness'
  | 'mindfulness'
  | 'impact'
  | 'protocol';

export type DsTaskStatus =
  | 'pending_consent'
  | 'active'
  | 'submitted_for_review'
  | 'completed'
  | 'rejected'
  | 'expired';

export interface DsTask {
  id: string;                          // UUID v4
  pairSessionId?: string;             // Optional link to paired partner
  assignedByNickname: string;         // Nickname of Dominant / Creator
  assignedToNickname: string;         // Nickname of Submissive
  title: string;                       // e.g. "Morning Posture Protocol (20m)"
  description: string;                 // Detailed instructions
  category: DsTaskCategory;
  intensityLevel: 1 | 2 | 3 | 4 | 5;
  rewardPoints: number;                // Gold points earned upon completion
  penaltyPointsIfFailed?: number;      // Points deducted on expiry
  deadlineIso?: string;               // ISO 8601 deadline timestamp
  requiresProof: boolean;              // Text note or photo proof required
  proofText?: string;                  // Encrypted completion note
  proofImageCipher?: string;           // Encrypted photo proof (ck1:...)
  status: DsTaskStatus;
  createdAtIso: string;
  completedAtIso?: string;
  boundaryWarningTriggered?: boolean;  // True if flagged by Hard Limit collision
}

export interface DsHabit {
  id: string;
  assignedByNickname: string;
  title: string;
  frequency: 'daily' | 'weekly' | 'custom_days';
  customDaysOfWeek?: (0 | 1 | 2 | 3 | 4 | 5 | 6)[];
  rewardPointsPerCheckin: number;
  currentStreakDays: number;
  longestStreakDays: number;
  lastCheckinDateIso?: string;
  active: boolean;
}

export interface DsReward {
  id: string;
  title: string;                       // e.g., "30-Minute Back Massage" or "Movie Night Choice"
  description: string;
  costPoints: number;                  // Gold points required to redeem
  isUnlocked: boolean;                 // Set by Dominant
  redeemedCount: number;
  iconEmoji: string;
}

export interface DsUserState {
  nickname: string;
  totalGoldPoints: number;
  totalTasksCompleted: number;
  activeStreakCount: number;
  tasks: DsTask[];
  habits: DsHabit[];
  rewards: DsReward[];
}
```

---

### 2.3 Local Zero-Knowledge Storage Specification

* **Storage Key**: `ds_tasks_habits_v1`
* **Encryption Flow**:
  1. Complete `DsUserState` object is serialized to JSON.
  2. Sealed with active `VaultKey` via `sealWithKey(json, vaultKey)` producing `ck1:...`.
  3. Saved to `AsyncStorage` under `ds_tasks_habits_v1`.
* **Decoy Mode Payload**:
  When unlocked via Duress PIN, `readJsonStorage('ds_tasks_habits_v1')` returns:
  ```json
  {
    "nickname": "decoy_user",
    "totalGoldPoints": 50,
    "totalTasksCompleted": 2,
    "activeStreakCount": 1,
    "tasks": [
      {
        "id": "decoy-1",
        "title": "Bebida de Agua Matutina",
        "description": "Beber 500ml de agua al despertar.",
        "category": "fitness",
        "rewardPoints": 10,
        "status": "completed"
      }
    ],
    "habits": [],
    "rewards": []
  }
  ```

---

### 2.4 UI Component Architecture & Latex Styling

#### Proposed Components
1. **`components/ds/DsTaskDashboard.tsx`**: Main container screen component.
   * Header: Gold points pill (`#D4AF37`) with metallic shimmer gradient + active streak flame counter.
   * Tabs: `Tareas Pendientes`, `Hábitos Diarios`, `Tienda de Recompensas`.
2. **`components/ds/HabitTrackerCard.tsx`**: Glossy latex card (`#150d24`) with top specular highlight (`inset 0 1px 0 rgba(255, 255, 255, 0.18)`), streak progress bar, and check-in button with neon emerald glow (`#10b981`).
3. **`components/ds/RewardStoreModal.tsx`**: Grid of available rewards, cost badges, and unlock toggle for Dominants.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 👑 D/S TASK & HABIT DASHBOARD                 [ 🔥 5 Días | 🪙 450 pts ]│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ 🪢 Tarea: Protocolo Postura y Estiramiento Shibari               │  │
│  │ Asignado por: Mateo_Dom | Recompensa: +50 🪙 | Vence en: 4h 12m   │  │
│  │ Status: 🟢 Activa | Requiere Evidencia Cifrada                   │  │
│  │                                                                   │  │
│  │ [ 📸 Adjuntar Evidencia (ZK) ]   [ 🛡️ Activar Safeword ROJO ]     │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ 🪙 TIENDA DE RECOMPENSAS (RECOMPENSAS DESBLOQUEADAS)             │  │
│  │ • 💆‍♂️ 30 min Masaje de Descompresión ........ [ Canjear: 200 🪙 ]  │  │
│  │ • 🎬 Elección Película de Noche ........... [ Canjear: 100 🪙 ]  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 2.5 Safety & Consent Protocols

1. **Opt-In Task Agreement Consent Popup**: When a task is assigned to a Submissive, it enters `pending_consent`. The Submissive must view instructions and tap `[ Acepto Tarea Consensual ]`.
2. **Boundary Collision Alert**: If task category = `impact` or `chastity`, and the Submissive has that category tagged as `Hard Limit`, a `BOUNDARY_COLLISION_ALERT` blocks activation:
   > 🔴 **ADVERTENCIA DE LÍMITE DURO**: Esta tarea involucra "Impacto", clasificado como Límite Duro en tu perfil. La tarea ha sido cancelada automáticamente por el protocolo RACK/SSC.
3. **Safeword Emergency Exit**: Every active task card features a prominent `[ 🛡️ Safeword ROJO ]` button. Tapping it instantly cancels the task, logs a safety note, and notifies the partner.

---

## 3. Module B: 24h ZK Ephemeral Chats & Wishes Engine (inspired by Pure)

### 3.1 Module Overview & User Dynamics

Module B introduces 24-hour self-destructing ephemeral chat rooms and fantasy "Wish Broadcasts". Users can post a temporary wish (e.g. "Seeking a Shibari rigger for a practice session in Providencia") or enter an ephemeral 1-on-1 chat. All messages and media automatically expire and purge 24 hours after creation.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 24H ZK EPHEMERAL CHAT & WISHES LIFECYCLE                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. Post Ephemeral Wish  ───► 2. Match & Accept Consent Gate                │
│     (Broadband Wish Card)        (Exchange Ephemeral Session DEK)           │
│           │                                    │                            │
│           │ 24h Timer Active                   ▼                            │
│           │                     3. Ephemeral E2EE Chat (AES-GCM-256)        │
│           │                        (Cyan Countdown Badge: 23h 59m remaining)  │
│           │                                    │                            │
│           ▼                                    ▼                            │
│  4. AUTOMATIC PURGE: DEK destroyed from RAM & Storage Blobs Shredded (0x00) │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 3.2 Data Models & TypeScript Interfaces

```typescript
// types/ephemeralChat.ts

export interface UserWishBroadcast {
  id: string;                          // UUID v4
  authorNickname: string;              // Or "Anónimo" if ghost mode
  title: string;                       // e.g. "Deseo de Shibari & Cera para este fin de semana"
  category: 'fantasía' | 'encuentro' | 'taller' | 'aftercare_chat';
  description: string;
  locationCity: string;                // Broad area (e.g. "Santiago Centro")
  expiresAtIso: string;                // Iso timestamp exactly 24h from post
  createdAtIso: string;
  isAnonymous: boolean;
}

export interface EphemeralMessage {
  id: string;
  senderNickname: string;
  contentCipher: string;               // ck1: Base64(IV || Ciphertext) under Ephemeral Chat DEK
  isImage: boolean;
  timestampIso: string;
  expiresAtIso: string;
}

export interface EphemeralChatRoom {
  roomId: string;
  participantNicknames: [string, string];
  wishId?: string;
  chatDekB64Wrapped: string;           // Wrapped under user's VaultKey
  messages: EphemeralMessage[];
  createdAtIso: string;
  expiresAtIso: string;                // Timestamp when room completely self-destructs
  active: boolean;
}
```

---

### 3.3 Local Zero-Knowledge Storage & Expiration Specification

* **Storage Keys**: `ephemeral_chats_v1` and `user_wishes_v1`
* **Dual-Key Ephemeral Forward Secrecy**:
  1. Room creation generates an ephemeral 256-bit room key $\text{DEK}_{\text{room}} = \text{randomBytes}(32)$.
  2. Messages are sealed using $\text{DEK}_{\text{room}}$ with AES-GCM-256.
  3. $\text{DEK}_{\text{room}}$ is stored wrapped under the user's main `VaultKey`.
* **Automatic Expiration Sweep Engine**:
  * On every app launch, tab focus, or background timer tick, `cleanExpiredEphemeralRooms()` evaluates `expiresAtIso < now()`.
  * Expired rooms undergo secure shredding: memory keys set to `null`, and ciphertext records removed from `AsyncStorage`.

---

### 3.4 UI Component Architecture & Latex Styling

#### Proposed Components
1. **`components/ephemeral/EphemeralChatScreen.tsx`**: Chat container with obsidian background (`#09090B`), glossy header, cyan countdown timer badge (`#38bdf8`), and glassmorphism message bubbles.
2. **`components/ephemeral/WishBroadcastCard.tsx`**: Wish card featuring glowing border, category pill, anonymous toggle, and 24h expiration bar.
3. **`components/ephemeral/CountdownTimerBadge.tsx`**: Animated timer displaying remaining hours, minutes, and seconds (`⏳ 21h:44m:12s`).

---

### 3.5 Safety & Consent Protocols

1. **Pre-Chat Consent Gate**: Before sending the first message, both participants must accept the Ephemeral Chat Safety Rules (No non-consensual media sharing, respect limits, screenshot prohibition notice).
2. **Inside-Chat Safeword Panic Button**: Header features a prominent `[ 🔴 END & WIPE CHAT ]` button. Clicking it immediately destroys room keys, purges local logs, and presents an Aftercare Support Screen.
3. **Boundary Collision Header**: The chat header continuously compares the participant's kink profiles and displays shared safe interests vs collision warnings.

---

## 4. Module C: Linked Profiles / Explorer Couples Engine (inspired by Feeld & 3Fun)

### 4.1 Module Overview & User Dynamics

Module C enables two independent accounts (e.g. Partner A & Partner B in a couple, or a Master/Submissive pair) to link their profiles for joint exploration (e.g. seeking third partners, couple-to-couple matches, or shared kink matrices) while keeping each user's individual ZK vault and private wishlist completely separate.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 LINKED PROFILES & COUPLE PAIRING MECHANICS                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  PARTNER A (Vault Key A)                 PARTNER B (Vault Key B)            │
│                                                                             │
│  1. Generate Pair Link Token  ────────► 2. Scan QR / Enter Pairing Code     │
│     (Blinded HMAC Invite Token)            (Confirm Joint Coupling Consent) │
│           │                                          │                      │
│           └────────────────────┬─────────────────────┘                      │
│                                ▼                                            │
│                 3. LINKED COUPLE PROFILE CREATED                            │
│                    (Joint Archetype & Intersection Venn Matrix)             │
│                                                                             │
│  • Public Couple Badge: "Pareja Exploradora Shibari 🪙"                      │
│  • Combined Kink Intersection: Only mutual Positive interests shown         │
│  • STRICT BOUNDARY UNION: If Partner A OR Partner B has Hard Limit 🔴,      │
│    the Couple entity presents a HARD LIMIT for that activity.              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 4.2 Data Models & TypeScript Interfaces

```typescript
// types/linkedProfile.ts

export interface PairLinkRecord {
  pairId: string;                      // UUID v4 for the pair dynamic
  partnerANickname: string;
  partnerBNickname: string;
  relationshipType: 'couple' | 'd_s_pair' | 'poly_pod' | 'triad';
  linkedAtIso: string;
  pairDekB64Wrapped: string;           // Pair shared encryption key wrapped under user's VaultKey
  status: 'active' | 'paused' | 'unlinked';
}

export interface JointKinkIntersection {
  sharedMutualLikes: string[];         // Activity IDs where BOTH partners answered 'like' or 'love'
  sharedCuriosities: string[];        // Activity IDs where at least one is 'curious' and neither is 'hard_limit'
  strictHardLimits: string[];         // UNION of Partner A and Partner B hard limits
  jointArchetypeTitle: string;        // e.g. "Duo Shibari & Control"
}

export interface CoupleProfile {
  pairId: string;
  coupleDisplayName: string;          // e.g. "Valeria & Mateo"
  partnerANickname: string;
  partnerBNickname: string;
  publicBadges: string[];             // Visual latex badges for the couple
  jointBio: string;
  jointKinkIntersection: JointKinkIntersection;
  updatedAtIso: string;
}
```

---

### 4.3 Local Zero-Knowledge Storage & Linking Protocol Specification

* **Storage Keys**: `linked_profiles_v1` and `pair_link_tokens_v1`
* **Double-Blind QR / Invite Token Protocol**:
  1. Partner A generates invite secret $\text{Token}_{\text{invite}} = \text{generateInviteSecret}()$.
  2. Partner B scans QR code containing $\text{Token}_{\text{invite}}$.
  3. A shared pair key $\text{DEK}_{\text{pair}}$ is derived using HMAC-SHA-256 and wrapped separately into Partner A's and Partner B's local ZK vaults.
* **Individual Vault Separation**: Partner A CANNOT decrypt Partner B's private wishlist or individual pin salt. Only shared couple metadata is readable with $\text{DEK}_{\text{pair}}$.

---

### 4.4 UI Component Architecture & Latex Styling

#### Proposed Components
1. **`components/linked/LinkedProfileCard.tsx`**: Card displaying dual avatars joined by a metallic gold tether line (`#D4AF37`), couple badge, and joint compatibility score.
2. **`components/linked/CouplePairingModal.tsx`**: Modal for generating/scanning pairing QR codes.
3. **`components/linked/KinkIntersectionVenn.tsx`**: Interactive Venn diagram showing shared positive kinks vs strict combined hard limits.

---

### 4.5 Safety & Consent Protocols

1. **Dual Unanimous Consent Requirement**: For any outgoing match request, chat invitation, or public couple post, BOTH Partner A and Partner B must tap `[ Confirmar Consentimiento Pareja ]`. If either partner declines, the action is cancelled.
2. **Strict Boundary Union**:
   $$\text{HardLimits}_{\text{Couple}} = \text{HardLimits}_{\text{PartnerA}} \cup \text{HardLimits}_{\text{PartnerB}}$$
   If Partner A loves Shibari but Partner B has Shibari as a Hard Limit, the couple's public profile marks Shibari as a **Strict Hard Limit** to protect Partner B's boundaries.
3. **Panic Disconnect**: Under Duress PIN login, linked profile state displays as "Single / Unlinked" without notifying external servers, protecting users in coercive environments.

---

## 5. Verification & Test Plan

To verify implementation readiness across all 3 modules, the following test verification suite must pass:

1. **TypeScript Static Analysis**:
   ```bash
   pnpm exec tsc --noEmit
   ```
   *Requirement*: 0 type errors across all Next-Gen types, components, and storage utilities.

2. **Crypto Vault & Storage Unit Tests**:
   ```bash
   pnpm run test:vault:all
   ```
   *Requirement*: 100% pass rate (45/45 or more tests) covering `ds_tasks_habits_v1`, `ephemeral_chats_v1`, and `linked_profiles_v1` ZK sealing/opening.

3. **Web Production Bundle Build**:
   ```bash
   pnpm run build:web
   ```
   *Requirement*: Clean compilation with 0 bundler errors.

---
