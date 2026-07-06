# DevQuest

DevQuest is a mobile-first, gamified learning app for software engineering. It combines structured roadmaps, AI-generated lessons, applied labs, personal analytics, rewards, streaks, companions, and Android packaging through Capacitor.

The app is built as a React/Vite web app and can run as a PWA or Android APK. Supabase powers authentication, cloud persistence, encrypted per-user Gemini keys, generated-content cache, notes, progress, SRS, analytics, and offline sync.

## Product Highlights

- 15 learning paths, including DSA, AWS, Backend, System Design, Git, Linux, Networking, Security, DevOps, Advanced TypeScript, AI Engineering, and Design Patterns.
- Every node has 3 progression depths: `Learn`, `Deepen`, and `Master`.
- AI-generated lessons, dense quizzes, coding labs, teach-back assessments, flashcards, reviews, and daily challenges.
- Skill tree with path catalog, global search, level assessment, node progress indicators, and mastery badges.
- Gamification with XP, Study Points, streaks, lives, rewards, avatar gear, cosmetics, and companion progression.
- Personal analytics with next-best-action, weak topics, weekly performance, heatmap, and path leaderboard.
- Offline support for recent sessions, queued progress sync, notes, manual labs, and cached content.
- JavaScript/TypeScript lab runner via Sandpack for supported labs.

## Stack

- Frontend: React 19, TypeScript, Vite, React Router
- Mobile/PWA: Capacitor, Android, Vite PWA
- Backend: Supabase Auth, Postgres, Edge Functions
- AI: Gemini through authenticated `gemini-proxy`
- Storage: Supabase + IndexedDB offline cache
- Testing: Vitest, React Testing Library, Playwright
- Hosting: Vercel

## How It Works

- Users sign in with email/password and save their own Gemini key.
- The Gemini key is stored behind the backend flow, not directly in frontend state.
- Supabase becomes the source of truth after login.
- Generated content is cached by user, node, depth, model, and content type.
- Progress is tracked by node depth: `0 | 1 | 2 | 3`.
- `Learn` unlocks the next node; `Deepen` and `Master` improve mastery and rewards.
- Notes, quiz results, study events, SRS reviews, assessments, and lab completions persist per user.

## Local Setup

Create `.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_key
VITE_GEMINI_MODEL=gemini-3-flash-preview
```

Install and run:

```bash
npm install
npm run dev
```

Useful commands:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run android:sync
npm run android:open
```

## Deploy

Vercel:

- Build command: `npm run build`
- Output directory: `dist`

Supabase:

```bash
supabase link --project-ref <project-ref>
supabase db push
supabase functions deploy gemini-proxy
```

## Android

The Android project lives in `android/` and is generated from the web app with Capacitor.

Release APK output:

```text
android/app/build/outputs/apk/release/app-release.apk
```

Generate/update Android project:

```bash
npm run android:sync
npm run android:open
```

## Key Files

- `src/config/paths.ts` — learning paths, nodes, depth topics, validation
- `src/config/expansionPaths.ts` — expanded professional tracks
- `src/context/GameStateContext.tsx` — progress, rewards, sync, progression rules
- `src/context/AuthContext.tsx` — auth and Gemini key status
- `src/components/SessionModal.tsx` — Learn/Deepen/Master sessions
- `src/pages/SkillTreePage.tsx` — path catalog, search, tree, assessment entry
- `src/services/analyticsService.ts` — dashboard data and performance summaries
- `src/services/offlineStorageService.ts` — IndexedDB offline cache and queue
- `src/services/geminiService.ts` — frontend AI contract
- `supabase/functions/gemini-proxy/index.ts` — secure Gemini proxy

## Status

MVP is usable on web/PWA and Android. Current focus is product polish, content quality, UX improvements, and continued validation across mobile flows.
