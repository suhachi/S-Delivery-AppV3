import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { useIsAdmin } from '../hooks/useIsAdmin';

interface User {
  id: string;
  email: string;
  displayName?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string, displayName?: string, phone?: string) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading, signup, login, logout } = useFirebaseAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin(user?.id);
  // TEMPORARY TEST OVERRIDE: Force Admin
  // const isAdmin = true;
  // const adminLoading = false;

  const loading = authLoading || adminLoading;

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, signup, logout }}>
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