import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { App } from '@capacitor/app';

interface DeviceInfo {
  isNative: boolean;
  platform: 'ios' | 'android' | 'web';
  isIOS: boolean;
  isAndroid: boolean;
  deviceInfo?: any;
}

export function useMobile() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isNative: false,
    platform: 'web',
    isIOS: false,
    isAndroid: false,
  });

  useEffect(() => {
    const initializeDevice = async () => {
      const isNative = Capacitor.isNativePlatform();
      const platform = Capacitor.getPlatform() as 'ios' | 'android' | 'web';
      
      let info = null;
      if (isNative) {
        info = await Device.getInfo();
        
        // Configure status bar for mobile
        if (platform === 'ios' || platform === 'android') {
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setBackgroundColor({ color: '#3b82f6' });
        }
      }

      setDeviceInfo({
        isNative,
        platform,
        isIOS: platform === 'ios',
        isAndroid: platform === 'android',
        deviceInfo: info,
      });
    };

    initializeDevice();

    // Handle app state changes
    const handleAppStateChange = (state: any) => {
      console.log('App state changed:', state);
    };

    if (Capacitor.isNativePlatform()) {
      App.addListener('appStateChange', handleAppStateChange);
      
      // Handle back button on Android
      if (Capacitor.getPlatform() === 'android') {
        App.addListener('backButton', ({ canGoBack }) => {
          if (!canGoBack) {
            App.exitApp();
          } else {
            window.history.back();
          }
        });
      }
    }

    return () => {
      if (Capacitor.isNativePlatform()) {
        App.removeAllListeners();
      }
    };
  }, []);

  return deviceInfo;
}

export function useKeyboard() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const showListener = Keyboard.addListener('keyboardWillShow', (info) => {
        setKeyboardHeight(info.keyboardHeight);
        setIsKeyboardOpen(true);
      });

      const hideListener = Keyboard.addListener('keyboardWillHide', () => {
        setKeyboardHeight(0);
        setIsKeyboardOpen(false);
      });

      return () => {
        showListener.remove();
        hideListener.remove();
      };
    }
  }, []);

  return { keyboardHeight, isKeyboardOpen };
}