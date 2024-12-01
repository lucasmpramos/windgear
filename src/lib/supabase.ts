import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import retry from 'retry';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration');
}

// Create Supabase client with retry configuration
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'x-client-info': 'windgear@1.0.0'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  // Add retry configuration
  fetch: (url, options = {}) => {
    const operation = retry.operation({
      retries: 3,
      factor: 1.5,
      minTimeout: 1000,
      maxTimeout: 5000,
      randomize: true,
    });

    return new Promise((resolve, reject) => {
      operation.attempt(async (currentAttempt) => {
        try {
          const response = await fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });

          // Only retry on network errors or 5xx server errors
          if (!response.ok && (response.status >= 500 || response.status === 0)) {
            const error = new Error(`HTTP error! status: ${response.status}`);
            if (operation.retry(error)) {
              return;
            }
          }

          resolve(response);
        } catch (error) {
          if (operation.retry(error as Error)) {
            return;
          }
          reject(operation.mainError());
        }
      });
    });
  }
});