'use client';

import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import { api } from '@/lib/api';

interface Anomaly {
  id: string;
  quoteId: string;
  itemId: string;
  item: { name: string };
  quote: { vendor: { name: string } };
  expectedPrice: number;
  actualPrice: number;
  deviation: number;
  severity: 'NORMAL' | 'HIGH' | 'EXTREMELY_HIGH';
  aiExplanation: string | null;
  acknowledged: boolean;
  createdAt: string;
}

export default function AnomaliesPage() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnomalies = useCallback(async () => {
    try {
      const res = await api.get('/ai/anomaly/recent?limit=50');
      setAnomalies(res.data);
    } catch (error) {
      console.error('Failed to fetch anomalies:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnomalies();
  }, [fetchAnomalies]);

  const handleAcknowledge = async (anomalyId: string) => {
    try {
      await api.put(`/ai/anomaly/${anomalyId}/acknowledge`);
      fetchAnomalies();
    } catch (error) {
      console.error('Failed to acknowledge:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'EXTREMELY_HIGH':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  const getSeverityIcon = (severity: string) => {
    if (severity === 'EXTREMELY_HIGH') {
      return (
        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  const unacknowledgedCount = anomalies.filter(a => !a.acknowledged).length;

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Price Anomaly Detection
            </h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              AI-detected pricing anomalies in your quotes
            </p>
          </div>
          {unacknowledgedCount > 0 && (
            <div className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-xl font-medium">
              {unacknowledgedCount} unreviewed
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Anomalies</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{anomalies.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
            <p className="text-sm text-slate-600 dark:text-slate-400">High Severity</p>
            <p className="text-3xl font-bold text-orange-500">
              {anomalies.filter(a => a.severity === 'HIGH').length}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
            <p className="text-sm text-slate-600 dark:text-slate-400">Extremely High</p>
            <p className="text-3xl font-bold text-red-500">
              {anomalies.filter(a => a.severity === 'EXTREMELY_HIGH').length}
            </p>
          </div>
        </div>

        {/* Anomalies List */}
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200/50 dark:border-slate-700/50">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Detected Anomalies
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading...</div>
          ) : anomalies.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No price anomalies detected. Your quotes are within normal range.
            </div>
          ) : (
            <div className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
              {anomalies.map((anomaly) => (
                <div
                  key={anomaly.id}
                  className={`p-6 ${anomaly.acknowledged ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getSeverityIcon(anomaly.severity)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(anomaly.severity)}`}>
                          {anomaly.severity.replace('_', ' ')}
                        </span>
                        <span className="text-sm text-slate-500">
                          +{(anomaly.deviation * 100).toFixed(0)}% above expected
                        </span>
                        {anomaly.acknowledged && (
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-xs">
                            Acknowledged
                          </span>
                        )}
                      </div>

                      <h3 className="font-medium text-slate-900 dark:text-white mb-1">
                        {anomaly.item?.name || 'Unknown Item'}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                        From: {anomaly.quote?.vendor?.name || 'Unknown Vendor'}
                      </p>

                      <div className="flex items-center gap-6 mb-4">
                        <div>
                          <p className="text-xs text-slate-500">Expected Price</p>
                          <p className="font-medium text-slate-900 dark:text-white">
                            ₹{anomaly.expectedPrice.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-slate-400">→</div>
                        <div>
                          <p className="text-xs text-slate-500">Actual Price</p>
                          <p className="font-medium text-red-600 dark:text-red-400">
                            ₹{anomaly.actualPrice.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Difference</p>
                          <p className="font-medium text-red-600 dark:text-red-400">
                            +₹{(anomaly.actualPrice - anomaly.expectedPrice).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {anomaly.aiExplanation && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-4">
                          <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
                            AI Analysis
                          </p>
                          <p className="text-sm text-slate-700 dark:text-slate-300">
                            {anomaly.aiExplanation}
                          </p>
                        </div>
                      )}

                      {!anomaly.acknowledged && (
                        <button
                          onClick={() => handleAcknowledge(anomaly.id)}
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                          Acknowledge
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
