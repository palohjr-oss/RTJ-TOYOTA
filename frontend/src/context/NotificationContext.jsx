import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

const STORAGE_KEY_READ = 'rtj_read_notif_ids_v2';
const STORAGE_KEY_SEEN = 'rtj_seen_toast_ids_v2';

function getLocalReadIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_READ);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveLocalReadId(id) {
  try {
    const set = getLocalReadIds();
    set.add(id);
    localStorage.setItem(STORAGE_KEY_READ, JSON.stringify(Array.from(set).slice(-500)));
  } catch {}
}

function saveLocalAllReadIds(ids) {
  try {
    const set = getLocalReadIds();
    ids.forEach(id => set.add(id));
    localStorage.setItem(STORAGE_KEY_READ, JSON.stringify(Array.from(set).slice(-500)));
  } catch {}
}

function getSeenToastIds() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_SEEN);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveSeenToastId(id) {
  try {
    const set = getSeenToastIds();
    set.add(id);
    sessionStorage.setItem(STORAGE_KEY_SEEN, JSON.stringify(Array.from(set).slice(-200)));
  } catch {}
}

// Audio chime using Web Audio API (safe, no external sound file dependency)
function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    
    // Note 1: E5 (659 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Note 2: B5 (987 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.12);
    gain2.gain.setValueAtTime(0.15, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.6);
  } catch (err) {
    // Silently ignore if audio autoplay is restricted
  }
}

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const knownIdsRef = useRef(new Set());
  const isInitialLoadRef = useRef(true);

  // Fetch notifications from server
  const fetchNotifications = useCallback(async (silent = false) => {
    if (!user) return;
    try {
      const res = await api.get('/notifications?limit=50');
      if (res.data?.success) {
        const rawList = res.data.data || [];
        const readIds = getLocalReadIds();
        const seenToastIds = getSeenToastIds();

        // Merge server list with local read state to guarantee read items never un-read
        const processedList = rawList.map(n => ({
          ...n,
          is_read: Boolean(n.is_read || readIds.has(n.id))
        }));

        const trueUnreadCount = processedList.filter(n => !n.is_read).length;

        // Detect genuinely new notifications (only if not initial page load)
        if (!isInitialLoadRef.current) {
          const newItems = processedList.filter(n => {
            // Must not be known yet, not read, not already seen in toast
            if (knownIdsRef.current.has(n.id) || n.is_read || seenToastIds.has(n.id)) {
              return false;
            }
            // Must be created very recently (within 2 minutes) to prevent old alerts
            const createdAtTime = new Date(n.created_at).getTime();
            const ageMs = Date.now() - createdAtTime;
            return ageMs < 120000; // 2 minutes
          });

          if (newItems.length > 0) {
            playNotificationChime();

            // Mark these new items as seen so they never toast again
            newItems.forEach(item => saveSeenToastId(item.id));

            // Show max 3 toasts
            newItems.slice(0, 3).forEach(item => {
              setToasts(prev => {
                if (prev.some(t => t.id === item.id)) return prev;
                return [item, ...prev].slice(0, 3);
              });
            });
          }
        }

        // Register all current IDs as known
        processedList.forEach(n => {
          knownIdsRef.current.add(n.id);
        });
        isInitialLoadRef.current = false;

        setNotifications(processedList);
        setUnreadCount(trueUnreadCount);
      }
    } catch (err) {
      if (!silent) {
        console.warn('[Notifications] Gagal sinkronisasi notifikasi:', err.message);
      }
    }
  }, [user]);

  // Initial fetch and periodic polling (every 8 seconds)
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setToasts([]);
      knownIdsRef.current.clear();
      isInitialLoadRef.current = true;
      return;
    }

    fetchNotifications(true);

    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 8000); // 8s poll

    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  // Mark single notification as read
  const markAsRead = async (id) => {
    saveLocalReadId(id);
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await api.post('/notifications/read', { id });
    } catch (err) {
      // Handled silently
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    saveLocalAllReadIds(notifications.map(n => n.id));
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);

    try {
      await api.post('/notifications/read', { all: true });
    } catch (err) {
      // Handled silently
    }
  };

  // Dismiss a floating toast
  const dismissToast = (id) => {
    saveSeenToastId(id);
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        dismissToast
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
