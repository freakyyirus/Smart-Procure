'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Quote {
  id: string;
  rfq: {
    id: string;
    rfqNumber: string;
    title: string;
  };
  vendor: {
    id: string;
    name: string;
    email: string;
  };
  items: Array<{
    id: string;
    item: {
      name: string;
      unit: string;
    };
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  notes: string;
  validUntil: string;
  status: string;
  createdAt: string;
}

export default function QuotesPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRFQ, setSelectedRFQ] = useState<string>('All');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('http://localhost:3001/api/quotes', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setQuotes(data);
      } else if (response.status === 401) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to fetch quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (quoteId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/quotes/${quoteId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        alert(`Quote ${status.toLowerCase()}!`);
        fetchQuotes();
        setSelectedQuote(null);
      } else {
        alert('Failed to update quote status');
      }
    } catch (error) {
      alert('Failed to update quote status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const uniqueRFQs = ['All', ...Array.from(new Set(quotes.map(q => q.rfq.rfqNumber)))];
  
  const filteredQuotes = selectedRFQ === 'All' 
    ? quotes 
    : quotes.filter(q => q.rfq.rfqNumber === selectedRFQ);

  // Group quotes by RFQ for comparison
  const groupedByRFQ = filteredQuotes.reduce((acc, quote) => {
    const rfqId = quote.rfq.id;
    if (!acc[rfqId]) {
      acc[rfqId] = {
        rfq: quote.rfq,
        quotes: [],
      };
    }
    acc[rfqId].quotes.push(quote);
    return acc;
  }, {} as Record<string, { rfq: any; quotes: Quote[] }>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quote Comparison</h1>
          <p className="mt-2 text-sm text-gray-600">Compare vendor quotes and select the best offers</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Quotes</p>
                <p className="text-2xl font-bold text-gray-900">{quotes.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{quotes.filter(q => q.status === 'PENDING').length}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-green-600">{quotes.filter(q => q.status === 'ACCEPTED').length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Value</p>
                <p className="text-2xl font-bold text-purple-600">
                  ₹{quotes.length > 0 ? (quotes.reduce((acc, q) => acc + Number(q.totalAmount || 0), 0) / quotes.length).toFixed(0) : 0}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by RFQ</label>
          <select
            value={selectedRFQ}
            onChange={(e) => setSelectedRFQ(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {uniqueRFQs.map(rfq => (
              <option key={rfq} value={rfq}>{rfq}</option>
            ))}
          </select>
        </div>

        {/* Quotes by RFQ */}
        <div className="space-y-8">
          {Object.values(groupedByRFQ).length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-2 text-gray-500">No quotes found</p>
            </div>
          ) : (
            Object.values(groupedByRFQ).map(({ rfq, quotes: rfqQuotes }) => (
              <div key={rfq.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">{rfq.title}</h3>
                  <p className="text-sm text-gray-600">RFQ: {rfq.rfqNumber} • {rfqQuotes.length} quotes received</p>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {rfqQuotes.map((quote) => (
                      <div
                        key={quote.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => setSelectedQuote(quote)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{quote.vendor.name}</h4>
                            <p className="text-xs text-gray-500">{quote.vendor.email}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(quote.status)}`}>
                            {quote.status}
                          </span>
                        </div>
                        
                        <div className="mb-3">
                          <div className="text-2xl font-bold text-green-600">₹{Number(quote.totalAmount || 0).toLocaleString()}</div>
                          <p className="text-xs text-gray-500">Total Amount</p>
                        </div>

                        <div className="space-y-1 mb-3">
                          {(quote.items || []).slice(0, 2).map((item) => (
                            <div key={item.id} className="text-xs text-gray-600">
                              • {item.item?.name || 'Item'}: ₹{Number(item.unitPrice || 0).toLocaleString()} × {item.quantity}
                            </div>
                          ))}
                          {(quote.items?.length || 0) > 2 && (
                            <div className="text-xs text-gray-500">+{(quote.items?.length || 0) - 2} more items</div>
                          )}
                        </div>

                        <div className="text-xs text-gray-500 mb-3">
                          Valid until: {new Date(quote.validUntil).toLocaleDateString()}
                        </div>

                        {quote.status === 'PENDING' && (
                          <div className="flex gap-2 pt-3 border-t border-gray-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate(quote.id, 'ACCEPTED');
                              }}
                              className="flex-1 px-3 py-1.5 bg-green-50 text-green-600 rounded text-xs font-medium hover:bg-green-100"
                            >
                              Accept
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate(quote.id, 'REJECTED');
                              }}
                              className="flex-1 px-3 py-1.5 bg-red-50 text-red-600 rounded text-xs font-medium hover:bg-red-100"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Price Comparison */}
                  {rfqQuotes.length > 1 && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Price Comparison</h4>
                      <div className="flex items-end gap-2 h-32">
                        {rfqQuotes.map((quote) => {
                          const maxAmount = Math.max(...rfqQuotes.map(q => Number(q.totalAmount || 0)));
                          const height = maxAmount > 0 ? (Number(quote.totalAmount || 0) / maxAmount) * 100 : 0;
                          return (
                            <div key={quote.id} className="flex-1 flex flex-col items-center">
                              <div className="w-full bg-blue-100 rounded-t relative" style={{ height: `${height}%` }}>
                                <div className="absolute -top-6 left-0 right-0 text-center text-xs font-semibold text-gray-900">
                                  ₹{(Number(quote.totalAmount || 0) / 1000).toFixed(1)}k
                                </div>
                              </div>
                              <div className="mt-2 text-xs text-gray-600 text-center truncate w-full">
                                {quote.vendor.name}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quote Details Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedQuote.vendor.name}</h2>
                <p className="text-sm text-gray-600">{selectedQuote.rfq.title}</p>
              </div>
              <button
                onClick={() => setSelectedQuote(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-green-600">₹{Number(selectedQuote.totalAmount || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedQuote.status)}`}>
                    {selectedQuote.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valid Until</p>
                  <p className="text-sm font-medium text-gray-900">{new Date(selectedQuote.validUntil).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Submitted On</p>
                  <p className="text-sm font-medium text-gray-900">{new Date(selectedQuote.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Items</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(selectedQuote.items || []).map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.item?.name || 'Item'}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{item.quantity} {item.item?.unit || ''}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">₹{Number(item.unitPrice || 0).toLocaleString()}</td>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">₹{Number(item.totalPrice || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedQuote.notes && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">{selectedQuote.notes}</p>
                </div>
              )}

              {selectedQuote.status === 'PENDING' && (
                <div className="flex gap-4">
                  <button
                    onClick={() => handleStatusUpdate(selectedQuote.id, 'ACCEPTED')}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    Accept Quote
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedQuote.id, 'REJECTED')}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                  >
                    Reject Quote
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
