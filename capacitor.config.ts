import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.eea2433ec6b84d5297d7b1927d41173c',
  appName: '보건일지',
  webDir: 'dist',
  server: {
    url: "https://eea2433e-c6b8-4d52-97d7-b1927d41173c.lovableproject.com?forceHideBadge=true",
    cleartext: true
  }
};

export default config;
