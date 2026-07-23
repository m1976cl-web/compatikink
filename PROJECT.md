# Project: Compatikink

## Architecture
- Framework: Expo / React Native Web (Expo Router)
- Language: TypeScript
- Target Platforms: Web, Mobile (Responsive Desktop >768px and Mobile <=768px)

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Exploration & Architecture | Codebase mapping, component analysis, script verification | none | DONE |
| 2 | R1: Responsive Redesign | 2-column desktop (>768px) layout on Dashboard, Report, Compass; micro-interactions & glow | M1 | DONE |
| 3 | R2: Mood Filters & Dynamic Interaction | Mood classification (4 atmospheres), dynamic grouping, Card/List questionnaire, Scene Planner | M1, M2 | DONE |
| 4 | R3: Web Build & Deployment | `npx expo export --platform web`, deployment to gh-pages branch | M2, M3 | DONE |

## Code Layout
- `app/`: Expo Router pages (index.tsx, report.tsx, questionnaire.tsx, compass.tsx, etc.)
- `components/`: UI components (CompatibilityInfographic.tsx, ReportCard.tsx, ScenePlannerModal.tsx, SceneRouletteModal.tsx, SwipeDeckView.tsx, etc.)
- `constants/`, `types/`, `data/`: Data models, activity categories, mood definitions, types
- `hooks/`: Custom React hooks (`useResponsive.ts`, `useQuestionnaire.ts`, etc.)
