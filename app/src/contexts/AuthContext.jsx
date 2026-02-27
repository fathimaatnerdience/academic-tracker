import { createContext, useState, useEffect, useContext, useRef } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const validationInProgress = useRef(false);
  const lastValidationTime = useRef(0);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Token validation - only runs when user is logged in
  useEffect(() => {
    if (!user || loading) return;

    let isCancelled = false;

    const validateToken = async () => {
      // Prevent concurrent validations
      if (validationInProgress.current) return;
      
      // Don't validate too frequently (minimum 30 seconds between validations)
      const now = Date.now();
      if (now - lastValidationTime.current < 30000) return;
      
      validationInProgress.current = true;
      lastValidationTime.current = now;

      try {
        const response = await authAPI.validateToken();
        if (!isCancelled && response?.success) {
          console.log('[Auth] Token valid');
        }
      } catch (error) {
        if (isCancelled) return;
        
        // Only handle actual auth errors, not network issues
        if (error.response?.status === 401 || error.response?.data?.code === 'TOKEN_EXPIRED') {
          console.error('[Auth] Token expired');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          window.location.href = '/login?expired=true';
        } else if (error.response) {
          // Other HTTP errors - log but don't logout
          console.warn('[Auth] Token check failed:', error.response?.status);
        }
        // Network errors are silently ignored
      } finally {
        validationInProgress.current = false;
      }
    };

    // First validation after 5 seconds (give app time to stabilize)
    const initialTimeout = setTimeout(validateToken, 5000);

    // Periodic validation every 2 minutes
    const intervalId = setInterval(validateToken, 2 * 60 * 1000);

    return () => {
      isCancelled = true;
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
      validationInProgress.current = false;
    };
  }, [user, loading]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    logout,
    setUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student',
    isParent: user?.role === 'parent'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
