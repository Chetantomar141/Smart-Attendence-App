import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) return null;
      const parsed = JSON.parse(storedUser);
      // Normalize role so frontend guards/routes work reliably.
      if (parsed?.role) parsed.role = String(parsed.role).toLowerCase();
      return parsed;
    } catch (error) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) return setUser(null);
        const parsed = JSON.parse(storedUser);
        // Normalize role so frontend guards/routes work reliably.
        if (parsed?.role) parsed.role = String(parsed.role).toLowerCase();
        setUser(parsed);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/signin', { username, password });
      if (response.data.accessToken) {
        const normalizedUser = {
          ...response.data,
          role: response.data.role ? String(response.data.role).toLowerCase() : response.data.role,
        };
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        localStorage.setItem('token', normalizedUser.accessToken);
        localStorage.setItem('role', normalizedUser.role);
        setUser(normalizedUser);
        return normalizedUser;
      }
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
