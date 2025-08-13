import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.warn('Supabase not configured, running in demo mode');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      );

      return () => subscription.unsubscribe();
    } catch (error) {
      console.warn('Supabase auth listener not available');
      return () => {};
    }
  }, []);

  const signUp = async (email: string, password: string, metadata?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
  };

  const updateUserProfile = async (updates: any) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      });
      
      if (error) {
        throw error;
      }
      
      // Update the local user state with the new data
      if (data.user) {
        setUser({
          ...data.user,
          user_metadata: {
            ...data.user.user_metadata,
            ...updates
          }
        });
      }
      
      return { data, error: null };
    } catch (error) {
      console.error("Error updating user profile:", error);
      return { data: null, error };
    }
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateUserProfile
  };
};