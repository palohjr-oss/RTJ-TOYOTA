import React from 'react';
import { CheckCircle2, Clock, AlertCircle, RefreshCw } from 'lucide-react';

const statusConfig = {
  Completed: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
    label: 'Completed'
  },
  Scheduled: {
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
    icon: Clock,
    label: 'Scheduled'
  },
  Pending: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    icon: AlertCircle,
    label: 'Pending'
  },
  Rescheduled: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
    icon: RefreshCw,
    label: 'Rescheduled'
  }
};

export default function StatusBadge({ status, size = 'sm', showIcon = true }) {
  const config = statusConfig[status] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
    icon: Clock,
    label: status || 'Unknown'
  };

  const IconComponent = config.icon;

  const sizeClasses = size === 'lg' 
    ? 'px-3.5 py-1.5 text-sm font-semibold gap-2' 
    : 'px-2.5 py-1 text-xs font-medium gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm transition-all duration-150 ${config.bg} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
      {showIcon && <IconComponent className={size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />}
      <span>{config.label}</span>
    </span>
  );
}
