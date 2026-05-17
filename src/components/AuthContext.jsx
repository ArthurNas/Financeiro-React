import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  }, []);

  const updateUserFromToken = useCallback((token) => {
    const decoded = jwtDecode(token);
    const isExpired = decoded.exp * 1000 < Date.now();

    if (isExpired) {
      localStorage.removeItem('token');
      setUser(null);
      return false;
    }

    setUser({
      id: decoded.id,
      role: decoded.role,
      nome: decoded.sub,
    });
    return true;
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      updateUserFromToken(token);
    } catch {
      localStorage.removeItem('token');
      setUser(null);
    }

    setLoading(false);
  }, [updateUserFromToken]);

  return (
    <AuthContext.Provider value={{ user, authenticated: !!user, loading, logout, updateUserFromToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
