# Project: Compatikink - Fetish Social & Dating Suite

## Architecture
- Framework: Expo / React Native Web (Expo Router v3)
- Language: TypeScript
- Target Platforms: Web, Mobile (Responsive Desktop >768px and Mobile <=768px)
- Security: AES-GCM-256 Client-Side Zero-Knowledge Encryption (Vault integration)
- UI Style: Latex Negro Brillante (#0a0612 dark background, #c084fc neon purple, glossy latex accents)

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | User Manual & Initial Features | Interactive manual screen, PDF/MD export, 30 module guides | none | DONE |
| M5 | Deep Competitive Benchmark | Research 8+ platforms (FetLife, KinkD, Feeld, Whiplr, Submitty, JoyClub, BDSM Test, Kink Academy) & Codebase Audit | M1 | IN_PROGRESS |
| M6 | Zero-Knowledge Architecture & UI Spec | Technical E2EE privacy spec & Latex Negro Brillante design tokens | M5 | PLANNED |
| M7 | Fetish Social & Dating Suite Implementation | Enriched Profiles with Badges, Events & Munches, Community Feed, Dashboard tabs, Manual Data | M6 | PLANNED |
| M8 | Verification, Web Export & Forensic Audit | `npx expo export --platform web`, Reviewer, Challenger, Forensic Auditor | M7 | PLANNED |

## Code Layout
- `app/`: Expo Router pages (`index.tsx`, `dating.tsx`, `events.tsx`, `kink-feed.tsx`, `quick-profile.tsx`, `manual.tsx`, etc.)
- `components/`: UI components (`FetishProfileCard.tsx`, `BadgeSelector.tsx`, `EventsMunchModule.tsx`, `CommunityFeedModule.tsx`, etc.)
- `lib/`: Encryption & Vault utilities (`vault.ts`, `exportManualPDF.ts`, `exportMarkdown.ts`)
- `data/`: `manualData.ts`, `kinkCategories.ts`, etc.
- `types/`: Data models & TypeScript interfaces
