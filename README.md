# DevQuest

DevQuest is a gamified study app for software engineering. It mixes structured learning paths, AI-generated lessons and coding labs, progression mechanics, and a mobile-first experience that runs on the web and on Android.

The project was built in React/Vite and later packaged for Android with Capacitor. Today, Supabase powers authentication, cloud persistence, encrypted per-user Gemini keys, cached generated content, and lesson/lab notes.

## Highlights

- Learning paths for Data Structures, AWS, Backend, System Design, Testing, and Performance
- AI-generated lessons, quizzes, coding labs, and free-topic practice sessions
- XP, levels, streaks, lives, Study Points, rewards, companion and avatar progression
- Default rewards plus custom rewards created by the user
- Per-user notes attached to lessons and labs
- PWA support and Android release build

## Stack

- Frontend: React 19, TypeScript, Vite
- Routing: `HashRouter`
- Backend: Supabase Auth, Postgres, Edge Functions
- AI: Gemini behind `gemini-proxy`
- Hosting: Vercel
- Mobile: Capacitor + Android

## How it works

- Users sign in with email/password
- Each user stores their own Gemini key through the authenticated backend flow
- Supabase becomes the source of truth after login
- Generated lessons and labs are cached per user
- Notes are saved per user and per content item

## Local setup

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
npm run build
npm run lint
npm run preview
npm run android:sync
npm run android:open
```

## Deploy

Web deploy uses Vercel with:

- build command: `npm run build`
- output directory: `dist`

Backend deploy uses Supabase:

```bash
supabase link --project-ref <project-ref>
supabase db push
supabase functions deploy gemini-proxy
```

## Android

The Android project lives in `android/`, generated from the web app with Capacitor.

Release APK output:

```text
android/app/build/outputs/apk/release/app-release.apk
```

## Important files

- [package.json](/C:/Users/didi/Desktop/projetos/study-app/package.json)
- [vite.config.ts](/C:/Users/didi/Desktop/projetos/study-app/vite.config.ts)
- [capacitor.config.ts](/C:/Users/didi/Desktop/projetos/study-app/capacitor.config.ts)
- [src/context/GameStateContext.tsx](/C:/Users/didi/Desktop/projetos/study-app/src/context/GameStateContext.tsx)
- [src/context/AuthContext.tsx](/C:/Users/didi/Desktop/projetos/study-app/src/context/AuthContext.tsx)
- [src/components/SessionModal.tsx](/C:/Users/didi/Desktop/projetos/study-app/src/components/SessionModal.tsx)
- [src/pages/SkillTreePage.tsx](/C:/Users/didi/Desktop/projetos/study-app/src/pages/SkillTreePage.tsx)
- [src/pages/PracticePage.tsx](/C:/Users/didi/Desktop/projetos/study-app/src/pages/PracticePage.tsx)
- [src/pages/ShopPage.tsx](/C:/Users/didi/Desktop/projetos/study-app/src/pages/ShopPage.tsx)
- [supabase/functions/gemini-proxy/index.ts](/C:/Users/didi/Desktop/projetos/study-app/supabase/functions/gemini-proxy/index.ts)

## Status

Implemented today:

- onboarding and auth
- cloud sync
- per-user AI key flow
- generated content cache
- notes on lessons and labs
- reward shop
- Android packaging
