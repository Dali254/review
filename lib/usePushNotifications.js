import { useState, useEffect, useCallback } from 'react';

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

// Converts the VAPID public key (base64url string) into the Uint8Array
// format the Push API requires. Standard boilerplate for Web Push.
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Manages the full push-notification lifecycle: registering the service
// worker, checking/requesting Notification permission, subscribing via
// the Push API, and telling our server about the subscription so it can
// send notifications later — including when the app is fully closed.
//
// `phone` ties the subscription to a specific signed-in user so
// /api/push/send can target them by phone number.
export function usePushNotifications(phone) {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState('default'); // 'default' | 'granted' | 'denied'
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const isSupported =
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window &&
      !!PUBLIC_KEY;
    setSupported(isSupported);

    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }

    // Detect if the app is already running as an installed PWA (not a
    // regular browser tab) — affects what UI we show for the install CTA.
    if (typeof window !== 'undefined') {
      const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
      setIsInstalled(standalone);
    }

    if (!isSupported) return;

    navigator.serviceWorker.register('/sw.js').then((registration) => {
      registration.pushManager.getSubscription().then((sub) => {
        setSubscribed(!!sub);
      });
    }).catch(() => {});

    // Capture the browser's native "install this app" prompt so we can
    // trigger it from our own styled button instead of waiting for the
    // browser's default mini-infobar.
    function handleBeforeInstallPrompt(e) {
      e.preventDefault();
      setInstallPromptEvent(e);
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const subscribe = useCallback(async () => {
    if (!supported || !phone) return false;
    setLoading(true);
    try {
      const permResult = await Notification.requestPermission();
      setPermission(permResult);
      if (permResult !== 'granted') {
        setLoading(false);
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY),
        });
      }

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription, phone }),
      });

      setSubscribed(true);
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Push subscribe failed:', err);
      setLoading(false);
      return false;
    }
  }, [supported, phone]);

  const unsubscribe = useCallback(async () => {
    if (!supported) return;
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }
      if (phone) {
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone }),
        });
      }
      setSubscribed(false);
    } catch (err) {
      console.error('Push unsubscribe failed:', err);
    }
    setLoading(false);
  }, [supported, phone]);

  // Triggers the captured native install prompt. Only works once, and
  // only if the browser actually fired beforeinstallprompt (Chrome/Edge
  // on Android & desktop; Safari/iOS never fires this — those users
  // install via the Share sheet, which we explain in the UI instead).
  const promptInstall = useCallback(async () => {
    if (!installPromptEvent) return false;
    installPromptEvent.prompt();
    const choice = await installPromptEvent.userChoice;
    setInstallPromptEvent(null);
    return choice.outcome === 'accepted';
  }, [installPromptEvent]);

  return {
    supported,
    permission,
    subscribed,
    loading,
    isInstalled,
    canPromptInstall: !!installPromptEvent,
    subscribe,
    unsubscribe,
    promptInstall,
  };
}
