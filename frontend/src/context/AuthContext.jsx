import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('rtj_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem('rtj_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data.user);
            localStorage.setItem('rtj_user', JSON.stringify(res.data.data.user));
          }
        } catch (err) {
          console.error('Session verify error:', err);
          setUser(null);
          localStorage.removeItem('rtj_token');
          localStorage.removeItem('rtj_user');
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    if (res.data.success) {
      const { user: userData, token } = res.data.data;
      localStorage.setItem('rtj_token', token);
      localStorage.setItem('rtj_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    }
    throw new Error(res.data.message || 'Login gagal');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('rtj_token');
      localStorage.removeItem('rtj_user');
      setUser(null);
      window.location.href = '/login';
    }
  };

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
