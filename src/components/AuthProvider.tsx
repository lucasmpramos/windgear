import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { handleError, AppError, ErrorType, ErrorSeverity } from '../utils/errorHandler'; 
import { User } from '../types';
import toast from 'react-hot-toast';
import debounce from '../utils/debounce';
import retry from 'retry';

const SESSION_EXPIRY_MARGIN = 60 * 1000; // 1 minute in milliseconds

const AuthContext = createContext<{
  signOut: () => Promise<void>;
}>({
  signOut: async () => {},
});

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { setUser } = useStore();
  const syncInProgress = useRef(false);
  const retryCount = useRef(0);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      handleError(error, { 
        context: 'fetchProfile',
        userId 
      });
      return null;
    }
  };

  const updateLastSignIn = async (userId: string) => {
    try {
      const { error } = await supabase
        .rpc('update_last_sign_in', { user_id: userId })
        .single();

      if (error) throw error;
    } catch (error) {
      // Let the caller handle the error
      throw error;
    }
  };

  const retryWithDelay = (fn: () => Promise<void>) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(async () => {
        if (retryCount.current >= MAX_RETRIES) {
          retryCount.current = 0;
          reject(new Error('Max retries exceeded'));
          return;
        }

        try {
          await fn();
          resolve();
        } catch (error) {
          retryCount.current++;
          reject(error);
        }
      }, RETRY_DELAY * Math.pow(2, retryCount.current - 1)); // Exponential backoff
    });
  };

  // Debounce the sync function to prevent rate limiting
  const debouncedSyncProfile = debounce(async (session: any) => {
    if (!session?.user || syncInProgress.current) return;

    try {
      syncInProgress.current = true;

      const syncAttempt = async () => {
        // Get user metadata from auth
        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        // Get avatar URL from OAuth provider if available
        const avatarUrl = authUser?.user_metadata?.avatar_url || 
                         authUser?.identities?.[0]?.identity_data?.avatar_url ||
                         null;

        const fullName = authUser?.user_metadata?.full_name || 
                        authUser?.identities?.[0]?.identity_data?.full_name ||
                        null;

        // Update profile with OAuth data if needed
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            avatar_url: avatarUrl,
            full_name: fullName,
            updated_at: new Date().toISOString()
          })
          .eq('id', session.user.id);

        if (updateError) throw updateError;

        // Update auth metadata to match profile
        const { error: authUpdateError } = await supabase.auth.updateUser({
          data: {
            avatar_url: avatarUrl,
            full_name: fullName
          }
        });

        if (authUpdateError) throw authUpdateError;

        // Reset retry count on success
        retryCount.current = 0;
      };

      try {
        await syncAttempt();
      } catch (error: any) {
        // Retry on network errors or rate limits
        if ((error.status === 0 || error.status === 429) && retryCount.current < MAX_RETRIES) {
          retryCount.current++;
          await retryWithDelay(syncAttempt);
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      if (error.status === 429) {
        console.warn('Rate limit reached for auth sync, will retry later');
      } else if (error.status === 0) {
        console.warn('Network error during sync, will retry later');
      } else {
        throw new AppError('Failed to sync profile', {
          type: ErrorType.AUTH,
          severity: ErrorSeverity.MEDIUM,
          context: { session },
          displayMessage: 'Unable to sync your profile. Some features may be limited.'
        });
      }
    } finally {
      syncInProgress.current = false;
    }
  }, 1000); // 1 second delay between syncs
  const refreshTimeout = useRef<NodeJS.Timeout>();

  const clearRefreshTimeout = () => {
    if (refreshTimeout.current) {
      clearTimeout(refreshTimeout.current);
      refreshTimeout.current = undefined;
    }
  };

  const scheduleTokenRefresh = (expiresAt: number) => {
    clearRefreshTimeout();
    
    const now = Date.now();
    const refreshTime = expiresAt - SESSION_EXPIRY_MARGIN;
    
    if (refreshTime > now) {
      refreshTimeout.current = setTimeout(async () => {
        try {
          const { data, error } = await supabase.auth.refreshSession();
          if (error) throw error;
          
          if (data.session) {
            // Schedule next refresh
            const newExpiresAt = new Date(data.session.expires_at).getTime();
            scheduleTokenRefresh(newExpiresAt);
          }
        } catch (error) {
          console.warn('Failed to refresh token:', error);
          // Force re-authentication on refresh failure
          await signOut();
        }
      }, refreshTime - now);
    }
  };

  const handleSession = async (session: any) => {
    try {
      if (session?.user) {
        // Schedule token refresh if we have an expiry time
        if (session.expires_at) {
          const expiresAt = new Date(session.expires_at).getTime();
          scheduleTokenRefresh(expiresAt);
        }

        // Update last sign in time with error handling
        try {
          await updateLastSignIn(session.user.id);
        } catch (error) {
          // Silently handle last sign in update failure
          console.warn('Failed to update last sign in time:', error);
        }
        
        // Sync profile with auth data
        await debouncedSyncProfile(session);
        
        const profile = await fetchProfile(session.user.id);
        
        if (profile) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            bio: profile.bio,
            location: profile.location,
            whatsapp: profile.whatsapp,
            created_at: profile.created_at,
            updated_at: profile.updated_at,
            is_admin: profile.is_admin,
            last_sign_in_at: profile.last_sign_in_at
          });
        } else {
          // Fallback to session data if profile fetch fails
          setUser({
            id: session.user.id,
            email: session.user.email!,
            full_name: session.user.user_metadata?.full_name,
            avatar_url: session.user.user_metadata?.avatar_url,
            created_at: session.user.created_at,
          });
        }
      } else {
        setUser(null);
      }
    } catch (error: any) {
      console.error('Error handling session:', error);
      // Don't show error toast for initial session check
      if (error?.status !== 400) {
        toast.error('Error managing your session. Please try signing in again.');
      }
    }
  };

  useEffect(() => {
    let mounted = true;

    // Check active session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (mounted) {
        if (error) {
          console.error('Session check error:', error);
          return;
        }
        handleSession(session);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        handleSession(session);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearRefreshTimeout();
      syncInProgress.current = false;
      retryCount.current = 0;
    };
  }, []);

  const signOut = async () => {
    try {
      clearRefreshTimeout();
      await supabase.auth.signOut();
      setUser(null);
      navigate('/');
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
    }
  };

  return (
    <AuthContext.Provider value={{ signOut }}>
      {children}
    </AuthContext.Provider>
  );
}