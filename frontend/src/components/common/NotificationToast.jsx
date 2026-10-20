import React, { useEffect } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Car, 
  FileSpreadsheet, 
  Trash2, 
  RefreshCw, 
  Wrench, 
  X,
  Sparkles
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 6000); // 6 detik auto dismiss
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'create':
        return <Car className="w-5 h-5 text-emerald-600" />;
      case 'recovery':
        return <Wrench className="w-5 h-5 text-purple-600" />;
      case 'import':
        return <FileSpreadsheet className="w-5 h-5 text-amber-600" />;
      case 'delete':
        return <Trash2 className="w-5 h-5 text-rose-600" />;
      case 'update':
      default:
        return <RefreshCw className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'create':
        return 'border-emerald-500/30 bg-emerald-50/95';
      case 'recovery':
        return 'border-purple-500/30 bg-purple-50/95';
      case 'import':
        return 'border-amber-500/30 bg-amber-50/95';
      case 'delete':
        return 'border-rose-500/30 bg-rose-50/95';
      case 'update':
      default:
        return 'border-blue-500/30 bg-blue-50/95';
    }
  };

  return (
    <div
      className={`relative w-80 sm:w-96 rounded-2xl p-4 shadow-2xl backdrop-blur-md border ${getBorderColor()} transition-all duration-300 animate-in slide-in-from-right fade-in overflow-hidden`}
      style={{
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="flex items-start space-x-3">
        <div className="p-2 rounded-xl bg-white shadow-sm shrink-0 border border-slate-100">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center space-x-1.5 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-toyota-red animate-ping" />
            <p className="text-xs font-black text-slate-900 tracking-tight">
              {toast.title}
            </p>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            {toast.message}
          </p>
          {toast.details?.no_polisi && (
            <div className="mt-2 flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-mono text-[10px] font-bold">
                {toast.details.no_polisi}
              </span>
              {toast.details.kategori_q && (
                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-bold text-[10px]">
                  {toast.details.kategori_q}
                </span>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => onDismiss(toast.id)}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-black/5 transition-colors shrink-0"
          aria-label="Tutup notifikasi"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Subtle Auto-dismiss progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 overflow-hidden">
        <div
          className="h-full bg-slate-900/40"
          style={{
            animation: 'shrinkProgress 6s linear forwards',
            transformOrigin: 'left'
          }}
        />
      </div>

      <style>{`
        @keyframes shrinkProgress {
          0% { width: 100%; }
          100% { width: 0%; }
        }
      `}</style>
    </div>
  );
}

export default function NotificationToast() {
  const { toasts, dismissToast } = useNotifications();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 flex flex-col space-y-3 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onDismiss={dismissToast} />
        </div>
      ))}
    </div>
  );
}
