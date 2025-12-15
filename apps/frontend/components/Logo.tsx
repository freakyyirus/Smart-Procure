'use client';

import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'full' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Logo({ variant = 'full', size = 'md', className }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-8 h-8', text: 'text-lg' },
    md: { icon: 'w-10 h-10', text: 'text-xl' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl' },
    xl: { icon: 'w-16 h-16', text: 'text-3xl' },
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Logo Icon - Abstract Arrow/Flow representing procurement pipeline */}
      <div className={cn(
        'relative flex items-center justify-center rounded-xl',
        'bg-gradient-to-br from-indigo-600 via-indigo-500 to-blue-500',
        'shadow-lg shadow-indigo-500/30',
        sizes[size].icon
      )}>
        {/* Glass overlay */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
        
        {/* SVG Icon */}
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          className="w-2/3 h-2/3 relative z-10"
          aria-hidden="true"
        >
          {/* Abstract arrow/flow icon */}
          <path 
            d="M4 12h12m0 0l-4-4m4 4l-4 4" 
            stroke="white" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M14 6h4a2 2 0 012 2v8a2 2 0 01-2 2h-4" 
            stroke="white" 
            strokeWidth="2" 
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.7"
          />
        </svg>
      </div>
      
      {variant === 'full' && (
        <div className="flex flex-col">
          <span className={cn(
            'font-bold tracking-tight leading-none',
            'bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400',
            'bg-clip-text text-transparent',
            sizes[size].text
          )}>
            Smart Procure
          </span>
          {size !== 'sm' && (
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-wide uppercase">
              AI-Powered Procurement
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Standalone SVG logo for favicon/PDFs
export function LogoIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 32 32" 
      fill="none" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="glassOverlay" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.3" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Background */}
      <rect width="32" height="32" rx="8" fill="url(#logoGradient)" />
      
      {/* Glass overlay */}
      <rect width="32" height="32" rx="8" fill="url(#glassOverlay)" />
      
      {/* Arrow/Flow icon */}
      <path 
        d="M6 16h14m0 0l-5-5m5 5l-5 5" 
        stroke="white" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M18 9h4a2 2 0 012 2v10a2 2 0 01-2 2h-4" 
        stroke="white" 
        strokeWidth="2" 
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
    </svg>
  );
}

// For dark backgrounds (light variant)
export function LogoLight({ variant = 'full', size = 'md', className }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-8 h-8', text: 'text-lg' },
    md: { icon: 'w-10 h-10', text: 'text-xl' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl' },
    xl: { icon: 'w-16 h-16', text: 'text-3xl' },
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn(
        'relative flex items-center justify-center rounded-xl',
        'bg-white/10 backdrop-blur-sm border border-white/20',
        sizes[size].icon
      )}>
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          className="w-2/3 h-2/3"
        >
          <path 
            d="M4 12h12m0 0l-4-4m4 4l-4 4" 
            stroke="white" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M14 6h4a2 2 0 012 2v8a2 2 0 01-2 2h-4" 
            stroke="white" 
            strokeWidth="2" 
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.7"
          />
        </svg>
      </div>
      
      {variant === 'full' && (
        <span className={cn(
          'font-bold tracking-tight text-white',
          sizes[size].text
        )}>
          Smart Procure
        </span>
      )}
    </div>
  );
}
