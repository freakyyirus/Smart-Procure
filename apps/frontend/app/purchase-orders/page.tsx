'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface PurchaseOrder {
  id: string;
  poNumber: string;
  rfqId?: string;
  quoteId?: string;
  quote?: {
    id: string;
    rfq?: {
      rfqNumber: string;
      title: string;
    };
  };
  vendor: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  lineItems?: Array<{
    id: string;
    item: {
      name: string;
      unit: string;
    };
    quantity: number;
    unitPrice: number;
    totalAmount: number;
  }>;
  _count?: {
    lineItems: number;
  };
  totalAmount: number;
  grandTotal?: number;
  expectedDeliveryDate?: string;
  deliveryAddress?: string;
  terms?: string;
  status: string;
  createdAt: string;
}

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('All');

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const fetchPurchaseOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('http://localhost:3001/api/purchase-orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPurchaseOrders(data);
      } else if (response.status === 401) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to fetch purchase orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (poId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/purchase-orders/${poId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        alert(`PO status updated to ${status}!`);
        fetchPurchaseOrders();
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const downloadPDF = async (poId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/purchase-orders/${poId}/pdf`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PO-${poId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        alert('PDF downloaded!');
      } else {
        alert('Failed to download PDF');
      }
    } catch (error) {
      alert('Failed to download PDF');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'SENT': return 'bg-blue-100 text-blue-800';
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'IN_TRANSIT': return 'bg-yellow-100 text-yellow-800';
      case 'DELIVERED': return 'bg-purple-100 text-purple-800';
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPOs = selectedStatus === 'All' 
    ? purchaseOrders 
    : purchaseOrders.filter(po => po.status === selectedStatus);

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
          <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="mt-2 text-sm text-gray-600">Track and manage your purchase orders</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-xs text-gray-600">Total</p>
            <p className="text-xl font-bold text-gray-900">{purchaseOrders.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-xs text-gray-600">Draft</p>
            <p className="text-xl font-bold text-gray-600">{purchaseOrders.filter(p => p.status === 'DRAFT').length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-xs text-gray-600">Sent</p>
            <p className="text-xl font-bold text-blue-600">{purchaseOrders.filter(p => p.status === 'SENT').length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-xs text-gray-600">Confirmed</p>
            <p className="text-xl font-bold text-green-600">{purchaseOrders.filter(p => p.status === 'CONFIRMED').length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-xs text-gray-600">In Transit</p>
            <p className="text-xl font-bold text-yellow-600">{purchaseOrders.filter(p => p.status === 'IN_TRANSIT').length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-xs text-gray-600">Delivered</p>
            <p className="text-xl font-bold text-purple-600">{purchaseOrders.filter(p => p.status === 'DELIVERED').length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-xs text-gray-600">Total Value</p>
            <p className="text-xl font-bold text-emerald-600">
              ₹{(purchaseOrders.reduce((acc, po) => acc + Number(po.totalAmount || 0), 0) / 1000).toFixed(0)}k
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {['All', 'DRAFT', 'SENT', 'CONFIRMED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED'].map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Purchase Orders List */}
        <div className="space-y-4">
          {filteredPOs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-2 text-gray-500">No purchase orders found</p>
            </div>
          ) : (
            filteredPOs.map((po) => (
              <div
                key={po.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedPO(po)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{po.poNumber}</h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(po.status)}`}>
                        {po.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{po.quote?.rfq?.title || `PO for ${po.vendor.name}`}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Vendor</p>
                        <p className="font-medium text-gray-900">{po.vendor.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Total Amount</p>
                        <p className="font-bold text-green-600">₹{Number(po.grandTotal || po.totalAmount || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Items</p>
                        <p className="font-medium text-gray-900">{po._count?.lineItems || po.lineItems?.length || 0} items</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Delivery Date</p>
                        <p className="font-medium text-gray-900">{po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString() : 'TBD'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex lg:flex-col gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadPDF(po.id);
                      }}
                      className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center gap-2 justify-center"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      PDF
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPO(po);
                      }}
                      className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* PO Details Modal */}
      {selectedPO && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full my-8">
            <div className="p-6 border-b border-gray-200 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedPO.poNumber}</h2>
                <p className="text-sm text-gray-600">{selectedPO.quote?.rfq?.title || `Purchase Order for ${selectedPO.vendor.name}`}</p>
              </div>
              <button
                onClick={() => setSelectedPO(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Status and Quick Actions */}
              <div className="mb-6 flex items-center justify-between">
                <span className={`px-4 py-2 text-sm font-medium rounded-full ${getStatusColor(selectedPO.status)}`}>
                  {selectedPO.status.replace('_', ' ')}
                </span>
                <div className="flex gap-2">
                  {selectedPO.status === 'DRAFT' && (
                    <button
                      onClick={() => handleStatusUpdate(selectedPO.id, 'SENT')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Send to Vendor
                    </button>
                  )}
                  {selectedPO.status === 'SENT' && (
                    <button
                      onClick={() => handleStatusUpdate(selectedPO.id, 'CONFIRMED')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      Mark Confirmed
                    </button>
                  )}
                  {selectedPO.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleStatusUpdate(selectedPO.id, 'IN_TRANSIT')}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
                    >
                      In Transit
                    </button>
                  )}
                  {selectedPO.status === 'IN_TRANSIT' && (
                    <button
                      onClick={() => handleStatusUpdate(selectedPO.id, 'DELIVERED')}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                    >
                      Mark Delivered
                    </button>
                  )}
                  {selectedPO.status === 'DELIVERED' && (
                    <button
                      onClick={() => handleStatusUpdate(selectedPO.id, 'COMPLETED')}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>

              {/* Vendor Details */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Vendor Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Name</p>
                    <p className="font-medium text-gray-900">{selectedPO.vendor.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{selectedPO.vendor.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">{selectedPO.vendor.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Address</p>
                    <p className="font-medium text-gray-900">{selectedPO.vendor.address}</p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(selectedPO.lineItems || []).map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.item?.name || 'Item'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{item.quantity} {item.item?.unit || ''}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">₹{Number(item.unitPrice || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">₹{Number(item.totalAmount || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50">
                        <td colSpan={3} className="px-4 py-3 text-sm font-bold text-gray-900 text-right">Total Amount</td>
                        <td className="px-4 py-3 text-lg font-bold text-green-600">₹{Number(selectedPO.grandTotal || selectedPO.totalAmount || 0).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Delivery & Terms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Delivery Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-600">Delivery Date</p>
                      <p className="font-medium text-gray-900">{selectedPO.expectedDeliveryDate ? new Date(selectedPO.expectedDeliveryDate).toLocaleDateString() : 'To be determined'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Delivery Address</p>
                      <p className="font-medium text-gray-900">{selectedPO.deliveryAddress || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Terms & Conditions</h3>
                  <p className="text-sm text-gray-700">{selectedPO.terms || 'Standard terms apply'}</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-4">
              <button
                onClick={() => downloadPDF(selectedPO.id)}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </button>
              <button
                onClick={() => setSelectedPO(null)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
