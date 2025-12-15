'use client';

import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import { api } from '@/lib/api';

interface VendorScore {
  id: string;
  vendorId: string;
  vendor: { name: string; email: string };
  overallScore: number;
  tier: 'A' | 'B' | 'C';
  deliveryScore: number;
  priceScore: number;
  qualityScore: number;
  responseScore: number;
  consistencyScore: number;
  totalOrders: number;
  onTimeDeliveries: number;
  totalQuotes: number;
  acceptedQuotes: number;
  updatedAt: string;
}

export default function VendorScoresPage() {
  const [scores, setScores] = useState<VendorScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  const fetchScores = useCallback(async () => {
    try {
      const res = await api.get('/ai/vendor-scores');
      setScores(res.data);
    } catch (error) {
      console.error('Failed to fetch scores:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  const handleRecalculateAll = async () => {
    setRecalculating(true);
    try {
      await api.post('/ai/vendor-score/recalculate-all');
      fetchScores();
    } catch (error) {
      console.error('Failed to recalculate:', error);
    } finally {
      setRecalculating(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'A':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'B':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'C':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const tierCounts = {
    A: scores.filter(s => s.tier === 'A').length,
    B: scores.filter(s => s.tier === 'B').length,
    C: scores.filter(s => s.tier === 'C').length,
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Vendor Scoring
            </h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              AI-driven vendor performance scores (0-100) with tier classification
            </p>
          </div>
          <button
            onClick={handleRecalculateAll}
            disabled={recalculating}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-300"
          >
            {recalculating ? 'Recalculating...' : 'Recalculate All'}
          </button>
        </div>

        {/* Tier Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200/50 dark:border-green-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Tier A (80-100)</p>
                <p className="text-4xl font-bold text-green-700 dark:text-green-300">{tierCounts.A}</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <span className="text-xl font-bold text-white">A</span>
              </div>
            </div>
            <p className="text-xs text-green-600/80 dark:text-green-400/80 mt-2">Preferred vendors</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-2xl p-6 border border-yellow-200/50 dark:border-yellow-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">Tier B (60-79)</p>
                <p className="text-4xl font-bold text-yellow-700 dark:text-yellow-300">{tierCounts.B}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                <span className="text-xl font-bold text-white">B</span>
              </div>
            </div>
            <p className="text-xs text-yellow-600/80 dark:text-yellow-400/80 mt-2">Acceptable vendors</p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-2xl p-6 border border-red-200/50 dark:border-red-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 dark:text-red-400">Tier C (0-59)</p>
                <p className="text-4xl font-bold text-red-700 dark:text-red-300">{tierCounts.C}</p>
              </div>
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                <span className="text-xl font-bold text-white">C</span>
              </div>
            </div>
            <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-2">Needs improvement</p>
          </div>
        </div>

        {/* Vendor Scores Table */}
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200/50 dark:border-slate-700/50">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              All Vendor Scores
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading...</div>
          ) : scores.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No vendor scores yet. Add vendors and process orders to generate scores.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Vendor</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Tier</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Overall</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Delivery</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Quality</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Response</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Orders</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
                  {scores.map((score) => (
                    <tr key={score.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{score.vendor?.name}</p>
                          <p className="text-sm text-slate-500">{score.vendor?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${getTierColor(score.tier)}`}>
                          {score.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-2xl font-bold ${getScoreColor(score.overallScore)}`}>
                          {score.overallScore}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-medium ${getScoreColor(score.deliveryScore)}`}>
                          {score.deliveryScore}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-medium ${getScoreColor(score.priceScore)}`}>
                          {score.priceScore}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-medium ${getScoreColor(score.qualityScore)}`}>
                          {score.qualityScore}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-medium ${getScoreColor(score.responseScore)}`}>
                          {score.responseScore}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-slate-600 dark:text-slate-400">
                          {score.totalOrders}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Scoring Methodology */}
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Scoring Methodology</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
              <p className="text-2xl font-bold text-blue-600">30%</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Delivery Performance</p>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
              <p className="text-2xl font-bold text-blue-600">25%</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Price Competitiveness</p>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
              <p className="text-2xl font-bold text-blue-600">25%</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Quality Score</p>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
              <p className="text-2xl font-bold text-blue-600">10%</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Response Time</p>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
              <p className="text-2xl font-bold text-blue-600">10%</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Consistency</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
