import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService, userService } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<User>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('hooks_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      if (!localStorage.getItem('hooks_token')) {
        setCurrentUser(null);
        setLoading(false);
        return;
      }
      const response = await authService.getMe();
      setCurrentUser(response.data.user);
    } catch (error) {
      console.error('Failed to load current user:', error);
      localStorage.removeItem('hooks_token');
      setToken(null);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    const { token: receivedToken, user } = response.data;
    localStorage.setItem('hooks_token', receivedToken);
    setToken(receivedToken);
    setCurrentUser(user);
  };

  const register = async (data: any) => {
    const response = await authService.register(data);
    const { token: receivedToken, user } = response.data;
    localStorage.setItem('hooks_token', receivedToken);
    setToken(receivedToken);
    setCurrentUser(user);
  };

  const logout = () => {
    localStorage.removeItem('hooks_token');
    setToken(null);
    setCurrentUser(null);
  };

  const updateProfile = async (data: Partial<User>): Promise<User> => {
    const response = await userService.updateMe(data);
    setCurrentUser(response.data);
    return response.data;
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
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

