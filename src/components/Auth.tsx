import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { Mail, Lock, User, MapPin, Loader, AlertCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

function Auth() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    location: ''
  });

  // Get the current domain, handling both localhost and production
  const getCurrentDomain = () => {
    // If we're on Netlify, use the deploy URL or site URL
    if (window.location.hostname !== 'localhost') {
      return window.location.origin;
    }
    // Fallback to localhost for development
    return 'http://localhost:3000';
  };

  const handleOAuthSignIn = async (provider: 'google' | 'facebook') => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${getCurrentDomain()}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          scopes: provider === 'google' ? 'profile email' : undefined
        }
      });

      if (error) throw error;

      // If we have a URL to redirect to, use it
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('OAuth error:', error);
      setError(`Failed to sign in with ${provider}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError(null);
  };

  const getErrorMessage = (error: any): string => {
    const errorMessages: { [key: string]: string } = {
      'Invalid login credentials': 'Incorrect email or password',
      'Email not confirmed': 'Please check your email and confirm your account before signing in',
      'User already registered': 'An account with this email already exists',
      'Password should be at least 6 characters': 'Password must be at least 6 characters long',
      'Email format is invalid': 'Please enter a valid email address'
    };

    const message = error?.message;
    if (message && errorMessages[message]) {
      return errorMessages[message];
    }

    if (error?.code === '42501') {
      return 'Unable to create profile. Please try again.';
    }

    return message || 'An unexpected error occurred. Please try again.';
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${getCurrentDomain()}/auth/reset-password`,
      });

      if (error) throw error;

      toast.success(t('auth.checkEmailConfirm'), {
        duration: 6000
      });
      setMode('signin');
    } catch (error) {
      console.error('Reset password error:', error);
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        if (formData.password.length < 6) {
          throw new Error('Password should be at least 6 characters');
        }

        // First, create the auth user with metadata
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.full_name,
              avatar_url: null
            }
          }
        });

        if (signUpError) throw signUpError;

        if (authData.user) {
          // Then create the profile
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email: formData.email,
              full_name: formData.full_name,
              location: formData.location,
              avatar_url: null
            });

          if (profileError) throw profileError;

          // Update the auth metadata to match the profile
          const { error: updateError } = await supabase.auth.updateUser({
            data: {
              full_name: formData.full_name,
              avatar_url: null
            }
          });

          if (updateError) throw updateError;

          toast.success(t('auth.checkEmailConfirm'), {
            duration: 6000
          });
          setMode('signin');
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });

        if (signInError) throw signInError;
        
        toast.success(t('auth.signInSuccess'));
        navigate('/');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    if (mode === 'forgot') {
      return (
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1"> 
              {t('auth.email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder={t('auth.emailPlaceholder')}
                value={formData.email}
                onChange={handleChange}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader className="h-5 w-5 animate-spin" />
                Sending Instructions...
              </span>
            ) : (
              t('auth.sendResetInstructions')
            )}
          </button>

          <button
            type="button"
            onClick={() => setMode('signin')}
            className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('auth.backToSignIn')}
          </button>
        </form>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <>
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1"> 
                {t('auth.fullName')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  required
                  placeholder={t('auth.fullNamePlaceholder')}
                  value={formData.full_name}
                  onChange={handleChange}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1"> 
                {t('auth.location')}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="location"
                  name="location"
                  required
                  placeholder={t('auth.locationPlaceholder')}
                  value={formData.location}
                  onChange={handleChange}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1"> 
            {t('auth.email')}
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder={t('auth.emailPlaceholder')}
              value={formData.email}
              onChange={handleChange}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1"> 
            {t('auth.password')}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="password"
              id="password"
              name="password"
              required
              placeholder={t('auth.passwordPlaceholder')}
              value={formData.password}
              onChange={handleChange}
              minLength={6}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {mode === 'signup' && (
            <p className="mt-1 text-sm text-gray-500">
              {t('auth.passwordRequirement')}
            </p>
          )}
        </div>

        {mode === 'signin' && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setMode('forgot');
                setError(null);
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {t('auth.forgotPassword')}
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader className="h-5 w-5 animate-spin" />
              {mode === 'signup' ? t('auth.creatingAccount') : t('auth.signingIn')}
            </span>
          ) : (
            <span>{mode === 'signup' ? t('auth.createAccount') : t('auth.signIn')}</span>
          )}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signup' ? 'signin' : 'signup');
              setError(null);
              setFormData({
                email: '',
                password: '',
                full_name: '',
                location: ''
              });
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {mode === 'signup' ? t('auth.alreadyHaveAccount') : t('auth.dontHaveAccount')}
          </button>
        </div>

        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">{t('auth.orContinueWith')}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleOAuthSignIn('google')}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            <span>Google</span>
          </button>
          <button
            type="button"
            onClick={() => handleOAuthSignIn('facebook')}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            <img src="https://www.facebook.com/favicon.ico" alt="Facebook" className="w-5 h-5" />
            <span>Facebook</span>
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold text-center mb-6">
        {mode === 'signup' ? 'Create Account' : mode === 'forgot' ? 'Reset Password' : 'Sign In'}
      </h2>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {renderForm()}
    </div>
  );
}

export default Auth;