// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

// Store Firebase config
let firebaseConfig = null;

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    firebaseConfig = event.data.config;
    console.log('Received Firebase config in service worker');
    initializeFirebase();
  }
});

// Initialize Firebase with the received config
function initializeFirebase() {
  try {
    // Check if Firebase config is available
    if (!firebaseConfig || !firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.warn('Firebase configuration not available in service worker');
      return;
    }

    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized in service worker');

    // Initialize messaging after Firebase is set up
    initializeMessaging();
  } catch (error) {
    console.error('Failed to initialize Firebase in service worker:', error);
  }
}

// Function to initialize messaging
function initializeMessaging() {
  try {
    // Retrieve an instance of Firebase Messaging so that it can handle background
    // messages.
    const messaging = firebase.messaging();

    // Handle background messages
    messaging.onBackgroundMessage((payload) => {
      try {
        console.log('[firebase-messaging-sw.js] Received background message ', payload);

        // Customize notification here
        const notificationTitle = payload.notification?.title || 'New Message';
        const notificationOptions = {
          body: payload.notification?.body || '',
          icon: '/logo.png',
          badge: '/logo.png',
          data: payload.data || {}
        };

        self.registration.showNotification(notificationTitle, notificationOptions);
      } catch (error) {
        console.error('Error processing background message:', error);
      }
    });
  } catch (error) {
    console.warn('Firebase messaging not initialized:', error);
  }
}

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  try {
    console.log('[firebase-messaging-sw.js] Notification click: ', event);

    event.notification.close();

    // This looks to see if the current is already open and focuses if it is
    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      })
      .then((clientList) => {
        // If we have a custom URL in the notification data, use it
        const url = event.notification.data?.url || '/dashboard/messages';

        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
      .catch(error => {
        console.error('Error handling notification click:', error);
      })
    );
  } catch (error) {
    console.error('Error in notification click handler:', error);
  }
});
