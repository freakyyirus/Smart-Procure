'use client';

import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import { api } from '@/lib/api';
import { AIHubSkeleton } from '@/components/Skeletons';

interface AIStatus {
  available: boolean;
  message: string;
}

interface UsageStats {
  totalRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  estimatedCost: number;
  byFeature: Record<string, { requests: number; cost: number }>;
}

export default function AIHubPage() {
  const [status, setStatus] = useState<AIStatus | null>(null);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [statusRes, usageRes] = await Promise.all([
        api.get('/ai/status'),
        api.get('/ai/usage'),
      ]);
      setStatus(statusRes.data);
      setUsage(usageRes.data);
    } catch (error) {
      console.error('Failed to fetch AI data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const features = [
    {
      name: 'OCR Quote Extraction',
      description: 'Extract structured data from quote PDFs and images using AI vision',
      href: '/ai/ocr',
      icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      name: 'Price Anomaly Detection',
      description: 'Automatically detect overpriced quotes and get AI-powered explanations',
      href: '/ai/anomalies',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      name: 'Vendor Scoring',
      description: 'AI-driven vendor performance scores (0-100) with Tier A/B/C classification',
      href: '/ai/vendor-scores',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      name: 'Vendor Recommendations',
      description: 'Get AI-powered vendor suggestions based on your RFQ requirements',
      href: '/ai/recommendations',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      gradient: 'from-blue-500 to-indigo-500',
    },
    {
      name: 'Negotiation Copilot',
      description: 'AI-assisted negotiation with human-in-the-loop message editing',
      href: '/ai/negotiation',
      icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
      gradient: 'from-indigo-500 to-purple-500',
    },
    {
      name: 'Price Forecasting',
      description: 'Predict future item prices based on historical data and trends',
      href: '/ai/forecasting',
      icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z',
      gradient: 'from-cyan-500 to-blue-500',
    },
  ];

  if (loading) {
    return (
      <AppLayout>
        <AIHubSkeleton />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8 page-transition">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                AI Intelligence Hub
              </h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Your AI-powered command center for smarter procurement decisions
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 glass-panel rounded-full text-sm font-medium text-emerald-700 dark:text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Powered by Google Gemini 1.5 Flash
          </div>
        </div>

        {/* Status Card */}
        <div className={`
          glass-card p-6 border-2 transition-all duration-300
          ${status?.available 
            ? 'border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50/80 to-cyan-50/80 dark:from-emerald-900/20 dark:to-cyan-900/20' 
            : 'border-amber-200 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-900/20'
          }
        `}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`
                w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg
                ${status?.available 
                  ? 'bg-gradient-to-br from-emerald-500 to-cyan-500' 
                  : 'bg-gradient-to-br from-amber-500 to-orange-500'
                }
              `}>
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {status?.available ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  )}
                </svg>
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${status?.available ? 'text-emerald-800 dark:text-emerald-200' : 'text-amber-800 dark:text-amber-200'}`}>
                  {status?.available ? 'AI Features Active' : 'Limited AI Mode'}
                </h3>
                <p className={`text-sm ${status?.available ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {status?.message || 'Checking AI status...'}
                </p>
              </div>
            </div>
            {status?.available && (
              <div className="hidden sm:flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Free tier - No API costs</span>
              </div>
            )}
          </div>
        </div>

        {/* Usage Stats */}
        {usage && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Requests', value: usage.totalRequests, icon: '🚀' },
              { label: 'Input Tokens', value: `${(Number(usage.totalInputTokens || 0) / 1000).toFixed(1)}K`, icon: '📤' },
              { label: 'Output Tokens', value: `${(Number(usage.totalOutputTokens || 0) / 1000).toFixed(1)}K`, icon: '📥' },
              { label: 'Est. Cost', value: `$${Number(usage.estimatedCost || 0).toFixed(2)}`, icon: '💰' },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
                  <span className="text-xl">{stat.icon}</span>
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Feature Cards */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">AI Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature) => (
              <a
                key={feature.name}
                href={feature.href}
                className="group glass-card p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {feature.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
                <div className="flex items-center gap-1 mt-4 text-sm font-medium text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Explore</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Usage by Feature */}
        {usage && Object.keys(usage.byFeature || {}).length > 0 && (
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Usage by Feature</h3>
            <div className="space-y-3">
              {Object.entries(usage.byFeature).map(([feature, data]) => (
                <div key={feature} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <span className="text-slate-600 dark:text-slate-400 capitalize">{feature.replace(/_/g, ' ')}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{data.requests} requests</span>
                    <span className="font-medium text-slate-900 dark:text-white">${Number(data.cost || 0).toFixed(3)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
