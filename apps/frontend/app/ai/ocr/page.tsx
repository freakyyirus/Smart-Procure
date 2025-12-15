'use client';

import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import { api } from '@/lib/api';

interface ExtractedItem {
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

interface Extraction {
  id: string;
  status: 'PENDING' | 'EXTRACTED' | 'APPROVED' | 'FAILED';
  extractedData: {
    items: ExtractedItem[];
    subtotal: number;
    tax: number;
    total: number;
    vendorName: string;
    vendorAddress?: string;
    quoteDate?: string;
    quoteNumber?: string;
    validUntil?: string;
    paymentTerms?: string;
  } | null;
  confidence: number;
  createdAt: string;
}

export default function OCRPage() {
  const [extractions, setExtractions] = useState<Extraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fetchExtractions = useCallback(async () => {
    try {
      const res = await api.get('/ai/ocr/extractions');
      setExtractions(res.data);
    } catch (error) {
      console.error('Failed to fetch extractions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExtractions();
  }, [fetchExtractions]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      await api.post('/ai/ocr/extract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSelectedFile(null);
      setPreviewUrl(null);
      fetchExtractions();
    } catch (error) {
      console.error('Failed to extract:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleApprove = async (extractionId: string) => {
    try {
      await api.put(`/ai/ocr/${extractionId}/approve`);
      fetchExtractions();
    } catch (error) {
      console.error('Failed to approve:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'EXTRACTED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'FAILED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            OCR Quote Extraction
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Upload quote documents to automatically extract structured data using GPT-4 Vision
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-8 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex flex-col items-center justify-center">
            <div className="w-full max-w-xl">
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-56 object-contain rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-12 h-12 text-slate-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-slate-400">
                      PNG, JPG, GIF or PDF (Max 10MB)
                    </p>
                  </div>
                )}
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                />
              </label>

              {selectedFile && (
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {selectedFile.name}
                  </span>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    {uploading ? 'Extracting...' : 'Extract Data'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Extractions List */}
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200/50 dark:border-slate-700/50">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Recent Extractions
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading...</div>
          ) : extractions.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No extractions yet. Upload a quote document to get started.
            </div>
          ) : (
            <div className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
              {extractions.map((extraction) => (
                <div key={extraction.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(extraction.status)}`}>
                          {extraction.status}
                        </span>
                        <span className="text-sm text-slate-500">
                          Confidence: {(Number(extraction.confidence || 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        {new Date(extraction.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {extraction.status === 'EXTRACTED' && (
                      <button
                        onClick={() => handleApprove(extraction.id)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                      >
                        Approve
                      </button>
                    )}
                  </div>

                  {extraction.extractedData && (
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-slate-500">Vendor</p>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {extraction.extractedData.vendorName}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Quote Number</p>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {extraction.extractedData.quoteNumber || '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Quote Date</p>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {extraction.extractedData.quoteDate || '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Total</p>
                          <p className="font-medium text-slate-900 dark:text-white">
                            ₹{extraction.extractedData.total.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-slate-500">
                            <th className="pb-2">Item</th>
                            <th className="pb-2">Qty</th>
                            <th className="pb-2">Unit Price</th>
                            <th className="pb-2">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {extraction.extractedData.items.map((item, idx) => (
                            <tr key={idx} className="border-t border-slate-200/50 dark:border-slate-700/50">
                              <td className="py-2 text-slate-900 dark:text-white">{item.name}</td>
                              <td className="py-2 text-slate-600 dark:text-slate-400">
                                {item.quantity} {item.unit}
                              </td>
                              <td className="py-2 text-slate-600 dark:text-slate-400">
                                ₹{item.unitPrice.toLocaleString()}
                              </td>
                              <td className="py-2 text-slate-900 dark:text-white">
                                ₹{item.totalPrice.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
