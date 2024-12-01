import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader, AlertCircle } from 'lucide-react';

function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the hash fragment from the URL
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1) // Remove the # character
        );

        // If we have an access_token in the URL, we need to exchange it
        if (hashParams.get('access_token')) {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) throw sessionError;
          
          if (session) {
            // Session established successfully
            navigate('/', { replace: true });
            return;
          }
        }

        // Set up auth state change listener as fallback
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session) {
            navigate('/', { replace: true });
          } else if (event === 'SIGNED_OUT') {
            navigate('/login', { replace: true });
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Failed to complete authentication');
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-red-600 mb-4">
            <AlertCircle className="h-6 w-6" />
            <p>{error}</p>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <Loader className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}

export default AuthCallback;