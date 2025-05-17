
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";

export type Profile = {
  id: string;
  name: string;
  email: string;
  company: string;
  avatar_url?: string;
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile using setTimeout to prevent deadlocks
          setTimeout(async () => {
            await fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      if (data) {
        setProfile({
          id: data.id,
          name: data.name,
          company: data.company,
          email: user?.email || '',
          avatar_url: data.avatar_url,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      return data.user;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string, company: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            name,
            company
          }
        }
      });
      
      if (error) throw error;
      return data.user;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return {
    user,
    session,
    profile,
    loading,
    login,
    register,
    logout,
  };
};

// Legacy functions for backward compatibility
export const getUser = () => {
  const session = supabase.auth.getSession();
  return session ? { id: "user-id", name: "User", email: "user@example.com" } : null;
};

export const login = async (email: string, password: string) => {
  return supabase.auth.signInWithPassword({ email, password });
};

export const register = async (email: string, password: string, name: string, company: string) => {
  return supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: {
        name,
        company
      }
    }
  });
};

export const logout = async () => {
  return supabase.auth.signOut();
};
