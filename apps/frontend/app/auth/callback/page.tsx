'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error during authentication:', error.message);
          setError(error.message);
          return;
        }

        if (session) {
          // Successfully authenticated with Google
          const { user } = session;
          
          if (!user.email) {
            setError('No email found in Google account');
            return;
          }
          
          // Call our backend to create/update user and get JWT token
          try {
            const response = await fetch('http://localhost:3001/api/auth/google-callback', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: user.email,
                name: user.user_metadata?.full_name || user.email.split('@')[0],
                googleId: user.id,
                avatarUrl: user.user_metadata?.avatar_url,
              }),
            });

            if (response.ok) {
              const data = await response.json();
              // Store our backend JWT token
              localStorage.setItem('token', data.access_token);
              router.push('/dashboard');
            } else {
              // If backend doesn't have the endpoint yet, create a temporary session
              console.warn('Backend Google auth not configured, using demo flow');
              localStorage.setItem('google_user', JSON.stringify({
                email: user.email,
                name: user.user_metadata?.full_name,
              }));
              router.push('/dashboard');
            }
          } catch (backendError) {
            console.warn('Backend unavailable:', backendError);
            // Store Google session info for offline use
            localStorage.setItem('google_user', JSON.stringify({
              email: user.email,
              name: user.user_metadata?.full_name,
            }));
            router.push('/dashboard');
          }
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Callback error:', error);
        setError('Authentication failed. Please try again.');
      }
    };

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-10 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Authentication Failed</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-10 max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-4 relative">
          <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-900"></div>
          <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Signing you in...</h2>
        <p className="text-slate-600 dark:text-slate-400">Please wait while we complete your authentication</p>
      </div>
    </div>
  );
}
