// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Backend API base URL (use env var in production)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Axios instance with interceptors (memoized)
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Attach token to every request
    instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Handle 401 globally → logout
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, []);

  // Initialize auth: validate token on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsAuthenticated(false);
          setUser(null);
          setLoading(false);
          return;
        }

        const decoded = jwtDecode(token);

        // Check expiration
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUser(null);
        } else {
          const userId = decoded.id || decoded.userId;
          const userData = {
            id: userId,
            username: decoded.username,
            role: decoded.role,
            name: decoded.name || decoded.username,
          };
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Invalid or malformed token:', err);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login with username + password
  const login = async (username, password) => {
    try {
      setError(null);
      const response = await api.post('/auth/login', { username, password });
      const { token } = response.data;

      localStorage.setItem('token', token);
      const decoded = jwtDecode(token);

      const userId = decoded.id || decoded.userId;
      const userData = {
        id: userId,
        username: decoded.username,
        role: decoded.role,
        name: decoded.name || decoded.username,
      };

      setUser(userData);
      setIsAuthenticated(true);

      // Redirect based on role
      let redirectPath = '/'; // customer default
      if (decoded.role === 'detailer') redirectPath = '/detailer';
      if (decoded.role === 'admin') redirectPath = '/admin';

      navigate(redirectPath, { replace: true });

      return userData;
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid credentials';
      setError(message);
      throw new Error(message);
    }
  };

  // Register new user (called from Register.jsx)
  const register = async (userData) => {
    try {
      setError(null);
      const response = await api.post('/auth/register', userData);
      const { token } = response.data;

      localStorage.setItem('token', token);
      const decoded = jwtDecode(token);

      const userId = decoded.id || decoded.userId;
      const newUser = {
        id: userId,
        username: decoded.username,
        role: decoded.role,
        name: decoded.name || decoded.username,
      };

      setUser(newUser);
      setIsAuthenticated(true);

      // Auto-redirect based on role (same logic as login)
      let redirectPath = '/';
      if (decoded.role === 'detailer') redirectPath = '/detailer';
      if (decoded.role === 'admin') redirectPath = '/admin';

      navigate(redirectPath, { replace: true });

      return newUser;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    navigate('/', { replace: true });
  };

  // Update profile (supports multipart for photo upload)
  const updateProfile = async (data) => {
    try {
      setError(null);
      const payload = data instanceof FormData
        ? Object.fromEntries(data.entries())
        : data;
      const response = await api.put('/customer/profile', payload);

      const updated = response.data?.user || response.data;

      setUser((prev) => ({
        ...prev,
        name: updated.name,
        email: updated.email,
        profilePicture: updated.profilePicture,
      }));

      return updated;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update profile';
      setError(message);
      throw new Error(message);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    api,
    login,
    register,           // ← now available in Register.jsx
    logout,
    updateProfile,
    isAdmin: user?.role === 'admin',
    isDetailer: user?.role === 'detailer',
    isCustomer: user?.role === 'customer',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};