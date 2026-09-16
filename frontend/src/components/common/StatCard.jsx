import React from 'react';

export default function StatCard({ title, value, percentage, subtext, icon: Icon, color = 'blue' }) {
  const colorStyles = {
    blue: {
      bg: 'bg-white',
      border: 'border-blue-100 hover:border-blue-300',
      iconBg: 'bg-blue-50 text-blue-600',
      badge: 'bg-blue-100 text-blue-700',
      bar: 'bg-blue-500'
    },
    green: {
      bg: 'bg-white',
      border: 'border-emerald-100 hover:border-emerald-300',
      iconBg: 'bg-emerald-50 text-emerald-600',
      badge: 'bg-emerald-100 text-emerald-700',
      bar: 'bg-emerald-500'
    },
    orange: {
      bg: 'bg-white',
      border: 'border-amber-100 hover:border-amber-300',
      iconBg: 'bg-amber-50 text-amber-600',
      badge: 'bg-amber-100 text-amber-700',
      bar: 'bg-amber-500'
    },
    red: {
      bg: 'bg-white',
      border: 'border-rose-100 hover:border-rose-300',
      iconBg: 'bg-rose-50 text-rose-600',
      badge: 'bg-rose-100 text-rose-700',
      bar: 'bg-rose-500'
    },
    toyota: {
      bg: 'bg-gradient-to-br from-slate-900 to-slate-950 text-white',
      border: 'border-slate-800 hover:border-red-900/50',
      iconBg: 'bg-red-500/20 text-red-400',
      badge: 'bg-red-500/20 text-red-300 border border-red-500/30',
      bar: 'bg-red-500'
    }
  };

  const style = colorStyles[color] || colorStyles.blue;
  const isDark = color === 'toyota';

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 shadow-card hover:shadow-card-hover ${style.bg} ${style.border}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {title}
          </p>
          <h3 className={`text-3xl font-extrabold mt-2 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-xl shadow-sm ${style.iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-100/10">
        <div className="flex items-center space-x-2">
          {percentage !== undefined && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
              {percentage}%
            </span>
          )}
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {subtext || 'dari total data'}
          </span>
        </div>
      </div>

      {percentage !== undefined && (
        <div className="w-full bg-slate-100/20 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${style.bar}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
