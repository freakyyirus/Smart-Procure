'use client';

import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import { api } from '@/lib/api';

interface Item {
  id: string;
  name: string;
}

interface Forecast {
  itemId: string;
  itemName: string;
  currentPrice: number;
  forecastedPrice: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  confidence: number;
  factors: string[];
  horizon: string;
}

interface PriceTrends {
  upTrend: number;
  downTrend: number;
  stable: number;
  avgConfidence: number;
}

export default function ForecastingPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [horizon, setHorizon] = useState<number>(30);
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [bulkForecasts, setBulkForecasts] = useState<Forecast[]>([]);
  const [trends, setTrends] = useState<PriceTrends | null>(null);
  const [loading, setLoading] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [itemsRes, trendsRes] = await Promise.all([
        api.get('/items'),
        api.get('/ai/forecast/trends'),
      ]);
      setItems(itemsRes.data);
      setTrends(trendsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setItemsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleForecast = async () => {
    if (!selectedItem) return;

    setLoading(true);
    try {
      const res = await api.post(`/ai/forecast/${selectedItem}?horizon=${horizon}`);
      setForecast(res.data);
    } catch (error) {
      console.error('Failed to forecast:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkForecast = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/ai/forecast/bulk?horizon=${horizon}`);
      setBulkForecasts(res.data);
    } catch (error) {
      console.error('Failed to bulk forecast:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'UP':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        );
      case 'DOWN':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
        );
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'UP':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'DOWN':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400';
    }
  };

  const getPriceChange = (current: number, forecasted: number) => {
    const change = ((forecasted - current) / current) * 100;
    return change;
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Price Forecasting
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Predict future item prices based on historical data and trends
          </p>
        </div>

        {/* Trend Summary */}
        {trends && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-2xl p-6 border border-red-200/50 dark:border-red-700/50">
              <div className="flex items-center gap-3">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <div>
                  <p className="text-sm text-red-600 dark:text-red-400">Price Increasing</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">{trends.upTrend}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200/50 dark:border-green-700/50">
              <div className="flex items-center gap-3">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">Price Decreasing</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{trends.downTrend}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center gap-3">
                <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                </svg>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Stable Prices</p>
                  <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">{trends.stable}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50">
              <div className="flex items-center gap-3">
                <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Avg Confidence</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{(Number(trends.avgConfidence || 0) * 100).toFixed(0)}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Forecast Controls */}
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Generate Forecast</h2>
          
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Select Item
              </label>
              <select
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border-0 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="">Choose an item</option>
                {items.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>

            <div className="w-40">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Forecast Horizon
              </label>
              <select
                value={horizon}
                onChange={(e) => setHorizon(parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border-0 rounded-xl text-slate-900 dark:text-white"
              >
                <option value={7}>7 days</option>
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
                <option value={90}>90 days</option>
              </select>
            </div>

            <button
              onClick={handleForecast}
              disabled={!selectedItem || loading}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-300"
            >
              {loading ? 'Forecasting...' : 'Forecast Item'}
            </button>

            <button
              onClick={handleBulkForecast}
              disabled={loading}
              className="px-6 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 transition-all duration-300"
            >
              {loading ? 'Processing...' : 'Forecast All Items'}
            </button>
          </div>
        </div>

        {/* Single Item Forecast Result */}
        {forecast && (
          <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Forecast for {forecast.itemName}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div>
                <p className="text-sm text-slate-500">Current Price</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  ₹{forecast.currentPrice.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Forecasted Price ({forecast.horizon})</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  ₹{forecast.forecastedPrice.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Expected Change</p>
                <p className={`text-2xl font-bold ${
                  getPriceChange(forecast.currentPrice, forecast.forecastedPrice) > 0 
                    ? 'text-red-600' 
                    : getPriceChange(forecast.currentPrice, forecast.forecastedPrice) < 0 
                    ? 'text-green-600' 
                    : 'text-slate-600'
                }`}>
                  {getPriceChange(forecast.currentPrice, forecast.forecastedPrice) > 0 ? '+' : ''}
                  {Number(getPriceChange(forecast.currentPrice, forecast.forecastedPrice) || 0).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Confidence</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {(Number(forecast.confidence || 0) * 100).toFixed(0)}%
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${getTrendColor(forecast.trend)}`}>
                {getTrendIcon(forecast.trend)}
                Price {forecast.trend === 'UP' ? 'Increasing' : forecast.trend === 'DOWN' ? 'Decreasing' : 'Stable'}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Contributing Factors</p>
              <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1">
                {forecast.factors.map((factor, idx) => (
                  <li key={idx}>{factor}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Bulk Forecast Results */}
        {bulkForecasts.length > 0 && (
          <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200/50 dark:border-slate-700/50">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                All Item Forecasts ({bulkForecasts.length} items)
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Item</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Current</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Forecasted</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Change</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Trend</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
                  {bulkForecasts.map((f) => (
                    <tr key={f.itemId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{f.itemName}</td>
                      <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400">
                        ₹{f.currentPrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-900 dark:text-white font-medium">
                        ₹{f.forecastedPrice.toLocaleString()}
                      </td>
                      <td className={`px-6 py-4 text-center font-medium ${
                        getPriceChange(f.currentPrice, f.forecastedPrice) > 0 
                          ? 'text-red-600' 
                          : getPriceChange(f.currentPrice, f.forecastedPrice) < 0 
                          ? 'text-green-600' 
                          : 'text-slate-600'
                      }`}>
                        {getPriceChange(f.currentPrice, f.forecastedPrice) > 0 ? '+' : ''}
                        {Number(getPriceChange(f.currentPrice, f.forecastedPrice) || 0).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getTrendColor(f.trend)}`}>
                          {getTrendIcon(f.trend)}
                          {f.trend}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-400">
                        {(Number(f.confidence || 0) * 100).toFixed(0)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
