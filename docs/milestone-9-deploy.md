# Milestone 9 deploy notes

## Local env

Create `.env.local`:

```env
VITE_SUPABASE_URL=https://ugnsjiyhxpsbayfvqkvf.supabase.co
VITE_SUPABASE_ANON_KEY=<publishable key>
VITE_GEMINI_MODEL=gemini-3-flash-preview
```

## Supabase

Install/login the Supabase CLI, then run:

```powershell
supabase link --project-ref ugnsjiyhxpsbayfvqkvf
supabase db push
supabase secrets set GEMINI_API_KEY="<gemini key>"
supabase functions deploy gemini-proxy
```

In Supabase Auth, enable:

- Email/password
- Google OAuth

For web deploys, add the Vercel URL to Supabase Auth redirect URLs.
For Android OAuth, add the Capacitor app URL scheme after the APK package is finalized.

## Vercel

Create/import project from `diogodls/study-app` and configure:

```env
VITE_SUPABASE_URL=https://ugnsjiyhxpsbayfvqkvf.supabase.co
VITE_SUPABASE_ANON_KEY=<publishable key>
VITE_GEMINI_MODEL=gemini-3-flash-preview
```

Build command: `npm run build`
Output directory: `dist`

## Android APK

The Capacitor project is generated in `android/`.

Sync web assets:

```powershell
npm run android:sync
```

Release APK:

```powershell
cd android
copy key.properties.example key.properties
# edit key.properties with your local keystore passwords
keytool -genkeypair -v -keystore devquest-release.keystore -alias devquest -keyalg RSA -keysize 2048 -validity 10000
.\gradlew.bat assembleRelease
```

Output path:

```text
android/app/build/outputs/apk/release/app-release.apk
```

If Android Studio is installed, use:

```powershell
npm run android:open
```

Then build `Build > Generate Signed Bundle / APK`.
