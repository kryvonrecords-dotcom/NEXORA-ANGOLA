import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppNotification } from '../types';
import { api } from '../services/api';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  permission: NotificationPermission | 'unsupported';
  isPushSubscribed: boolean;
  activeToast: AppNotification | null;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  requestPermission: () => Promise<boolean>;
  testBackgroundPush: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  dismissToast: () => void;
  refreshNotifications: () => Promise<void>;
  triggerTestNotification: (custom?: Partial<AppNotification>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const READ_STORAGE_KEY = 'nexora_read_notifications';
const CLEARED_STORAGE_KEY = 'nexora_cleared_notifications';
const SOUND_STORAGE_KEY = 'nexora_notif_sound_enabled';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Elegant Web Audio API Synthesizer Chime
function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    const now = ctx.currentTime;
    
    // Tone 1 (Higher ping)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.12);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);

    // Tone 2 (Harmonic support)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1760, now + 0.08);
    gain2.gain.setValueAtTime(0.15, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.6);
  } catch (err) {
    // Audio context may be restricted before user gesture
  }
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(READ_STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [clearedIds, setClearedIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(CLEARED_STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(SOUND_STORAGE_KEY);
      return stored !== null ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });

  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  const [isPushSubscribed, setIsPushSubscribed] = useState<boolean>(false);
  const lastCheckedTimeRef = useRef<string>(new Date().toISOString());
  const seenToastIdsRef = useRef<Set<string>>(new Set());
  const toastTimeoutRef = useRef<any>(null);

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    localStorage.setItem(SOUND_STORAGE_KEY, JSON.stringify(enabled));
  };

  // Check initial PushManager subscription status
  useEffect(() => {
    async function checkSubscription() {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const reg = await navigator.serviceWorker.ready;
          const sub = await reg.pushManager.getSubscription();
          if (sub) {
            setIsPushSubscribed(true);
            // Ensure server has latest key
            const json = sub.toJSON();
            await api.subscribeToPush({
              endpoint: sub.endpoint,
              keys: json.keys
            });
          }
        } catch (e) {
          console.log('Push check status:', e);
        }
      }
    }
    checkSubscription();
  }, []);

  // Mark ID as read
  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => {
      const updated = new Set(prev);
      updated.add(id);
      try {
        localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(Array.from(updated)));
      } catch (e) {}
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setReadIds((prev) => {
      const updated = new Set(prev);
      notifications.forEach((n) => updated.add(n.id));
      try {
        localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(Array.from(updated)));
      } catch (e) {}
      return updated;
    });
  }, [notifications]);

  // Clear single notification persistently
  const clearNotification = useCallback((id: string) => {
    setClearedIds((prev) => {
      const updated = new Set(prev);
      updated.add(id);
      try {
        localStorage.setItem(CLEARED_STORAGE_KEY, JSON.stringify(Array.from(updated)));
      } catch (e) {}
      return updated;
    });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Clear all notifications persistently
  const clearAllNotifications = useCallback(() => {
    setClearedIds((prev) => {
      const updated = new Set(prev);
      notifications.forEach((n) => updated.add(n.id));
      try {
        localStorage.setItem(CLEARED_STORAGE_KEY, JSON.stringify(Array.from(updated)));
      } catch (e) {}
      return updated;
    });
    setNotifications([]);
  }, [notifications]);

  const dismissToast = useCallback(() => {
    setActiveToast(null);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
  }, []);

  const showToast = useCallback((notif: AppNotification) => {
    setActiveToast(notif);
    if (soundEnabled) {
      playNotificationChime();
    }
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    // Auto hide after 8 seconds
    toastTimeoutRef.current = setTimeout(() => {
      setActiveToast(null);
    }, 8000);
  }, [soundEnabled]);

  // Request browser Web Push notification permission & register Native Push
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      setPermission('unsupported');
      return false;
    }

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm === 'granted') {
        // Register Native Push Subscription with Service Worker
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          try {
            const reg = await navigator.serviceWorker.ready;
            const { publicKey } = await api.getVapidPublicKey();
            const convertedKey = urlBase64ToUint8Array(publicKey);

            let sub = await reg.pushManager.getSubscription();
            if (!sub) {
              sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedKey
              });
            }

            const jsonSub = sub.toJSON();
            await api.subscribeToPush({
              endpoint: sub.endpoint,
              keys: jsonSub.keys
            });

            setIsPushSubscribed(true);
          } catch (pushErr) {
            console.warn('Native push subscription setup note:', pushErr);
          }
        }
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Error requesting notification permission:', err);
      return false;
    }
  }, []);

  // Public Test Background Push (Dispatches real OS notification)
  const testBackgroundPush = useCallback(async () => {
    try {
      await api.testMyDevicePush();
    } catch (e) {
      console.error('Test push error:', e);
    }
  }, []);

  // Fetch initial notifications
  const refreshNotifications = useCallback(async () => {
    try {
      const data = await api.getNotifications(30);
      if (Array.isArray(data)) {
        // Filter out any locally cleared notifications
        const activeList = data.filter((n) => !clearedIds.has(n.id));
        setNotifications(activeList);
        // Mark existing notifications as already seen so they never trigger audio/toast
        data.forEach((n) => seenToastIdsRef.current.add(n.id));
        if (data.length > 0 && data[0].sentAt) {
          lastCheckedTimeRef.current = data[0].sentAt;
        }
      }
    } catch (e) {
      console.error('Error fetching notifications:', e);
    }
  }, [clearedIds]);

  // Initial load
  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  // Real-time synchronization while app is in foreground (Only triggers when admin publishes a new story)
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        if (!lastCheckedTimeRef.current) return;
        const newItems = await api.getLatestNotifications(lastCheckedTimeRef.current);
        if (Array.isArray(newItems) && newItems.length > 0) {
          // Filter only items that have not been seen and not locally cleared
          const unseenFresh = newItems.filter(
            (i) => !seenToastIdsRef.current.has(i.id) && !clearedIds.has(i.id)
          );

          if (unseenFresh.length > 0) {
            unseenFresh.forEach((item) => seenToastIdsRef.current.add(item.id));
            lastCheckedTimeRef.current = new Date().toISOString();

            setNotifications((prev) => {
              const existingIds = new Set(prev.map((i) => i.id));
              const fresh = unseenFresh.filter((i) => !existingIds.has(i.id));
              return [...fresh, ...prev].slice(0, 50);
            });

            // Show in-app banner toast only for the newly published news
            const latestAlert = unseenFresh[0];
            showToast(latestAlert);
          }
        }
      } catch (e) {
        // network silent retry
      }
    }, 25000);

    return () => clearInterval(pollInterval);
  }, [showToast, clearedIds]);

  // Test trigger
  const triggerTestNotification = useCallback((custom?: Partial<AppNotification>) => {
    const testNotif: AppNotification = {
      id: `test-${Date.now()}`,
      title: custom?.title || '🔴 URGENTE: Notificação em Segundo Plano Ativa',
      body: custom?.body || 'Uma nova notícia urgente acabou de ser publicada no Nexora Angola. Toque para ler em primeira mão.',
      isBreaking: custom?.isBreaking ?? true,
      categoryName: custom?.categoryName || 'Última Hora',
      type: 'breaking_news',
      imageUrl: custom?.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80',
      sentAt: new Date().toISOString(),
      clickUrl: '/'
    };

    setNotifications((prev) => [testNotif, ...prev]);
    showToast(testNotif);
  }, [showToast]);

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications: notifications.map((n) => ({
          ...n,
          read: readIds.has(n.id),
        })),
        unreadCount,
        permission,
        isPushSubscribed,
        activeToast,
        soundEnabled,
        setSoundEnabled,
        requestPermission,
        testBackgroundPush,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAllNotifications,
        dismissToast,
        refreshNotifications,
        triggerTestNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
