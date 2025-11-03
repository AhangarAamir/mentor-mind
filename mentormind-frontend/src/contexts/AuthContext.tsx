import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: number;
  email: string;
  role: 'student' | 'parent' | 'admin';
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserFromToken = () => {
      const accessToken = localStorage.getItem('access_token');
      if (accessToken) {
        try {
          const decodedToken: any = jwtDecode(accessToken);
          setUser({
            id: decodedToken.user_id, // Assuming user_id is in token
            email: decodedToken.sub,
            role: decodedToken.role,
            name: decodedToken.name || decodedToken.sub, // Assuming name or email as fallback
          });
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to decode access token:', error);
          logout(); // Clear invalid token
        }
      }
      setLoading(false);
    };

    loadUserFromToken();
  }, []);

  const login = (accessToken: string, refreshToken: string) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    try {
      const decodedToken: any = jwtDecode(accessToken);
      setUser({
        id: decodedToken.user_id,
        email: decodedToken.sub,
        role: decodedToken.role,
        name: decodedToken.name || decodedToken.sub,
      });
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to decode access token on login:', error);
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
