# CompatKink — Project Specification & Technical Roadmap

**Status:** Production Ready (v2.0)  
**Security Model:** Zero-Knowledge Client-Side AES-GCM-256  
**License:** Confidential / Proprietary

---

## 1. Core Value Proposition

CompatKink is an asymmetric, privacy-first platform that enables two individuals to explore intimate preferences, BDSM boundaries, roles, and safety protocols without revealing raw un-matched responses to each other or a central server.

### Key Differentiators:
1. **Asymmetric Privacy**: Host creates an invite code; guest responds blindly without seeing host answers; the app computes mutual matches, explore-together items, and limit conflicts.
2. **Zero-Knowledge Architecture**: Encryption and key derivation occur client-side (`PBKDF2-SHA-256` + `AES-GCM-256`).
3. **Canary (Decoy) PIN**: Protects against physical coercion or duress by unlocking a synthetic decoy state.

---

## 2. Social & Dating Suite Guidelines (M7 / P3.2 Content Moderation)

### 2.1 Content Moderation Policy
- **No Unencrypted Server Text**: Direct messages and journal entries are encrypted client-side (`ck1:`).
- **Public Handle Verification**: FetLife profile linkage verifies external handles via cryptographic badge badges.
- **Reporting Mechanism**: Local blocking & report flag storage for local content filtering.

---

## 3. Milestones & Priorities Matrix Summary

- **P0.1 Threat Model**: Complete (`docs/THREAT_MODEL.md`).
- **P0.2 Rate-Limiting & 48h Expiration**: Complete (`supabase/schema.sql`).
- **P0.3 Supabase RLS Audit**: Complete (`supabase/schema.sql`).
- **P0.4 Right to Be Forgotten**: Complete (`purgeAllUserData` + `app/privacy-policy.tsx`).
- **P0.5 Age Verification Gate**: Complete (`app/onboarding.tsx` 18+ DOB gate).
- **P1.1 Compatibility Tests**: Complete (`tests/compatibility.test.ts`).
- **P1.2 Integration Flow Tests**: Complete (`tests/integration.flow.test.ts`).
- **P1.3 GitHub Actions CI/CD**: Complete (`.github/workflows/ci.yml` & `audit.yml`).
- **P2.1 Privacy Policy & Consent**: Complete (`docs/PRIVACY_POLICY.md` & `app/privacy-policy.tsx`).
