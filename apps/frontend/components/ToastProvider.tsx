'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--glass-border)',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: 'var(--glass-shadow)',
          color: 'inherit',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#ffffff',
          },
          style: {
            borderLeft: '4px solid #10b981',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
          style: {
            borderLeft: '4px solid #ef4444',
          },
        },
        loading: {
          iconTheme: {
            primary: '#6366f1',
            secondary: '#ffffff',
          },
        },
      }}
    />
  );
}
