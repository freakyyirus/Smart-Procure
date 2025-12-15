'use client';

import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import { api } from '@/lib/api';

interface Item {
  id: string;
  name: string;
}

interface Recommendation {
  id: string;
  vendorId: string;
  vendor: { name: string; email: string };
  relevanceScore: number;
  vendorScore: number | null;
  reasons: string[];
  rank: number;
  wasSelected: boolean;
  createdAt: string;
}

export default function RecommendationsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    try {
      const res = await api.get('/items');
      setItems(res.data);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setItemsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleGetRecommendations = async () => {
    if (selectedItems.length === 0) return;

    setLoading(true);
    try {
      const res = await api.post('/ai/vendor-recommendation', {
        itemIds: selectedItems,
        urgency,
      });
      setRecommendations(res.data);
    } catch (error) {
      console.error('Failed to get recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVendor = async (recommendationId: string) => {
    try {
      await api.put(`/ai/vendor-recommendation/${recommendationId}/select`);
      setRecommendations(prev =>
        prev.map(r =>
          r.id === recommendationId ? { ...r, wasSelected: true } : r
        )
      );
    } catch (error) {
      console.error('Failed to select vendor:', error);
    }
  };

  const toggleItem = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Vendor Recommendations
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Get AI-powered vendor suggestions for your procurement needs
          </p>
        </div>

        {/* Selection Panel */}
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Select Items to Procure
          </h2>

          {itemsLoading ? (
            <div className="text-center text-slate-500">Loading items...</div>
          ) : items.length === 0 ? (
            <div className="text-center text-slate-500">
              No items found. Add items first to get recommendations.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-6">
                {items.slice(0, 20).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`
                      px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                      ${selectedItems.includes(item.id)
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }
                    `}
                  >
                    {item.name}
                  </button>
                ))}
                {items.length > 20 && (
                  <span className="px-4 py-2 text-sm text-slate-500">
                    +{items.length - 20} more items
                  </span>
                )}
              </div>

              <div className="flex items-center gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Urgency Level
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as 'low' | 'medium' | 'high')}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-700 border-0 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low - Flexible timeline</option>
                    <option value="medium">Medium - Standard</option>
                    <option value="high">High - Urgent delivery</option>
                  </select>
                </div>

                <button
                  onClick={handleGetRecommendations}
                  disabled={selectedItems.length === 0 || loading}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {loading ? 'Finding Vendors...' : 'Get Recommendations'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Recommendations Results */}
        {recommendations.length > 0 && (
          <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200/50 dark:border-slate-700/50">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Recommended Vendors
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Ranked by relevance to your selected items and urgency level
              </p>
            </div>

            <div className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
              {recommendations.map((rec, index) => (
                <div
                  key={rec.id}
                  className={`p-6 ${rec.wasSelected ? 'bg-green-50/50 dark:bg-green-900/10' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Rank Badge */}
                    <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white
                      ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 
                        index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500' :
                        index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800' :
                        'bg-slate-400'}
                    `}>
                      {rec.rank}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            {rec.vendor?.name}
                          </h3>
                          <p className="text-sm text-slate-500">{rec.vendor?.email}</p>
                        </div>
                        {rec.wasSelected ? (
                          <span className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl text-sm font-medium">
                            Selected
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSelectVendor(rec.id)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors"
                          >
                            Select Vendor
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-6 mb-4">
                        <div>
                          <p className="text-xs text-slate-500">Relevance Score</p>
                          <p className="font-bold text-lg text-blue-600 dark:text-blue-400">
                            {(Number(rec.relevanceScore || 0) * 100).toFixed(0)}%
                          </p>
                        </div>
                        {rec.vendorScore && (
                          <div>
                            <p className="text-xs text-slate-500">Vendor Score</p>
                            <p className="font-bold text-lg text-slate-900 dark:text-white">
                              {rec.vendorScore}/100
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {rec.reasons.map((reason, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>
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
