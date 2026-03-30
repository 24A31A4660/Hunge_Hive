'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { signOut as nextAuthSignOut } from 'next-auth/react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('hungerhive_token');
    const savedUser = localStorage.getItem('hungerhive_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback((tokenValue, userData) => {
    localStorage.setItem('hungerhive_token', tokenValue);
    localStorage.setItem('hungerhive_user', JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    // 1. First clear NextAuth session completely without taking over navigation
    await nextAuthSignOut({ redirect: false });
    
    // 2. Wipe local storage
    localStorage.removeItem('hungerhive_token');
    localStorage.removeItem('hungerhive_user');
    
    // 3. Clear component state. Our protected routes (like Dashboard) will
    // detect this state change and cleanly handle the single redirect to /login
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((userData) => {
    localStorage.setItem('hungerhive_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const authFetch = useCallback(async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      setToken(null);
      setUser(null);
      localStorage.removeItem('hungerhive_token');
      localStorage.removeItem('hungerhive_user');
    }
    return res;
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
