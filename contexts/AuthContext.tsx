"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getCurrentUser, 
  signOut, 
  getUserFromLocalStorage, 
  setUserInLocalStorage, 
  removeUserFromLocalStorage,
  supabase
} from '@/lib/supabase';

type User = {
  id: string;
  email: string;
  username: string;
  profile?: any;
} | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user on initial render
  useEffect(() => {
    const loadUser = async () => {
      try {
        // First check localStorage for faster initial load
        const localUser = getUserFromLocalStorage();
        if (localUser) {
          setUser(localUser);
        }

        // Then verify with Supabase
        const currentUser = await getCurrentUser();
        
        if (currentUser) {
          setUser(currentUser);
          setUserInLocalStorage(currentUser);
        } else if (localUser) {
          removeUserFromLocalStorage();
          setUser(null);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        removeUserFromLocalStorage();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setUserInLocalStorage(currentUser);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        removeUserFromLocalStorage();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      await signOut();
      removeUserFromLocalStorage();
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setUserInLocalStorage(currentUser);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser, setUser }}>
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