import React, { createContext, useContext, useState } from 'react';
import { User } from '@weblens/shared';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  isAuthModalOpen: false,
  authModalMode: 'login',
  openAuthModal: () => {},
  closeAuthModal: () => {},
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AuthContext.Provider value={AuthContext as any}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  return useContext(AuthContext);
}
