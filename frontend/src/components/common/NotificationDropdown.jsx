import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Car, 
  Wrench, 
  FileSpreadsheet, 
  RefreshCw, 
  Trash2, 
  Sparkles,
  Inbox,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

// Helper for relative time in Indonesian
function formatRelativeTime(dateString) {
  if (!dateString) return 'Baru saja';
  const diffSec = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (diffSec < 60) return 'Baru saja';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return 'Kemarin';
  if (diffDay < 7) return `${diffDay} hari lalu`;
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(new Date(dateString));
}

export default function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'create':
        return <Car className="w-4 h-4 text-emerald-600" />;
      case 'recovery':
        return <Wrench className="w-4 h-4 text-purple-600" />;
      case 'import':
        return <FileSpreadsheet className="w-4 h-4 text-amber-600" />;
      case 'delete':
        return <Trash2 className="w-4 h-4 text-rose-600" />;
      case 'update':
      default:
        return <RefreshCw className="w-4 h-4 text-blue-600" />;
    }
  };

  const getBgColor = (type, isRead) => {
    if (isRead) return 'bg-slate-50/50 hover:bg-slate-100/70';
    switch (type) {
      case 'create':
        return 'bg-emerald-50/40 hover:bg-emerald-50/70 border-l-4 border-l-emerald-500';
      case 'recovery':
        return 'bg-purple-50/40 hover:bg-purple-50/70 border-l-4 border-l-purple-500';
      case 'import':
        return 'bg-amber-50/40 hover:bg-amber-50/70 border-l-4 border-l-amber-500';
      case 'delete':
        return 'bg-rose-50/40 hover:bg-rose-50/70 border-l-4 border-l-rose-500';
      case 'update':
      default:
        return 'bg-blue-50/40 hover:bg-blue-50/70 border-l-4 border-l-blue-500';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-100"
        aria-label="Lihat Notifikasi"
        title="Notifikasi Real-time"
      >
        <Bell className="w-5 h-5" />

        {unreadCount > 0 && (
          <>
            {/* Animated Ping Ring */}
            <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
            </span>

            {/* Badge Counter */}
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-black text-white bg-toyota-red rounded-full shadow-md border-2 border-white ring-1 ring-red-100">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-white/10 rounded-lg">
                <Bell className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <h3 className="text-xs font-black tracking-wide uppercase">Notifikasi Real-Time</h3>
                <p className="text-[10px] text-slate-300 font-medium">Update data & aktivitas bengkel</p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition-all active:scale-95"
                title="Tandai semua sudah dibaca"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Baca Semua</span>
              </button>
            )}
          </div>

          {/* Filter Bar */}
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex space-x-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                  filter === 'all'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Semua ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                  filter === 'unread'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Belum Dibaca ({unreadCount})
              </button>
            </div>

            <div className="flex items-center space-x-1 text-[10px] text-emerald-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-time Sync</span>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100/80">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 px-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-xs font-black text-slate-800">
                  {filter === 'unread' ? 'Semua Notifikasi Sudah Dibaca' : 'Belum Ada Notifikasi Baru'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  {filter === 'unread'
                    ? 'Tidak ada pembaruan data baru yang terlewat.'
                    : 'Notifikasi akan muncul secara real-time saat ada input RTJ baru, import data, atau update follow-up.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`p-3.5 transition-colors cursor-pointer ${getBgColor(
                    notif.type,
                    notif.is_read
                  )}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-xl bg-white shadow-xs border border-slate-100 shrink-0 mt-0.5">
                      {getIcon(notif.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className={`text-xs font-bold truncate ${notif.is_read ? 'text-slate-700' : 'text-slate-900'}`}>
                          {notif.title}
                        </p>
                        {!notif.is_read && (
                          <span className="w-2 h-2 rounded-full bg-toyota-red shrink-0 ml-1.5" />
                        )}
                      </div>

                      <p className={`text-xs leading-relaxed ${notif.is_read ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>
                        {notif.message}
                      </p>

                      {/* Details tags */}
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px]">
                        {notif.details?.no_polisi && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-mono font-bold">
                            {notif.details.no_polisi}
                          </span>
                        )}
                        {notif.details?.kategori_q && (
                          <span className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-bold">
                            {notif.details.kategori_q}
                          </span>
                        )}
                        {notif.details?.status_rtj && (
                          <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">
                            {notif.details.status_rtj}
                          </span>
                        )}
                        <span className="text-slate-400 font-medium ml-auto flex items-center space-x-1">
                          <Clock className="w-3 h-3 inline" />
                          <span>{formatRelativeTime(notif.created_at)}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 font-medium">
              Notifikasi diperbarui otomatis setiap kali ada input atau update data real
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
