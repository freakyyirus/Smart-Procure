'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import { api } from '@/lib/api';

interface Vendor {
  id: string;
  name: string;
}

interface Message {
  id: string;
  role: 'USER' | 'VENDOR' | 'AI_SUGGESTION';
  content: string;
  isAiGenerated: boolean;
  isEdited: boolean;
  originalContent: string | null;
  sentAt: string | null;
  createdAt: string;
}

interface Session {
  id: string;
  vendorId: string;
  currentPrice: number;
  targetPrice: number | null;
  aiSuggestedPrice: number | null;
  status: 'ACTIVE' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  messages: Message[];
  createdAt: string;
}

interface Suggestion {
  suggestedMessage: string;
  suggestedPrice: number | null;
  strategy: string;
  confidence: number;
}

export default function NegotiationPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [editedMessage, setEditedMessage] = useState('');
  const [newVendorId, setNewVendorId] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [vendorResponse, setVendorResponse] = useState('');
  const [loading, setLoading] = useState(true);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const [vendorsRes, sessionsRes] = await Promise.all([
        api.get('/vendors'),
        api.get('/ai/negotiations'),
      ]);
      setVendors(vendorsRes.data);
      setSessions(sessionsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  const handleStartSession = async () => {
    if (!newVendorId || !currentPrice) return;

    try {
      const res = await api.post('/ai/negotiation/start', {
        vendorId: newVendorId,
        currentPrice: parseFloat(currentPrice),
        targetPrice: targetPrice ? parseFloat(targetPrice) : undefined,
      });
      const sessionRes = await api.get(`/ai/negotiation/${res.data.id}`);
      setActiveSession(sessionRes.data);
      setNewVendorId('');
      setCurrentPrice('');
      setTargetPrice('');
      fetchData();
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const handleGetSuggestion = async () => {
    if (!activeSession) return;

    setSuggestLoading(true);
    try {
      const res = await api.post(`/ai/negotiation/${activeSession.id}/suggest`, {});
      setSuggestion(res.data);
      setEditedMessage(res.data.suggestedMessage);
    } catch (error) {
      console.error('Failed to get suggestion:', error);
    } finally {
      setSuggestLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!activeSession || !editedMessage.trim()) return;

    try {
      await api.post(`/ai/negotiation/${activeSession.id}/message`, {
        role: 'USER',
        content: editedMessage,
        isEdited: suggestion && editedMessage !== suggestion.suggestedMessage,
        originalContent: suggestion?.suggestedMessage,
      });
      
      const sessionRes = await api.get(`/ai/negotiation/${activeSession.id}`);
      setActiveSession(sessionRes.data);
      setEditedMessage('');
      setSuggestion(null);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleAddVendorResponse = async () => {
    if (!activeSession || !vendorResponse.trim()) return;

    try {
      await api.post(`/ai/negotiation/${activeSession.id}/message`, {
        role: 'VENDOR',
        content: vendorResponse,
      });
      
      const sessionRes = await api.get(`/ai/negotiation/${activeSession.id}`);
      setActiveSession(sessionRes.data);
      setVendorResponse('');
    } catch (error) {
      console.error('Failed to add vendor response:', error);
    }
  };

  const handleUpdateStatus = async (status: 'ACCEPTED' | 'REJECTED' | 'CANCELLED') => {
    if (!activeSession) return;

    try {
      await api.put(`/ai/negotiation/${activeSession.id}/status`, { status });
      const sessionRes = await api.get(`/ai/negotiation/${activeSession.id}`);
      setActiveSession(sessionRes.data);
      fetchData();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'CANCELLED':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  const getVendorName = (vendorId: string) => {
    return vendors.find(v => v.id === vendorId)?.name || 'Unknown Vendor';
  };

  return (
    <AppLayout>
      <div className="h-[calc(100vh-8rem)] flex gap-6">
        {/* Sessions Sidebar */}
        <div className="w-80 flex-shrink-0 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 flex flex-col">
          <div className="p-4 border-b border-slate-200/50 dark:border-slate-700/50">
            <h2 className="font-semibold text-slate-900 dark:text-white">Negotiation Sessions</h2>
          </div>

          {/* New Session Form */}
          <div className="p-4 border-b border-slate-200/50 dark:border-slate-700/50 space-y-3">
            <select
              value={newVendorId}
              onChange={(e) => setNewVendorId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm"
            >
              <option value="">Select Vendor</option>
              {vendors.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Current Price (₹)"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm"
            />
            <input
              type="number"
              placeholder="Target Price (₹) - Optional"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm"
            />
            <button
              onClick={handleStartSession}
              disabled={!newVendorId || !currentPrice}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              Start Negotiation
            </button>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={async () => {
                  const res = await api.get(`/ai/negotiation/${session.id}`);
                  setActiveSession(res.data);
                  setSuggestion(null);
                  setEditedMessage('');
                }}
                className={`w-full p-4 text-left border-b border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                  activeSession?.id === session.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-900 dark:text-white text-sm">
                    {getVendorName(session.vendorId)}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(session.status)}`}>
                    {session.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  ₹{session.currentPrice.toLocaleString()}
                  {session.targetPrice && ` → ₹${session.targetPrice.toLocaleString()}`}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 flex flex-col">
          {activeSession ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-white">
                    {getVendorName(activeSession.vendorId)}
                  </h2>
                  <p className="text-sm text-slate-500">
                    Current: ₹{activeSession.currentPrice.toLocaleString()}
                    {activeSession.targetPrice && ` | Target: ₹${activeSession.targetPrice.toLocaleString()}`}
                    {activeSession.aiSuggestedPrice && ` | AI Suggested: ₹${activeSession.aiSuggestedPrice.toLocaleString()}`}
                  </p>
                </div>
                {activeSession.status === 'ACTIVE' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateStatus('ACCEPTED')}
                      className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('REJECTED')}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeSession.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'USER' ? 'justify-end' : msg.role === 'AI_SUGGESTION' ? 'justify-center' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md px-4 py-3 rounded-2xl ${
                        msg.role === 'USER'
                          ? 'bg-blue-500 text-white'
                          : msg.role === 'AI_SUGGESTION'
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 italic'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                      }`}
                    >
                      {msg.role === 'AI_SUGGESTION' && (
                        <p className="text-xs font-medium mb-1">AI Suggestion</p>
                      )}
                      <p className="text-sm">{msg.content}</p>
                      {msg.isEdited && (
                        <p className="text-xs opacity-70 mt-1">Edited from AI suggestion</p>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              {activeSession.status === 'ACTIVE' && (
                <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50 space-y-4">
                  {/* Vendor Response Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter vendor's response..."
                      value={vendorResponse}
                      onChange={(e) => setVendorResponse(e.target.value)}
                      className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-sm"
                    />
                    <button
                      onClick={handleAddVendorResponse}
                      disabled={!vendorResponse.trim()}
                      className="px-4 py-2 bg-slate-500 text-white rounded-xl text-sm disabled:opacity-50"
                    >
                      Add Response
                    </button>
                  </div>

                  {/* AI Suggestion */}
                  {suggestion && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                          AI Strategy: {suggestion.strategy}
                        </span>
                        <span className="text-xs text-purple-600 dark:text-purple-400">
                          Confidence: {(suggestion.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <textarea
                        value={editedMessage}
                        onChange={(e) => setEditedMessage(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-700 rounded-lg text-sm resize-none"
                      />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleGetSuggestion}
                      disabled={suggestLoading}
                      className="px-4 py-2 bg-purple-500 text-white rounded-xl text-sm disabled:opacity-50"
                    >
                      {suggestLoading ? 'Thinking...' : '✨ Get AI Suggestion'}
                    </button>
                    {suggestion && (
                      <button
                        onClick={handleSendMessage}
                        disabled={!editedMessage.trim()}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm disabled:opacity-50"
                      >
                        Send Message
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="font-medium">Select or start a negotiation</p>
                <p className="text-sm mt-1">Use AI to craft persuasive messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
