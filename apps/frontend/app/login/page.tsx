'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithGoogle, isSupabaseConfigured } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.access_token);
        router.push('/dashboard');
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!isSupabaseConfigured()) {
      alert('Google OAuth is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
      return;
    }

    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        console.error('Google login error:', error);
        alert('Google login failed: ' + error.message);
      }
      // If successful, the user will be redirected to Google
    } catch (error) {
      console.error('Google login error:', error);
      alert('Google login failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-500">
      {/* Left Side - Brand Story */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-blue-700/90 to-slate-900/90 dark:from-blue-900/50 dark:via-slate-900/80 dark:to-slate-900/90 backdrop-blur-sm" />
        
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          {/* Logo */}
          <div className="mb-12 animate-slide-up">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-2xl">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold">Smart Procure</h1>
            </div>
            <p className="text-xl text-blue-100 leading-relaxed">
              Enterprise procurement automation designed for modern businesses
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6 animate-fade-in">
            {[
              { title: 'Automated Workflows', desc: 'From RFQ to payment in clicks, not weeks' },
              { title: 'AI-Powered Insights', desc: 'Smart recommendations and predictive analytics' },
              { title: 'Enterprise Security', desc: 'Bank-grade encryption and compliance' },
            ].map((feature, i) => (
              <div key={i} className="flex items-start space-x-4 p-4 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                  <p className="text-blue-100 text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-6">
            {[
              { value: '500+', label: 'Companies' },
              { value: '₹2.5Cr+', label: 'Processed' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20">
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-blue-100 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Card */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-slide-up">
          {/* Glass Card */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Welcome Back
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Sign in to continue to Smart Procure
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Input */}
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder=" "
                  className="peer w-full px-4 py-4 bg-white/50 dark:bg-slate-900/50 border-2 border-slate-200/50 dark:border-slate-700/50 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300 text-slate-900 dark:text-white placeholder-transparent"
                />
                <label className="absolute left-4 -top-2.5 px-2 bg-white/90 dark:bg-slate-800/90 text-sm font-medium text-slate-600 dark:text-slate-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 dark:peer-focus:text-blue-400 peer-focus:bg-white/90 dark:peer-focus:bg-slate-800/90">
                  Email Address
                </label>
              </div>

              {/* Password Input */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder=" "
                  className="peer w-full px-4 py-4 bg-white/50 dark:bg-slate-900/50 border-2 border-slate-200/50 dark:border-slate-700/50 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300 text-slate-900 dark:text-white placeholder-transparent pr-12"
                />
                <label className="absolute left-4 -top-2.5 px-2 bg-white/90 dark:bg-slate-800/90 text-sm font-medium text-slate-600 dark:text-slate-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 dark:peer-focus:text-blue-400 peer-focus:bg-white/90 dark:peer-focus:bg-slate-800/90">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20" />
                  <span className="text-slate-600 dark:text-slate-400">Remember me</span>
                </label>
                <Link href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                  Forgot password?
                </Link>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/70 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400">Or continue with</span>
                </div>
              </div>

              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full py-4 bg-white dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl font-semibold text-slate-700 dark:text-slate-300 transition-all duration-300 flex items-center justify-center space-x-3 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>{googleLoading ? 'Connecting...' : 'Continue with Google'}</span>
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold">
                Sign up for free
              </Link>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-50/50 dark:bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-blue-200/30 dark:border-slate-700/30">
            <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-2">Demo Credentials:</p>
            <p className="text-xs text-blue-700 dark:text-blue-400">admin@smartprocure.com / Admin@123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
