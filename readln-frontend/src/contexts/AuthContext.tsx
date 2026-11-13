import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

export interface User {
  id: string | number;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLockdownMode: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  setLockdownMode: (status: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLockdownMode, setIsLockdownMode] = useState<boolean>(false);

  useEffect(() => {
    const handleLockdown = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string }>;
      setIsLockdownMode(true);
      console.warn('Hệ thống đang trong chế độ phong tỏa:', customEvent.detail?.message);
    };

    window.addEventListener('app:lockdown', handleLockdown);
    return () => window.removeEventListener('app:lockdown', handleLockdown);
  }, []);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data?.user) {
          setUser(res.data.user);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCurrentUser();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignored
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLockdownMode,
        login,
        logout,
        setLockdownMode: setIsLockdownMode,
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

