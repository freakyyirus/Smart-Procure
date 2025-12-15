'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    gstin: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateStep1 = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
      setError('Password must contain uppercase, lowercase, number, and special character (@$!%*?&)');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.companyName || !formData.companyEmail || !formData.companyPhone) {
      setError('Please fill in all required fields');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3001/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined,
          companyName: formData.companyName,
          companyEmail: formData.companyEmail,
          companyPhone: formData.companyPhone,
          gstin: formData.gstin || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.access_token);
        router.push('/dashboard');
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-500">
      {/* Left Side - Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/90 via-blue-700/90 to-slate-900/90 dark:from-emerald-900/50 dark:via-slate-900/80 dark:to-slate-900/90 backdrop-blur-sm" />
        
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-12">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-2xl">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold">Smart Procure</h1>
            </div>
            <p className="text-xl text-emerald-100 leading-relaxed">
              Start your procurement transformation today
            </p>
          </div>

          <div className="space-y-6">
            {[
              { title: 'Quick Setup', desc: 'Get started in minutes, not days' },
              { title: 'Free Trial', desc: 'No credit card required' },
              { title: 'Secure & Compliant', desc: 'GST-ready for Indian businesses' },
            ].map((feature, i) => (
              <div key={i} className="flex items-start space-x-4 p-4 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                  <p className="text-emerald-100 text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Create Account
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Step {step} of 2: {step === 1 ? 'Your Details' : 'Company Details'}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-500"
                  style={{ width: step === 1 ? '50%' : '100%' }}
                />
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNext(); } : handleSignup} className="space-y-5">
              {step === 1 ? (
                <>
                  {/* First & Last Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border-2 border-slate-200/50 dark:border-slate-700/50 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 dark:text-white"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border-2 border-slate-200/50 dark:border-slate-700/50 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 dark:text-white"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border-2 border-slate-200/50 dark:border-slate-700/50 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 dark:text-white"
                      placeholder="john@example.com"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border-2 border-slate-200/50 dark:border-slate-700/50 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 dark:text-white"
                      placeholder="+91 9876543210"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border-2 border-slate-200/50 dark:border-slate-700/50 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 dark:text-white"
                      placeholder="Min 8 chars with upper, lower, number, special"
                    />
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Must include uppercase, lowercase, number, and special character
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border-2 border-slate-200/50 dark:border-slate-700/50 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 dark:text-white"
                      placeholder="Re-enter password"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300"
                  >
                    Next: Company Details →
                  </button>
                </>
              ) : (
                <>
                  {/* Company Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border-2 border-slate-200/50 dark:border-slate-700/50 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 dark:text-white"
                      placeholder="ABC Private Limited"
                    />
                  </div>

                  {/* Company Email */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Company Email *
                    </label>
                    <input
                      type="email"
                      name="companyEmail"
                      value={formData.companyEmail}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border-2 border-slate-200/50 dark:border-slate-700/50 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 dark:text-white"
                      placeholder="contact@company.com"
                    />
                  </div>

                  {/* Company Phone */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Company Phone *
                    </label>
                    <input
                      type="tel"
                      name="companyPhone"
                      value={formData.companyPhone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border-2 border-slate-200/50 dark:border-slate-700/50 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 dark:text-white"
                      placeholder="+91 22 12345678"
                    />
                  </div>

                  {/* GSTIN */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      GSTIN (Optional)
                    </label>
                    <input
                      type="text"
                      name="gstin"
                      value={formData.gstin}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border-2 border-slate-200/50 dark:border-slate-700/50 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 dark:text-white"
                      placeholder="29XXXXX1234X1Z5"
                    />
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      15-character GST Identification Number
                    </p>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-4 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-4 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50"
                    >
                      {isLoading ? 'Creating...' : 'Create Account'}
                    </button>
                  </div>
                </>
              )}
            </form>

            <div className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
