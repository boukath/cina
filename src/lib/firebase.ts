import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyDY6a2Rcd5vb1sFsCtvrrZI7sH8kbfQMYU",
  authDomain: "boitexinfo-817cf.firebaseapp.com",
  projectId: "boitexinfo-817cf",
  storageBucket: "boitexinfo-817cf.firebasestorage.app",
  messagingSenderId: "259382800959",
  appId: "1:259382800959:web:9d8d8de948fc568a237e8a"
};

let app: ReturnType<typeof initializeApp> | null = null;
let messaging: Messaging | null = null;

export const initializeFirebase = async () => {
  try {
    if (!app) {
      app = initializeApp(firebaseConfig);
    }
    
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register the Firebase messaging service worker
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Firebase SW registered:', registration);
      
      // Send config to service worker
      if (registration.active) {
        registration.active.postMessage({
          type: 'FIREBASE_CONFIG',
          config: firebaseConfig
        });
      }
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              newWorker.postMessage({
                type: 'FIREBASE_CONFIG',
                config: firebaseConfig
              });
            }
          });
        }
      });

      messaging = getMessaging(app);
    }
    
    return { app, messaging };
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
  }
};

export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    if (!messaging) {
      await initializeFirebase();
    }
    
    if (!messaging) {
      console.error('Messaging not initialized');
      return null;
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted');
      
      // Get the FCM token
      const token = await getToken(messaging, {
        vapidKey: 'BHuZ6F7nxdVWVf-Ym5VzqvzVHu1YvDY3Y4VhCz6qPH1vFxFWzPf-u6DxKJvPl0YM8VtKS4QpPl5Vf5Qf2Q3p5hI'
      });
      
      console.log('FCM Token:', token);
      return token;
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

export const onForegroundMessage = (callback: (payload: any) => void) => {
  if (!messaging) {
    console.error('Messaging not initialized');
    return () => {};
  }
  
  return onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);
    callback(payload);
  });
};

export { messaging, app };
