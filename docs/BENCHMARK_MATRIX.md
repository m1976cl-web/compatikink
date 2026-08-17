# CompatKink — Benchmark Matrix & Feature Extraction Report

**Version:** 1.0.0  
**Date:** August 10, 2026  
**Author:** Spec Miner Agent (`explorer_m1_2`)  
**Scope:** Exhaustive Benchmark of 8 Reference Platforms & Architectural Synthesis for CompatKink  
**Target Repository:** `c:\Users\oscar\.gemini\antigravity\scratch\Compatibilidadcursor`

---

## Executive Summary

The digital ecosystem for intimate dating, alternative lifestyles, BDSM/kink community interactions, and power-exchange management has evolved into a fragmented spectrum. Traditional dating platforms prioritize high-volume matching and engagement loops, frequently at the expense of user privacy, explicit consent protocols, and deep compatibility evaluation. Conversely, niche kink platforms often suffer from dated technical architecture, centralized data vulnerabilities, and lack of mathematical zero-knowledge privacy protection.

This benchmark analyzes eight (8) industry-defining platforms representing four distinct archetypes:
1. **Community & Reputation Networks:** *Mazmo.net* and *WeAreX* (niche community vetting, fetish taxonomies, event integration).
2. **Ephemeral & High-Anonymity Dating:** *Pure* and *Grindr* (instant matching, proximity radars, decay-based ephemeral chats, discrete client modes).
3. **Fluid Identity & Multi-Partner / Couple Discovery:** *Feeld* and *3Fun* (linked couple profiles, 30+ gender/orientation taxonomies, paired media vaults, joint search filters).
4. **Female-First Security & D/s Power Exchange:** *Chyrpe* and *Obedience App* (biometric identity gates, anti-creep shielding, habit streak enforcement, reward economies).

### The Strategic Gap for CompatKink

Across all eight reference platforms, a critical systemic vulnerability remains: **reliance on centralized servers for intimacy data processing**. Even platforms marketing "ephemeral chats" or "private vaults" store plaintext metadata, unencrypted interest profiles, or server-side media decryption keys on cloud infrastructure subject to subpoenas, data breaches, and corporate monetisation.

**CompatKink** establishes a novel paradigm by uniting:
* **Zero-Knowledge (ZK) Encryption Infrastructure:** Client-side PBKDF2 + AES-GCM-256 encryption (`lib/cryptoVault.ts`) ensuring Supabase only receives ciphertext (`ck1:` blobs).
* **Asymmetric Consent Architecture:** The initiator creates an encrypted invitation session; the guest responds independently without viewing host baseline answers until mutual zero-knowledge matching occurs.
* **Noir Íntimo Aesthetic:** Obsidian black UI (`#09090b`), latex sheen micro-interactions, dark metallic highlights, and tactile haptics tailored for adult privacy.

---

## Comparative Matrix Table

| Platform | Core Mechanics | Anonymity & Privacy Model | Social / Coupling Paradigm | Safety & Consent Infrastructure | Retention & Gamification Tactics | Key Innovation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Mazmo.net** | Fetish taxonomy profiling, forum boards, local munch calendars, karma rating system. | Pseudonymous handles, 3-tier photo albums (Public, Friends, Password-Vault). | Solo kinksters, Dominant/submissive linked badges, local community munches. | Explicit kink tag disclosures, community moderator flagging, rules-of-conduct enforcement. | Forum reputation badges, karma score progression, active community rank. | Localized LATAM/Spain kink taxonomy search & munch/event registry. |
| **2. Pure** | 24-hour self-destructing chats, instant "Wishes" bulletin board, zero permanent profile grid. | Phone/Social auth sanitized, no searchable user index, self-destructing media, view-once photos. | Spontaneous 1-on-1 matches focused on immediate desires; no social graph. | Instant block/report, photo blur defaults, anti-solicitation filters, automatic decay of leaks. | 24:00:00 tick-down countdown timer, limited wish slots, urge-driven impulse loops. | Ephemeral 24h Wish board combined with zero-footprint auto-erasure. |
| **3. Feeld** | Swiping grid with 30+ gender/sexuality choices, linked couple accounts, Desire Tags (`#bdsm`, `#rope`). | Incognito mode ("Desires") to hide from Facebook friends, flexible pseudonymity. | Linked couple profiles (chat together or solo), group chats, polyamorous dynamics. | Boundary tags, relationship structure disclosures, active moderation team. | "Ping" super-likes, profile "Uplift" boosts, curated interest collections. | Dual-account pairing link bridging two individual profiles into a joint matching entity. |
| **4. Chyrpe** | Female-first initiation, mandatory AI biometric video verification, zero-creep pledge. | Profile blur until mutual connection, anti-screenshot protection, reverse-image obfuscation. | 1-on-1 high-intent matching with strict female-led conversation initiation. | Biometric identity gate, automated harassment detection, mandatory ID validation. | Trust Score badges, verified blue checkmark status, high-quality match curation. | Multi-stage AI verification pipeline combined with watermarked anti-leak media shielding. |
| **5. Grindr** | Real-time proximity location grid sorted by distance, instant "Taps", health badges. | Distance fuzzing/concealment, discrete app icon disguise (calculator/notes), PIN lock. | Hyper-local 1-on-1 grid, group chat rooms, proximity discovery. | Sexual health badges (HIV/PrEP/Testing), discreet mode safety alerts in high-risk zones. | Instant tap mechanics, online status indicators, profile view counters. | Proximity grid radar paired with discrete app icon masking & health disclosures. |
| **6. Obedience App** | D/s Master/Sub pairing via invite code, daily duty assignment, habit streak tracking, reward store. | Paired key session, local encrypted PIN lock, offline storage capability. | Strict 1-on-1 Dominant/submissive dyad relationship management. | Pre-agreed contract sign-offs, safeword trigger, customizable boundary/duty limits. | Submission habit streaks, XP points, customizable reward store & punishment wheel. | Contractual duty assignment loop with gamified D/s reward & penalty economy. |
| **7. WeAreX** | Alternative lifestyle discovery, fetish event ticketing, party guestlist vetting, verified kink badges. | Granular privacy tiers, private photo vaults, guestlist privacy (visible only to hosts/attendees). | Event-driven community network, interest circles, solo & couple event registration. | Host-approved guestlist vetting, physical event code-of-conduct enforcement, verified host badges. | Event check-in badges, community reputation tiers, exclusive vetted party invites. | Seamless bridge between digital kink identity verification and physical event guestlists. |
| **8. 3Fun** | Couples seeking singles/couples, paired profile control, dual swiping, paired private album keys. | Anti-screenshot watermark shield, Paired Private Album Key decryption, hidden distance. | Couples & singles matching in 3-way/group dynamics; shared partner chat. | Dual-partner photo verification, paired consent link confirmation, anti-solicitation filters. | Daily free match allocation, secret photo unlock requests, couple compatibility ratings. | Paired Private Vault Key architecture requiring cryptographic dual-partner consent. |

---

## Deep Dive Analysis per Platform

### 1. Mazmo.net (Kink Community & Reputation)

**Product Positioning & Core Architecture:**  
Mazmo.net operates as the premier Spanish-speaking social network dedicated exclusively to BDSM, fetishism, and kink lifestyles. Unlike mainstream swipe-based apps, Mazmo prioritizes community depth, structured fetish taxonomies, and forum-based discussion. Users build granular kink profiles where they rank their interest, experience, and role across hundreds of specific fetishes (ranging from bondage and sensory deprivation to electro-stimulation and pet play). The architecture centers around member profiles, interest groups, localized "munch" (informal non-play kink meetups) agendas, and direct messaging between members.

**Privacy, Security, & Consent Engineering:**  
Mazmo recognizes the severe real-world stigma and professional risks associated with alternative lifestyles. It implements a multi-tiered photo album system: Public Photos (visible to logged-in members), Friends-Only Photos, and Password-Locked Private Vaults. Users maintain total pseudonymity with custom handles and no requirement for real-name verification. Profile indexing by search engines (Google, Bing) is strictly blocked via `robots.txt` and anti-scraping headers. However, because Mazmo runs on standard web database infrastructure, user data and unencrypted direct messages reside on central servers, creating a single point of failure if backend databases are compromised.

**UX/UI Design & Gamification Dynamics:**  
The user interface reflects a classic forum-community hybrid, utilizing deep dark themes with accent highlights. Engagement is driven through community reputation mechanisms: user profiles display karma points earned through helpful forum contributions, verified event organizing, and community trust votes. Users are motivated to maintain high activity levels to unlock higher platform reputation tiers, which grants them access to restricted community boards and private event listings. D/s relationships can be formally indicated on profiles via linked partner badges (e.g., "Property of [User]" or "Dominant to [User]").

**Strategic Evaluation & Gaps:**  
Mazmo excels in community building and taxonomy granularity but suffers from legacy web UI design, lack of end-to-end encryption in private chats, and absent mobile app integration. Its reliance on server-side stored private photo keys leaves users vulnerable to internal database breaches.

---

### 2. Pure (Ephemeral Desires & Zero Digital Footprint)

**Product Positioning & Core Architecture:**  
Pure is an ultra-spontaneous, anonymous hookup and kink application engineered around the principle of zero digital footprint. It strips away the concept of permanent user profiles, social feeds, and historic match lists. Users enter the app by broadcasting an instant "Wish"—a short textual description of their immediate desire, kink, or fantasy—which remains active on a localized bulletin board for a maximum of 24 hours. Matching occurs when another user accepts the wish, immediately spawning a temporary 24-hour chat room.

**Privacy, Security, & Consent Engineering:**  
Pure’s core differentiator is its aggressive data decay architecture. Once a 24-hour chat session expires, all conversation history, shared images, and voice notes are permanently purged from client devices and backend servers. Photos sent within chats are self-destructing (view-once or timed) and protected by native anti-screenshot shields (rendering screens black on iOS/Android or notifying the sender immediately). Registration requires no social media links, and location data is scrambled into regional zones rather than precise coordinates, preventing triangulation.

**UX/UI Design & Gamification Dynamics:**  
Pure’s visual identity is minimalist, dark, and sensual, utilizing bold typography and high-contrast monochrome aesthetics. The app leverages extreme time-pressure gamification: a prominent 24-hour countdown timer ticks down continuously during chat sessions. Users must either meet up, exchange off-platform contact details, or mutually agree to extend the timer before time runs out. This creates an intense sense of urgency, cutting through superficial small talk and encouraging honest, direct communication regarding sexual boundaries and desires.

**Strategic Evaluation & Gaps:**  
Pure represents the gold standard for spontaneous ephemeral matching. However, its complete lack of profile persistence makes it unsuited for long-term D/s tracking, structured compatibility analysis, or multi-session relationship growth. Furthermore, chats are managed via centralized WebSocket servers which, despite purge policies, retain transient unencrypted payloads in memory during active windows.

---

### 3. Feeld (Fluid Identities & Linked Profiles)

**Product Positioning & Core Architecture:**  
Feeld (formerly 3nder) is the leading global dating platform designed for open-minded singles and couples exploring polyamory, non-monogamy, kink, and diverse gender identities. Feeld revolutionized alternative dating by introducing **Linked Profiles**, allowing two partners to link their independent accounts into a unified couple identity. Users can navigate the platform either as an individual or as a paired unit, matching with other singles or couples.

**Privacy, Security, & Consent Engineering:**  
Feeld addresses privacy by offering an "Incognito Mode" (a premium feature) that hides user profiles from Facebook friends or contacts in their phone directory, ensuring profiles are only visible to users they have actively swiped right on. Feeld supports over 30 gender identities and 20 sexual orientations, enforcing explicit boundary setting through "Desire Tags" (`#kink`, `#rope`, `#ethicalnonmonogamy`). Profiles feature explicit relationship structure disclosures (e.g., solo poly, hierarchical poly, swinging couple), ensuring informed consent before interaction begins.

**UX/UI Design & Gamification Dynamics:**  
Feeld employs a sleek, architectural dark-mode design with warm accent colors (coral and off-white), establishing a sophisticated, non-judgmental atmosphere. Swiping mechanics are augmented by "Pings"—high-intent super-likes that notify the recipient immediately. Dual-profile pairing creates a unique collaborative UI where both partners receive match notifications and can participate in shared group chats with prospective matches, fostering joint decision-making and mutual transparency.

**Strategic Evaluation & Gaps:**  
Feeld’s paired profile mechanic is an industry benchmark for non-monogamous dating. However, frequent cloud database outages, slow chat synchronization, unencrypted server storage of match histories, and paywalled privacy features (such as hiding online status or incognito mode) create user friction and privacy exposure for non-paying kinksters.

---

### 4. Chyrpe (Female-First Security & Anti-Creep Shield)

**Product Positioning & Core Architecture:**  
Chyrpe is a specialized high-security dating application built specifically to address female safety, consent enforcement, and anti-harassment in digital intimacy. Recognizing that women on mainstream and kink dating platforms face overwhelming levels of unsolicited explicit material, aggressive behavior, and fake profiles, Chyrpe mandates a strict multi-stage verification pipeline before any account can access the platform network.

**Privacy, Security, & Consent Engineering:**  
Security on Chyrpe is engineered into every layer of the software stack:
1. **Biometric & Identity Gate:** Every user must complete a mandatory live 3D facial video scan cross-referenced with official identity documentation via automated AI pipelines to eliminate bots, catfishes, and banned repeat offenders.
2. **Anti-Leak Media Shielding:** Photos shared within profiles or chats are dynamically embedded with invisible digital watermarks unique to the recipient. If a screenshot or screen recording occurs, the offending user's account is permanently banned, and the watermark identifies the source of the leak.
3. **Reverse-Image Protection:** Uploaded images undergo automated pixel perturbation to prevent bad actors from performing reverse Google image searches to dox users' real-world identities or LinkedIn profiles.

**UX/UI Design & Gamification Dynamics:**  
The app features an elegant, high-contrast dark aesthetic with deep violet and gold accents, conveying safety and premium quality. Gamification centers around a **Trust Score**: users who maintain verified status, receive positive feedback on respectful communication, and complete privacy training earn Trust Badges. Female users hold exclusive initiation privileges in specific interaction modes, ensuring they maintain control over when and how conversations open.

**Strategic Evaluation & Gaps:**  
Chyrpe sets the industry benchmark for female safety and verification. However, mandatory real-ID/biometric verification requires users to trust Chyrpe’s central servers with sensitive biometric hashes and government identification data, creating a massive honeypot risk for privacy-obsessed kink users who demand total anonymity.

---

### 5. Grindr (Proximity Radar & Tactical Safety)

**Product Positioning & Core Architecture:**  
Grindr is the world’s largest location-based social networking app for gay, bi, trans, and queer men. Built around a real-time location grid, Grindr displays user profile thumbnails sorted strictly by geographic proximity (from nearest to furthest). It serves as an instant radar for local connections, casual hookups, and specialized kink subcultures (e.g., Leather, Bear, Trans, BDSM).

**Privacy, Security, & Consent Engineering:**  
Operating in over 190 countries—including jurisdictions where non-heteronormative sexuality is criminalized—Grindr has developed robust tactical safety controls:
* **Distance Concealment & Fuzzing:** Users can disable the "Show Distance" toggle or enable location fuzzing, which places their grid position within a randomized radius rather than broadcasting precise GPS coordinates.
* **Discrete App Icon:** The app offers customizable launcher icons, allowing users to disguise Grindr on their phone home screen as a standard calculator, calendar, or notes app.
* **Discreet Mode in High-Risk Zones:** When entering countries with hostile legal regimes, Grindr automatically disables distance displays and broadcasts safety alerts informing users of local security risks.
* **Sexual Health Disclosures:** Users can opt to display verified HIV status, last test date, and PrEP usage, normalizing health consent.

**UX/UI Design & Gamification Dynamics:**  
Grindr’s signature dark yellow and jet-black interface is optimized for rapid scanning. The primary interaction is the "Tap"—a single-touch icon (Flame, Devil, Hello, Looking) allowing instant interest expression without typing text. Profile view counters and real-time online status dots create hyper-addictive feedback loops, encouraging frequent app opens throughout the day.

**Strategic Evaluation & Gaps:**  
Grindr’s proximity mechanics are unmatched for speed. However, historical security vulnerabilities (such as third-party location triangulation attacks), lack of zero-knowledge profile encryption, and heavy ad-tracking SDK integrations have repeatedly compromised user privacy in vulnerable regions.

---

### 6. Obedience App (D/s Duty Tracking & Reward Economy)

**Product Positioning & Core Architecture:**  
Obedience App is a specialized relationship management and habit-building application tailored specifically for Dominant/submissive (D/s) power-exchange dynamics. Unlike dating apps, Obedience does not facilitate user discovery; instead, it provides a structured digital framework for established D/s dyads to manage daily duties, discipline routines, habit streaks, and reward/punishment enforcement.

**Privacy, Security, & Consent Engineering:**  
Because power-exchange data involves intimate sexual agreements and personal habits, Obedience isolates user relationships into private paired dyads linked via unique cryptographic pairing tokens. The app requires local PIN/Biometric authentication upon launch. Consent is institutionalized through digital **Contract Sign-offs**, where both Dominant and submissive must explicitly agree to task categories, intensity levels, and boundary limits before duties become active. A universal Safeword feature allows submissives to pause or reset duty queues instantly.

**UX/UI Design & Gamification Dynamics:**  
Obedience utilizes a stark obsidian and leather-accented UI design. The app features a rich gamified economy:
* **Duty Queue:** The Dominant assigns daily or weekly tasks (e.g., posture checks, hydration goals, chastity logs, evening reflections).
* **Habit Streaks & XP:** Submissives earn XP and maintain streak multipliers by submitting timely task completion logs (with optional photo/note proof).
* **Reward Economy:** Accumulated XP points can be redeemed in a custom **Reward Shop** pre-configured by the Dominant (e.g., "1 Hour Massage", "Orgasm Permission", "Custom Fantasy Grant").
* **Punishment/Penalty Wheel:** Missed tasks or failed streaks automatically incur penalty points or trigger a randomized punishment wheel configured within safe, agreed boundaries.

**Strategic Evaluation & Gaps:**  
Obedience App is the gold standard for D/s habit tracking and power-exchange gamification. Its key weakness is reliance on central cloud sync for paired updates without client-side zero-knowledge encryption, meaning intimate duty logs and photos are stored in plaintext on third-party servers.

---

### 7. WeAreX (Alternative Lifestyle & Event Vetting)

**Product Positioning & Core Architecture:**  
WeAreX is a modern alternative lifestyle and kink community platform designed to merge digital networking with real-world fetish events, play parties, and lifestyle festivals. It operates as both a personal discovery network and an event management ecosystem, catering to sex-positive singles, couples, and organizers across Europe and North America.

**Privacy, Security, & Consent Engineering:**  
WeAreX integrates robust privacy controls designed around event safety:
* **Verified Kink Badges:** Users undergo profile vetting by event organizers or community ambassadors to earn verified kink badges (`#shibari`, `#impact`, `#swinger`).
* **Guestlist Privacy Shield:** Event guestlists are strictly obfuscated. Users attending a fetish party can choose to remain invisible on the public guestlist, revealing their attendance status only to verified party hosts or mutual matches.
* **Encrypted Private Vaults:** Users store sensitive play pictures in private albums accessible only via explicit request-and-grant permissions.

**UX/UI Design & Gamification Dynamics:**  
WeAreX features a sleek, dark neon aesthetic with vibrant magenta and cyan accents, reminiscent of high-end nightlife branding. The UX seamlessly transitions between digital profile swiping and an interactive **Event Radar**. Users are incentivized to build their community reputation through verified party attendances, check-in badges, and organizer vouching.

**Strategic Evaluation & Gaps:**  
WeAreX excels at bridging digital profiles with physical kink party access. However, event ticketing and guestlist management require central database record-keeping, leaving event attendance history exposed to potential server-side data leaks or regulatory scrutiny.

---

### 8. 3Fun (Threesome Matching & Paired Vault Keys)

**Product Positioning & Core Architecture:**  
3Fun is the leading global dating app specifically engineered for couples and singles seeking threesomes, group sex, and swinger relationships. The platform accommodates three distinct user configurations: Single Female, Single Male, and Couples. Couple profiles are managed jointly by both partners, ensuring both individuals have equal visibility and control over incoming messages and matches.

**Privacy, Security, & Consent Engineering:**  
3Fun places heavy emphasis on anti-exposure and dual-consent mechanisms:
* **Paired Private Vault Keys:** Private photo albums are secured behind a dual-encryption key model. A couple's private album cannot be unlocked by a prospective match unless **both** partners grant cryptographic approval.
* **Anti-Screenshot Watermarking:** Images displayed in chat or private albums feature dynamic user-ID watermarking to deter unauthorized distribution.
* **Dual Photo Verification:** To prevent fake couple profiles, both partners must upload real-time pose verification selfies before receiving the "Verified Couple" checkmark.

**UX/UI Design & Gamification Dynamics:**  
3Fun adopts a deep midnight-blue and violet interface. Swiping is modified for group dynamics: swiping right on a couple profile sends an invitation to both partners simultaneously. Group chat rooms allow three or four users to converse in a single thread once a match is formed. Daily match cards, secret photo request buttons, and compatibility scores drive user retention.

**Strategic Evaluation & Gaps:**  
3Fun’s paired private vault and dual verification are major technical strengths for couple safety. However, persistent spam profiles, unencrypted chat logs on backend servers, and aggressive monetization paywalls for basic privacy filters detract from the user experience.

---

## Synthesis: Lessons for CompatKink & Feature Adaptations

### 1. Architectural & Privacy Parity Matrix

The primary takeaway from this 8-platform benchmark is that **no existing market competitor combines advanced kink mechanics with true Zero-Knowledge Client Encryption**. The table below demonstrates CompatKink's architectural superiority:

| Architectural Dimension | Industry Standard (Feeld, Pure, Grindr, Obedience) | CompatKink Zero-Knowledge Paradigm |
| :--- | :--- | :--- |
| **Data Storage** | Plaintext or server-side encrypted SQL databases (AWS/GCP). | **Client-Side Encrypted Blobs** (`ck1:` format via AES-GCM-256). Supabase sees zero plaintext. |
| **Key Derivation** | Server-managed user sessions & JWT tokens. | **Client PBKDF2 Key Derivation** (100,000 iterations from local master PIN/passphrase). |
| **Session Invitations** | Central server link creation & user ID mapping. | **Asymmetric ZK Invite Tokens** (CSPRNG secret payload passed via URL fragment `#k=`). |
| **Discreet Emergency** | App lock screen or icon change (local UI hide only). | **Panic Wipe & Canary PIN** (instantly purges local vault & generates fake decoy state). |
| **Data Decay** | Server cron jobs (Pure 24h purge relying on server trust). | **Client-Enforced ZK Expiry & Self-Destruct** (ciphertext automatically unrenderable upon key decay). |

---

### 2. Noir Íntimo Visual & Tactile System Adaptation

To convey safety, sophistication, and raw sensory focus, CompatKink adapts design cues from Pure, Chyrpe, and Obedience into the **Noir Íntimo** design system:

* **Color Palette:** Deep matte obsidian background (`#09090b`), slate dark cards (`#18181b`), obsidian chrome borders (`#27272a`), with accents of latex crimson (`#dc2626`) and leather gold (`#d97706`).
* **Tactile Feedback & Haptics:** Subtle haptic ticks on activity selection, heavy haptic feedback on Safeword triggering, and smooth slider dynamics for intensity scoring.
* **Anti-Peeping UI:** Privacy curtains on pass-and-play step switches, blurred response cards until explicit touch-and-hold activation, and zero background snapshot caching in iOS/Android app switchers.

---

### 3. Concrete Feature Extraction & Adaptation Plan for CompatKink

Based on this benchmark analysis, six (6) key architectural modules are extracted and adapted directly into CompatKink's local ZK vault framework:

```
+-----------------------------------------------------------------------------------+
|                           COMPATKINK ZK ARCHITECTURE                              |
+-----------------------------------------------------------------------------------+
                                          |
     +------------------------------------+------------------------------------+
     |                                    |                                    |
     v                                    v                                    v
[MODULE A: D/s DUTY ENGINE]      [MODULE B: 24h ZK WISHES]           [MODULE C: POLY MATRIX]
(From Obedience App)             (From Pure Ephemeral)               (From Feeld & 3Fun)
- Local ZK Duty Ledger           - Encrypted 24h Expiry              - N x N Compatibility
- Streak & XP Economy            - Asymmetric Token `#k=`            - Unanimous Matches
- Canaries & Safeword            - Self-Destruct Ciphertext          - Hard Limit Vetos
     |                                    |                                    |
     +------------------------------------+------------------------------------+
                                          |
     +------------------------------------+------------------------------------+
     |                                    |                                    |
     v                                    v                                    v
[MODULE D: ANTI-CREEP SHIELD]    [MODULE E: TACTICAL STEALTH]        [MODULE F: SCENE ENGINE]
(From Chyrpe & Mazmo)            (From Grindr Tactical)              (From WeAreX & Mazmo)
- ZK Identity Hash               - Office Mode / Calculator          - Shibari/Impact Sequences
- Asymmetric Invitation          - Panic Wipe Canary PIN             - Live Play Timers
- Zero-Plaintext Consent         - Stealth Icon Disguise             - Emergency Safeword
```

#### Module A: D/s Tasks & Habit Engine with Reward Economy (Inspired by Obedience App)
* **Adaptation:** Create a local, vault-encrypted D/s Duty Ledger (`lib/storage/debriefStorage.ts` & `stores/homeStore.ts`).
* **ZK Implementation:** Dominants assign daily duties; submissives log progress. All task descriptions, photo proofs, and streak counters are encrypted with the local vault key before storage.
* **Mechanics:**
  * **Submission Streaks:** Daily check-in counter calculating streak multipliers.
  * **Reward Economy:** XP points earned on task completion, redeemable in a local custom Reward Shop.
  * **Safeword Override:** Immediate local freeze of duty queues if either partner invokes the safeword.

#### Module B: 24h Ephemeral ZK Wishes & Link Sessions (Inspired by Pure)
* **Adaptation:** Transform static questionnaire sessions into 24-hour decaying ZK Ephemeral Wish sessions.
* **ZK Implementation:** Invitations pass encrypted wish payloads via URL hash fragment (`#k=...`). Supabase only receives an anonymous session ID with a hard 48h TTL (`expires_at` enforced via RPC rate-limits).
* **Mechanics:**
  * **24h Decay Timer:** Session auto-expires after 24 hours of inactivity.
  * **Asymmetric Match Reveal:** Guest answers remain sealed in local storage until both parties complete their inputs, triggering local decryption and match calculation.

#### Module C: Poly & Group Compatibility Matrix (Inspired by Feeld & 3Fun)
* **Adaptation:** Extend 1-on-1 compatibility checks into N-way group matrix analysis (`lib/polyCompatibility.ts` & `PolyPairwiseMatrix.tsx`).
* **ZK Implementation:** Supports 3+ participants (triads, quads, play groups). Each participant encrypts their response vector locally.
* **Mechanics:**
  * **Unanimous Matches (100% Group Green Light):** Activities accepted by all N participants.
  * **Group Vetos (Hard Limits):** If ANY single participant marks an activity as a Hard Limit (🛑), the activity is instantly red-flagged for the entire group to enforce absolute consent.

#### Module D: Verification & Anti-Creep Safeguards (Inspired by Chyrpe & Mazmo)
* **Adaptation:** Client-side ZK identity verification and asymmetric invitation gates.
* **ZK Implementation:** No central storing of government IDs. Verification relies on local CSPRNG token generation (`generateInviteSecret`) and local cryptographic proof validation.
* **Mechanics:** Unsolicited outreach is impossible because session entry requires an explicit, cryptographically signed invitation link generated by the session host.

#### Module E: Tactical Stealth & Discreet Controls (Inspired by Grindr)
* **Adaptation:** Emergency privacy protection and discreet application operation.
* **ZK Implementation:** Integrated into `lib/biometrics.ts` and `VaultLockGate.tsx`.
* **Mechanics:**
  * **Office Mode:** Instant shortcut (`Cmd+Shift+O` or shake gesture) replacing the screen with a benign corporate spreadsheet or documentation view.
  * **Panic Wipe PIN:** Entering a dedicated Canary PIN on the lock screen instantly purges all local storage vault keys, restoring the app to an uninitialized factory state.

#### Module F: Kink Taxonomy & Scene Builder Engine (Inspired by WeAreX & Mazmo)
* **Adaptation:** Structured scene preparation and live execution timers (`lib/sceneTemplateManager.ts` & `components/scene-builder/*`).
* **ZK Implementation:** Custom scene sequences (warm-up, main play, aftercare) stored encrypted in local vault.
* **Mechanics:** Pre-curated templates (Shibari Gentle, Impact Warm-Up, Sensory Deprivation) featuring active timers, sequence steps, and instant visual/haptic Safeword buttons.

---

## Conclusion & Handoff Checklist

This benchmark matrix establishes the strategic and technical specification for CompatKink's feature set. By synthesizing the best mechanics from Mazmo, Pure, Feeld, Chyrpe, Grindr, Obedience, WeAreX, and 3Fun while replacing centralized cloud vulnerabilities with Zero-Knowledge Client Encryption, CompatKink creates an unassailable value proposition for privacy-conscious adult users.

### Deliverables Summary
* **Benchmark Matrix Document:** `docs/BENCHMARK_MATRIX.md` (Completed)
* **Next Implementation Steps:** Refer to `ROADMAP.md` and `PROJECT.md` for execution by implementation agents.
