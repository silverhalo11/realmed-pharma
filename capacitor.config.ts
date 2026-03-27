import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.realmed.pharma',
  appName: 'RealMed Pharma',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
  },
};

export default config;
