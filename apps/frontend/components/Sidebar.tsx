'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/Logo';

export default function Sidebar() {
  const pathname = usePathname();

  const mainNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Vendors', href: '/vendors', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { name: 'Items', href: '/items', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { name: 'RFQs', href: '/rfqs', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { name: 'Quotes', href: '/quotes', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { name: 'Purchase Orders', href: '/purchase-orders', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
    { name: 'Mandates', href: '/mandates', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  ];

  const aiNavItems = [
    { name: 'AI Hub', href: '/ai', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', isAI: true },
  ];

  const systemNavItems = [
    { name: 'Notifications', href: '/notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
  ];

  const renderNavItem = (item: typeof mainNavItems[0] & { badge?: string; isAI?: boolean }) => {
    const isActive = pathname === item.href;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`
          group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300
          ${isActive 
            ? item.isAI 
              ? 'bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 dark:from-emerald-500/20 dark:to-cyan-500/20 text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/10' 
              : 'bg-gradient-to-r from-indigo-500/10 to-blue-500/10 dark:from-indigo-500/20 dark:to-blue-500/20 text-indigo-600 dark:text-indigo-400 shadow-lg shadow-indigo-500/10'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
          }
        `}
      >
        <div className="flex items-center space-x-3">
          <div className={`p-1.5 rounded-lg transition-all duration-300 ${
            isActive 
              ? item.isAI 
                ? 'bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-lg shadow-indigo-500/30'
              : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
          }`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
          </div>
          <span className="font-medium">{item.name}</span>
        </div>
        {item.badge && (
          <span className="px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-full shadow-sm">
            {item.badge}
          </span>
        )}
        {item.isAI && !isActive && (
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-full">
            AI
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 glass-sidebar z-40 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
        <Link href="/dashboard" className="block group">
          <Logo size="md" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto scrollbar-thin">
        {/* Main Navigation */}
        <div className="space-y-1">
          <p className="px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Procurement</p>
          {mainNavItems.map(renderNavItem)}
        </div>

        {/* AI Features */}
        <div className="space-y-1">
          <p className="px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            AI Intelligence
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </p>
          {aiNavItems.map(renderNavItem)}
        </div>

        {/* System */}
        <div className="space-y-1">
          <p className="px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">System</p>
          {systemNavItems.map(renderNavItem)}
        </div>
      </nav>

      {/* Bottom Section - AI Status */}
      <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50">
        <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-indigo-50 via-blue-50 to-slate-50 dark:from-indigo-900/20 dark:via-blue-900/20 dark:to-slate-900/20 border border-indigo-200/50 dark:border-indigo-700/30">
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">AI Online</p>
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Gemini 1.5 Flash</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-0.5">Free Tier Active</p>
        </div>
      </div>
    </aside>
  );
}
