import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.smartschoolpro',
  appName: 'SmartSchoolPro',
  // Pasta gerada por `bun run cap:sync` (scripts/build-capacitor.mjs)
  webDir: 'capacitor-www',
  android: {
    allowMixedContent: true,
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#5B7FA6',
      sound: 'beep.wav',
    },
  },
};

export default config;
