import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.edumanage.school',
  appName: 'EduManage',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    url: 'https://workspace.ikramashaikh.replit.app',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#3b82f6",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#ffffff",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true,
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#3b82f6"
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#3b82f6",
    },
    Keyboard: {
      resize: "body",
      style: "DARK",
      resizeOnFullScreen: true,
    }
  }
};

export default config;