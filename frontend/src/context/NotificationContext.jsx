import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

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
        const list = res.data.data || [];
        const unread = res.data.unread_count || 0;

        // Detect new notifications if not initial load
        if (!isInitialLoadRef.current) {
          const newItems = list.filter(n => !knownIdsRef.current.has(n.id) && !n.is_read);
          if (newItems.length > 0) {
            // Play audio chime
            playNotificationChime();

            // Trigger floating toasts (limit max 3 simultaneous toasts)
            newItems.slice(0, 3).forEach(item => {
              setToasts(prev => {
                if (prev.some(t => t.id === item.id)) return prev;
                return [item, ...prev].slice(0, 4);
              });
            });
          }
        }

        // Update known IDs
        list.forEach(n => knownIdsRef.current.add(n.id));
        isInitialLoadRef.current = false;

        setNotifications(list);
        setUnreadCount(unread);
      }
    } catch (err) {
      if (!silent) {
        console.warn('[Notifications] Gagal mengambil notifikasi:', err.message);
      }
    }
  }, [user]);

  // Initial fetch and periodic polling (every 10 seconds)
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
    }, 10000); // 10s poll

    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  // Mark single notification as read
  const markAsRead = async (id) => {
    try {
      // Optimistic update
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      await api.post('/notifications/read', { id });
    } catch (err) {
      console.warn('Gagal menandai notifikasi dibaca:', err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      await api.post('/notifications/read', { all: true });
    } catch (err) {
      console.warn('Gagal menandai semua notifikasi dibaca:', err);
    }
  };

  // Dismiss a floating toast
  const dismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Manually trigger a toast notification (e.g. from local actions)
  const triggerNotification = (notif) => {
    const item = {
      id: notif.id || `local-${Date.now()}`,
      title: notif.title || 'Pemberitahuan Sistem',
      message: notif.message || '',
      type: notif.type || 'info',
      created_at: new Date().toISOString(),
      ...notif
    };
    playNotificationChime();
    setToasts(prev => [item, ...prev].slice(0, 4));
    // Refetch latest from server
    setTimeout(() => fetchNotifications(true), 1200);
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
        dismissToast,
        triggerNotification
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
