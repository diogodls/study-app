import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.devquest.app',
  appName: 'DevQuest',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
