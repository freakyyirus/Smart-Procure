'use client';

import Sidebar from '@/components/Sidebar';
import ThemeToggle from '@/components/ThemeToggle';
import { AIChatbot } from '@/components/AIChatbot';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState('Admin');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Get user info from localStorage if available
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.firstName) {
          setUserName(payload.firstName);
        }
      }
    } catch (e) {
      // Ignore decode errors
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  // Get page title based on pathname
  const getPageTitle = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0 || (segments.length === 1 && segments[0] === 'dashboard')) {
      return 'Dashboard';
    }
    const lastSegment = segments[segments.length - 1];
    return lastSegment.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getPageSubtitle = () => {
    const title = getPageTitle();
    const subtitles: Record<string, string> = {
      'Dashboard': 'Welcome back to Smart Procure',
      'Vendors': 'Manage your supplier network',
      'Items': 'Product catalog management',
      'Rfqs': 'Request for quotations',
      'Quotes': 'Vendor quote responses',
      'Purchase Orders': 'Order management',
      'Mandates': 'Payment mandate tracking',
    };
    return subtitles[title] || 'Smart Procure';
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm">
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{getPageTitle()}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{getPageSubtitle()}</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Notifications */}
              <button className="relative p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 shadow-sm hover:shadow-md group">
                <svg className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                  className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold shadow-lg">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{userName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Administrator</p>
                  </div>
                  <svg className={`w-4 h-4 text-slate-400 hidden lg:block transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl backdrop-blur-xl overflow-hidden">
                      <div className="p-2">
                        <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-sm text-slate-700 dark:text-slate-300">Profile</span>
                        </a>
                        <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-sm text-slate-700 dark:text-slate-300">Settings</span>
                        </a>
                      </div>
                      <div className="border-t border-slate-200/50 dark:border-slate-700/50 p-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
                        >
                          <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span className="text-sm text-red-600 dark:text-red-400 font-medium">Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 page-transition" key={pathname}>
          {children}
        </main>

        {/* AI Chatbot */}
        <AIChatbot />
      </div>
    </div>
  );
}
