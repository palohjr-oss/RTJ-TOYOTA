import React from 'react';
import { Menu, Calendar, ShieldCheck, UserCircle2, Bell, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ onMenuToggle }) {
  const { user } = useAuth();

  // Indonesian date formatter
  const today = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="flex items-center justify-between h-20 px-4 sm:px-8">
        {/* Left Side: Mobile Menu Button & Brand Badge */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 md:hidden focus:outline-none focus:ring-2 focus:ring-slate-200"
            aria-label="Buka Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="hidden sm:flex items-center space-x-2 text-slate-700">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100/80 border border-slate-200/60 text-xs font-semibold text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-toyota-red" />
              <span>{today}</span>
            </div>
            <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-red-50 border border-red-100 text-xs font-bold text-toyota-red">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Wira Toyota Banjarmasin</span>
            </div>
          </div>
        </div>

        {/* Right Side: Profile & Role Badge */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-3 pl-3 py-1 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-extrabold text-slate-900 leading-tight">
                {user?.nama || user?.username || 'User'}
              </p>
              <div className="flex items-center justify-end space-x-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[11px] font-medium text-slate-500">
                  {user?.role === 'Admin' ? 'Admin' : user?.role === 'SA' ? 'Service Advisor' : 'Front Officer'} (Online)
                </span>
              </div>
            </div>

            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-900 to-slate-800 text-white flex items-center justify-center font-bold text-sm shadow-md border-2 border-white ring-2 ring-slate-100">
              {user?.username ? user.username.substring(0, 2).toUpperCase() : 'W'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
