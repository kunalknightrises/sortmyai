import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { initializePushNotifications, setupMessageHandler, showNotification } from '@/services/notificationService';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const PushNotificationInitializer = () => {
  const { user } = useAuth();
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Only initialize once and when user is logged in
    if (initialized || !user) return;

    const initialize = async () => {
      try {
        // Initialize push notifications
        const success = await initializePushNotifications(user.uid);

        if (success) {
          console.log('Push notifications initialized successfully');

          // Set up foreground message handler
          setupMessageHandler((payload) => {
            try {
              // Show notification
              const notification = showNotification(
                payload.notification?.title || 'New Message',
                {
                  body: payload.notification?.body || '',
                  data: payload.data
                }
              );

              // Handle notification click
              if (notification) {
                notification.onclick = () => {
                  window.focus();
                  notification.close();

                  // Navigate to messages page if data contains conversationId
                  if (payload.data?.conversationId) {
                    navigate(`/dashboard/messages?conversation=${payload.data.conversationId}`);
                  }
                };
              }
            } catch (err) {
              console.warn('Error handling notification:', err);
            }
          });

          setInitialized(true);
        } else {
          // Don't show error toast, just log it
          console.warn('Push notifications not available or permission denied');
          setInitialized(true); // Mark as initialized anyway
        }
      } catch (error) {
        console.error('Error initializing push notifications:', error);
        setInitialized(true); // Mark as initialized to prevent retries
      }
    };

    initialize();
  }, [user, initialized, navigate]);

  // This component doesn't render anything
  return null;
};

export default PushNotificationInitializer;
