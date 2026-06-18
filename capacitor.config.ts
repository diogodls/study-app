import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.devquest.app',
  appName: 'DevQuest',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    LocalNotifications: {
      iconColor: '#8b5cf6',
      presentationOptions: ['badge', 'sound', 'banner', 'list'],
    },
  },
};

export default config;
