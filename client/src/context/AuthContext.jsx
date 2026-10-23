import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('hotelpro_token') || null);
  const [loading, setLoading] = useState(true);

  // Fetch current user details on boot if token exists
  const fetchCurrentUser = useCallback(async () => {
    const savedToken = localStorage.getItem('hotelpro_token');
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        logout();
      }
    } catch (err) {
      console.warn('Authentication session invalid:', err.message);
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.data) {
      const { user: userData, accessToken } = res.data;
      localStorage.setItem('hotelpro_token', accessToken);
      localStorage.setItem('hotelpro_user', JSON.stringify(userData));
      setToken(accessToken);
      setUser(userData);
      return userData;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.success && res.data) {
      const { user: newUser, accessToken } = res.data;
      localStorage.setItem('hotelpro_token', accessToken);
      localStorage.setItem('hotelpro_user', JSON.stringify(newUser));
      setToken(accessToken);
      setUser(newUser);
      return newUser;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('hotelpro_token');
      localStorage.removeItem('hotelpro_user');
      setToken(null);
      setUser(null);
    }
  };

  const updateProfile = async (updates) => {
    const res = await api.put('/auth/profile', updates);
    if (res.success && res.data) {
      setUser(res.data);
      localStorage.setItem('hotelpro_user', JSON.stringify(res.data));
      return res.data;
    }
    throw new Error(res.message || 'Failed to update profile');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isStaff: user?.role === 'staff' || user?.role === 'admin',
        isGuest: user?.role === 'guest',
        login,
        register,
        logout,
        updateProfile,
        fetchCurrentUser,
      }}
    >
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
