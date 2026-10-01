import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

// Helper to safely parse user from localStorage
const getSavedUser = () => {
  try {
    const saved = localStorage.getItem('rtj_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  // Instantly load user from localStorage - NO waiting for API
  const [user, setUser] = useState(getSavedUser);
  // loading=false immediately if we have cached user data, so UI is instant
  const [loading, setLoading] = useState(false);

  // Background verify: silently refresh user data without blocking UI
  useEffect(() => {
    const token = localStorage.getItem('rtj_token');
    if (!token) return;

    // Non-blocking background verification
    const verifyInBackground = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data.success && res.data.data?.user) {
          const freshUser = res.data.data.user;
          setUser(freshUser);
          localStorage.setItem('rtj_user', JSON.stringify(freshUser));
        }
      } catch (err) {
        // Only clear session if explicitly unauthorized (401)
        if (err.response?.status === 401) {
          setUser(null);
          localStorage.removeItem('rtj_token');
          localStorage.removeItem('rtj_user');
        }
        // Other errors (network issues, 5xx) - keep existing session
      }
    };

    // Delay slightly so the UI renders first
    const timer = setTimeout(verifyInBackground, 200);
    return () => clearTimeout(timer);
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    if (res.data.success) {
      const { user: userData, token } = res.data.data;
      localStorage.setItem('rtj_token', token);
      localStorage.setItem('rtj_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    }
    throw new Error(res.data.message || 'Login gagal');
  }, []);

  const logout = useCallback(() => {
    // Instant logout - no API call wait
    localStorage.removeItem('rtj_token');
    localStorage.removeItem('rtj_user');
    setUser(null);
    // Fire and forget logout API (don't await)
    api.post('/auth/logout').catch(() => {});
    window.location.href = '/login';
  }, []);

  const isAdmin = user?.role === 'Admin';
  const isSA = user?.role === 'SA';
  const isFO = user?.role === 'FO';

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin, isSA, isFO }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
