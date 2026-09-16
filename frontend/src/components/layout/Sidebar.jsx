import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TableProperties, 
  PlusCircle, 
  BarChart3, 
  Users, 
  LogOut, 
  Car, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout, isAdmin } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/data-rtj', label: 'Data RTJ', icon: TableProperties },
    { to: '/input-rtj', label: 'Input RTJ', icon: PlusCircle },
    { to: '/statistik', label: 'Statistik RTJ', icon: BarChart3 },
    ...(isAdmin ? [{ to: '/user', label: 'Kelola User', icon: Users }] : []),
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-950 text-slate-200 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 border-r border-slate-800/80 shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800/80 bg-slate-950">
          <div className="flex items-center space-x-3">
            {/* Toyota Badge Logo */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-toyota-red to-red-700 flex items-center justify-center shadow-toyota text-white font-black text-xl tracking-tighter">
              W
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base tracking-wide text-white">RTJ WEB</span>
                <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-sm uppercase tracking-wider">
                  Toyota
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-tight">
                Wira Toyota Banjarmasin
              </p>
            </div>
          </div>
        </div>

        {/* User Card in Sidebar */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-slate-900/90 border border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 flex items-center justify-center font-bold text-sm">
              {user?.username ? user.username.substring(0, 2).toUpperCase() : 'TO'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {user?.nama || user?.username}
              </p>
              <div className="flex items-center space-x-1 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-red-400" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-red-400">
                  {user?.role === 'Admin' ? 'Administrator' : user?.role === 'SA' ? 'Service Advisor' : 'Front Officer'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Menu Utama
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-toyota-red text-white shadow-toyota font-bold'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 border border-rose-900/30 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar (Logout)</span>
          </button>
          
          <div className="mt-3 text-center">
            <p className="text-[10px] text-slate-500 font-medium">
              RTJ Monitoring System v1.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
