import { App } from '@capacitor/app';
import { Keyboard } from '@capacitor/keyboard';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Network } from '@capacitor/network';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

export const isNativePlatform = () => Capacitor.isNativePlatform();

export const initializeCapacitor = async () => {
  if (!isNativePlatform()) return;

  // Set status bar style
  try {
    await StatusBar.setStyle({ style: Style.Dark });
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#18181b' });
    }
  } catch (error) {
    console.error('Error setting status bar:', error);
  }

  // Hide splash screen with fade
  try {
    await SplashScreen.hide({
      fadeOutDuration: 500
    });
  } catch (error) {
    console.error('Error hiding splash screen:', error);
  }

  // Add app state change listener
  App.addListener('appStateChange', ({ isActive }) => {
    console.log('App state changed. Is active?:', isActive);
  });

  // Add back button handler for Android
  App.addListener('backButton', ({ canGoBack }) => {
    if (!canGoBack) {
      App.exitApp();
    } else {
      window.history.back();
    }
  });

  // Add keyboard listeners
  Keyboard.addListener('keyboardWillShow', () => {
    document.body.classList.add('keyboard-is-open');
  });

  Keyboard.addListener('keyboardWillHide', () => {
    document.body.classList.remove('keyboard-is-open');
  });

  // Initialize network listeners
  Network.addListener('networkStatusChange', status => {
    console.log('Network status changed:', status.connected);
  });
};

export const CapacitorStorage = {
  set: async (key: string, value: any) => {
    await Preferences.set({
      key,
      value: JSON.stringify(value)
    });
  },
  get: async (key: string) => {
    const { value } = await Preferences.get({ key });
    return value ? JSON.parse(value) : null;
  },
  remove: async (key: string) => {
    await Preferences.remove({ key });
  }
};
