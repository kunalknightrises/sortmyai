import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Check if the browser supports notifications
export const checkNotificationSupport = () => {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Register the service worker for push notifications
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  try {
    // Use the loader script instead of directly registering the service worker
    // This will handle passing the Firebase config to the service worker
    const script = document.createElement('script');
    script.src = '/firebase-messaging-sw-loader.js';
    script.type = 'module';
    document.head.appendChild(script);

    // Wait for the service worker to be registered by the loader
    return await new Promise<ServiceWorkerRegistration>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Service worker registration timed out'));
      }, 5000);

      const checkRegistration = async () => {
        const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
        if (registration) {
          clearTimeout(timeout);
          resolve(registration);
        } else {
          setTimeout(checkRegistration, 100);
        }
      };

      checkRegistration();
    });
  } catch (error) {
    console.error('Service worker registration failed:', error);
    return null;
  }
};

// Get FCM token and save it to the user's document
export const getFCMToken = async (userId: string): Promise<string | null> => {
  try {
    const messaging = getMessaging();

    // Check if permission is granted
    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return null;
    }

    // Get token
    const currentToken = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
    });

    if (currentToken) {
      // Save the token to the user's document
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        await setDoc(userRef, {
          ...userDoc.data(),
          fcmTokens: [...(userDoc.data().fcmTokens || []), currentToken]
        }, { merge: true });
      }

      return currentToken;
    } else {
      console.warn('No registration token available');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

// Set up foreground message handler
export const setupMessageHandler = (callback: (payload: any) => void) => {
  try {
    const messaging = getMessaging();

    return onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      callback(payload);
    });
  } catch (error) {
    console.error('Error setting up message handler:', error);
    return () => {};
  }
};

// Show a notification
export const showNotification = (title: string, options: NotificationOptions = {}) => {
  try {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return null;
    }

    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/logo.png',
        badge: '/logo.png',
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();

        // Handle click action if provided
        if (options.data?.url) {
          window.location.href = options.data.url;
        }
      };

      return notification;
    }
    return null;
  } catch (error) {
    console.warn('Error showing notification:', error);
    return null;
  }
};

// Initialize push notifications
export const initializePushNotifications = async (userId: string) => {
  if (!checkNotificationSupport()) {
    console.warn('Push notifications are not supported in this browser');
    return false;
  }

  const permissionGranted = await requestNotificationPermission();
  if (!permissionGranted) {
    console.warn('Notification permission denied');
    return false;
  }

  const serviceWorkerRegistration = await registerServiceWorker();
  if (!serviceWorkerRegistration) {
    console.warn('Service worker registration failed');
    return false;
  }

  const token = await getFCMToken(userId);
  return !!token;
};
