'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Vendor {
  id: string;
  name: string;
  email: string;
}

interface Item {
  id: string;
  name: string;
  unit: string;
  estimatedPrice: number;
}

interface RFQItem {
  itemId: string;
  quantity: number;
  specifications: string;
}

interface RFQ {
  id: string;
  rfqNumber: string;
  title: string;
  description: string;
  deadline: string;
  status: string;
  items: Array<{
    id: string;
    item: Item;
    quantity: number;
    specifications: string;
  }>;
  vendors: Array<{
    id: string;
    vendor: Vendor;
  }>;
  createdAt: string;
}

export default function RFQsPage() {
  const router = useRouter();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('All');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    selectedVendors: [] as string[],
    rfqItems: [] as RFQItem[],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const [rfqsRes, vendorsRes, itemsRes] = await Promise.all([
        fetch('http://localhost:3001/api/rfqs', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('http://localhost:3001/api/vendors', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('http://localhost:3001/api/items', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (rfqsRes.ok) setRfqs(await rfqsRes.json());
      if (vendorsRes.ok) setVendors(await vendorsRes.json());
      if (itemsRes.ok) setItems(await itemsRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.selectedVendors.length === 0) {
      alert('Please select at least one vendor');
      return;
    }

    if (formData.rfqItems.length === 0) {
      alert('Please add at least one item');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/rfqs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          deadline: new Date(formData.deadline).toISOString(),
          vendorIds: formData.selectedVendors,
          items: formData.rfqItems,
        }),
      });

      if (response.ok) {
        alert('RFQ created and sent to vendors!');
        fetchData();
        closeModal();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create RFQ');
      }
    } catch (error) {
      alert('Failed to create RFQ');
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      rfqItems: [...formData.rfqItems, { itemId: '', quantity: 1, specifications: '' }],
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      rfqItems: formData.rfqItems.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, field: keyof RFQItem, value: any) => {
    const updatedItems = [...formData.rfqItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormData({ ...formData, rfqItems: updatedItems });
  };

  const toggleVendor = (vendorId: string) => {
    const isSelected = formData.selectedVendors.includes(vendorId);
    setFormData({
      ...formData,
      selectedVendors: isSelected
        ? formData.selectedVendors.filter(id => id !== vendorId)
        : [...formData.selectedVendors, vendorId],
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      title: '',
      description: '',
      deadline: '',
      selectedVendors: [],
      rfqItems: [],
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'SENT': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRfqs = selectedTab === 'All' 
    ? rfqs 
    : rfqs.filter(rfq => rfq.status === selectedTab);

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
          <h1 className="text-3xl font-bold text-gray-900">Request for Quotations (RFQ)</h1>
          <p className="mt-2 text-sm text-gray-600">Create and manage procurement requests</p>
        </div>

        {/* Stats and Action */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600">Total RFQs</p>
              <p className="text-2xl font-bold text-gray-900">{rfqs.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-blue-600">{rfqs.filter(r => r.status === 'SENT' || r.status === 'IN_PROGRESS').length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{rfqs.filter(r => r.status === 'COMPLETED').length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600">Draft</p>
              <p className="text-2xl font-bold text-gray-600">{rfqs.filter(r => r.status === 'DRAFT').length}</p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 justify-center px-6 py-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create RFQ
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          {['All', 'DRAFT', 'SENT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 font-medium transition-colors ${
                selectedTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* RFQs List */}
        <div className="space-y-4">
          {filteredRfqs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-2 text-gray-500">No RFQs found</p>
            </div>
          ) : (
            filteredRfqs.map((rfq) => (
              <div key={rfq.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{rfq.title}</h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(rfq.status)}`}>
                        {rfq.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{rfq.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {rfq.rfqNumber}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Deadline: {new Date(rfq.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Items ({rfq.items.length})</p>
                    <div className="space-y-1">
                      {rfq.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="text-sm text-gray-600 flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                          {item.item.name} - {item.quantity} {item.item.unit}
                        </div>
                      ))}
                      {rfq.items.length > 3 && (
                        <p className="text-sm text-gray-500">+{rfq.items.length - 3} more...</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Vendors ({rfq.vendors.length})</p>
                    <div className="space-y-1">
                      {rfq.vendors.slice(0, 3).map((v) => (
                        <div key={v.id} className="text-sm text-gray-600 flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                          {v.vendor.name}
                        </div>
                      ))}
                      {rfq.vendors.length > 3 && (
                        <p className="text-sm text-gray-500">+{rfq.vendors.length - 3} more...</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                  <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                    View Details
                  </button>
                  <button className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium">
                    View Quotes
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create RFQ Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full my-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Create New RFQ</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Basic Info */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    RFQ Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Office Furniture Procurement Q1 2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe the purpose and requirements..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deadline *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Select Vendors */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Vendors * ({formData.selectedVendors.length} selected)
                </label>
                <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                  {vendors.map((vendor) => (
                    <label key={vendor.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.selectedVendors.includes(vendor.id)}
                        onChange={() => toggleVendor(vendor.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{vendor.name}</p>
                        <p className="text-xs text-gray-500">{vendor.email}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Add Items */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Items * ({formData.rfqItems.length})
                  </label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    + Add Item
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.rfqItems.map((rfqItem, index) => (
                    <div key={index} className="border border-gray-300 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Item</label>
                          <select
                            required
                            value={rfqItem.itemId}
                            onChange={(e) => updateItem(index, 'itemId', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select item...</option>
                            {items.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name} ({item.unit})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Quantity</label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={rfqItem.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Specifications</label>
                          <input
                            type="text"
                            required
                            value={rfqItem.specifications}
                            onChange={(e) => updateItem(index, 'specifications', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter specs..."
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="mt-2 text-xs text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create & Send RFQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
