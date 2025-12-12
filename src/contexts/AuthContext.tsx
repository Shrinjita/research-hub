import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { mockApi, User } from '@/services/mockApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('taskoscope_token');
    if (storedToken) {
      mockApi.getMe(storedToken)
        .then(user => {
          setUser(user);
          setToken(storedToken);
        })
        .catch(() => {
          localStorage.removeItem('taskoscope_token');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await mockApi.login(email, password);
    localStorage.setItem('taskoscope_token', response.token);
    setToken(response.token);
    setUser(response.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await mockApi.register(name, email, password);
    localStorage.setItem('taskoscope_token', response.token);
    setToken(response.token);
    setUser(response.user);
  };

  const logout = () => {
    localStorage.removeItem('taskoscope_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
