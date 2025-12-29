import { useState, useEffect, useCallback } from 'react';
import { initializeFirebase, requestNotificationPermission, onForegroundMessage } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';

type NotificationPermission = 'default' | 'granted' | 'denied';

interface UsePushNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission;
  token: string | null;
  isLoading: boolean;
  requestPermission: () => Promise<void>;
}

export const usePushNotifications = (): UsePushNotificationsReturn => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if notifications are supported
  useEffect(() => {
    const supported = typeof window !== 'undefined' && 
      'Notification' in window && 
      'serviceWorker' in navigator;
    
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission as NotificationPermission);
    }
  }, []);

  // Initialize Firebase on mount
  useEffect(() => {
    if (isSupported) {
      initializeFirebase().catch(console.error);
    }
  }, [isSupported]);

  // Set up foreground message handler
  useEffect(() => {
    if (!isSupported || permission !== 'granted') return;

    const unsubscribe = onForegroundMessage((payload) => {
      console.log('Foreground notification:', payload);
      
      // Show toast for foreground notifications
      toast({
        title: payload.notification?.title || 'Notification',
        description: payload.notification?.body || '',
      });
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [isSupported, permission]);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      toast({
        title: 'Non supporté',
        description: 'Les notifications push ne sont pas supportées sur ce navigateur.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const fcmToken = await requestNotificationPermission();
      
      if (fcmToken) {
        setToken(fcmToken);
        setPermission('granted');
        
        // Store token in localStorage for later use
        localStorage.setItem('fcm_token', fcmToken);
        
        toast({
          title: 'Notifications activées',
          description: 'Vous recevrez des notifications pour vos réservations.',
        });
        
        console.log('FCM Token stored:', fcmToken);
      } else {
        setPermission(Notification.permission as NotificationPermission);
        
        if (Notification.permission === 'denied') {
          toast({
            title: 'Notifications bloquées',
            description: 'Veuillez autoriser les notifications dans les paramètres de votre navigateur.',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'activer les notifications.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  return {
    isSupported,
    permission,
    token,
    isLoading,
    requestPermission,
  };
};

export default usePushNotifications;
