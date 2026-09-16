import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import bgImage from '../assets/T473.jpg';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Username dan Password wajib diisi.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login gagal. Periksa kembali username & password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 text-white selection:bg-red-500 selection:text-white">
      {/* Left Side with Custom T473 Background */}
      <div 
        className="relative md:w-1/2 min-h-[350px] md:min-h-screen bg-cover bg-center bg-no-repeat p-8 sm:p-12 flex flex-col justify-between overflow-hidden border-b md:border-b-0 md:border-r border-slate-800/80"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        {/* Subtle Dark Gradient Overlay for Cinematic & Elegant Look */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-slate-950/60 pointer-events-none" />

        {/* Minimalist Top Branding */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-toyota-red to-red-700 flex items-center justify-center font-black text-xl text-white shadow-toyota border border-white/20">
            W
          </div>
          <div>
            <h2 className="font-extrabold text-base text-white tracking-wider flex items-center gap-2 drop-shadow-md">
              WIRA TOYOTA <span className="text-[10px] bg-red-600 px-2 py-0.5 rounded text-white font-bold tracking-widest">BANJARMASIN</span>
            </h2>
            <p className="text-[11px] text-slate-300 font-medium tracking-wide drop-shadow-sm">Remind Tracking Job System</p>
          </div>
        </div>

        {/* Bottom Minimalist Footer */}
        <div className="relative z-10 text-xs text-slate-300/90 border-t border-white/10 pt-4 flex items-center justify-between backdrop-blur-xs">
          <span className="font-medium drop-shadow-sm">PT. Wira Megah Profitamas</span>
          <span className="font-semibold tracking-wider text-slate-200 drop-shadow-sm">Toyota Let's Go Beyond</span>
        </div>
      </div>

      {/* Right Login Form Side */}
      <div className="md:w-1/2 flex items-center justify-center p-8 sm:p-16 bg-slate-950">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Selamat Datang
            </h2>
            <p className="mt-1.5 text-sm text-slate-400">
              Silakan login ke akun Anda untuk melanjutkan
            </p>
          </div>

          {error && (
            <div className="p-4 bg-rose-950/60 border border-rose-800/80 rounded-2xl flex items-center space-x-3 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-900/90 border border-slate-800 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-900/90 border border-slate-800 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-toyota-red to-red-600 hover:from-red-600 hover:to-red-700 shadow-toyota transition-all duration-200 disabled:opacity-50 active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Sistem</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-500">
              Wira Toyota Banjarmasin • Aftersales & RTJ Monitoring
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
