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
import { User as SupabaseUser } from '@supabase/supabase-js';

// Define your User interface
interface User {
  id: string;
  email: string;
  username: string;
  profile?: any;
}

type AuthContextType = {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const transformSupabaseUser = (supabaseUser: SupabaseUser | null): User | null => {
    if (!supabaseUser) return null;
    
    return {
      id: supabaseUser.id,
      email: supabaseUser.email ?? '',
      username: supabaseUser.user_metadata?.username ?? supabaseUser.email ?? '',
      profile: supabaseUser.user_metadata?.profile
    };
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const localUser = getUserFromLocalStorage();
        if (localUser) {
          setUser(localUser);
        }

        const currentUser = await getCurrentUser();
        
        if (currentUser) {
          const transformedUser = transformSupabaseUser(currentUser);
          setUser(transformedUser);
          setUserInLocalStorage(transformedUser);
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        const currentUser = await getCurrentUser();
        const transformedUser = transformSupabaseUser(currentUser);
        setUser(transformedUser);
        setUserInLocalStorage(transformedUser);
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
        const transformedUser = transformSupabaseUser(currentUser);
        setUser(transformedUser);
        setUserInLocalStorage(transformedUser);
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