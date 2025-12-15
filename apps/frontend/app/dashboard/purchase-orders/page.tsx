'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { posApi, quotesApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Plus, Search, Eye, Download, FileText, Building2, Calendar, Send } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'

export default function PurchaseOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewingPO, setViewingPO] = useState<any>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: pos, isLoading } = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: () => posApi.getAll().then(res => res.data),
  })

  const filteredPOs = pos?.filter((po: any) =>
    po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    po.vendor?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const colors: any = {
      DRAFT: 'bg-gray-100 text-gray-800',
      ISSUED: 'bg-blue-100 text-blue-800',
      RECEIVED: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-purple-100 text-purple-800',
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded ${colors[status] || colors.DRAFT}`}>
        {status}
      </span>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-gray-500 mt-1">Issue and track purchase orders</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          Create PO
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search POs by number or vendor name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* POs Table */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivery Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredPOs?.map((po: any) => (
                  <tr key={po.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-indigo-500 mr-2" />
                        <span className="font-medium text-gray-900">{po.poNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{po.vendor?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-900">{formatCurrency(po.totalAmount)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {format(new Date(po.deliveryDate), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(po.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewingPO(po)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        {po.status !== 'DRAFT' && (
                          <Button
                            size="sm"
                            variant="outline"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {filteredPOs?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No purchase orders found</p>
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <CreatePOModal onClose={() => setIsModalOpen(false)} />
      )}

      {/* View Modal */}
      {viewingPO && (
        <ViewPOModal po={viewingPO} onClose={() => setViewingPO(null)} />
      )}
    </div>
  )
}

function CreatePOModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    quoteId: '',
    deliveryDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    deliveryAddress: '',
    terms: 'Payment within 30 days of delivery',
  })
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: quotes } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => quotesApi.getAll().then(res => res.data),
  })

  const approvedQuotes = quotes?.filter((q: any) => q.status === 'APPROVED')

  const mutation = useMutation({
    mutationFn: (data: any) => posApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      toast({ title: 'Purchase Order created successfully' })
      onClose()
    },
    onError: () => {
      toast({ title: 'Failed to create PO', variant: 'destructive' })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({
      quoteId: formData.quoteId,
      deliveryDate: new Date(formData.deliveryDate).toISOString(),
      deliveryAddress: formData.deliveryAddress,
      terms: formData.terms,
    })
  }

  const selectedQuote = approvedQuotes?.find((q: any) => q.id === formData.quoteId)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Create Purchase Order</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Select Approved Quote</label>
            <select
              required
              value={formData.quoteId}
              onChange={(e) => setFormData({ ...formData, quoteId: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select quote...</option>
              {approvedQuotes?.map((quote: any) => (
                <option key={quote.id} value={quote.id}>
                  {quote.rfq?.rfqNumber} - {quote.vendor?.name} - ₹{Number(quote.totalAmount || 0).toFixed(2)}
                </option>
              ))}
            </select>
            {approvedQuotes?.length === 0 && (
              <p className="text-sm text-amber-600 mt-1">No approved quotes available. Please approve a quote first.</p>
            )}
          </div>

          {selectedQuote && (
            <>
              <div className="p-4 bg-blue-50 rounded-md">
                <h3 className="font-semibold mb-2">Quote Summary</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Vendor:</span>
                    <span className="ml-2 font-medium">{selectedQuote.vendor?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="ml-2 font-medium">₹{Number(selectedQuote.totalAmount || 0).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Items:</span>
                    <span className="ml-2 font-medium">{selectedQuote.items?.length}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Delivery Date</label>
                <Input
                  required
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Delivery Address</label>
                <textarea
                  required
                  value={formData.deliveryAddress}
                  onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                  placeholder="Street, City, State, PIN"
                  className="w-full px-3 py-2 border rounded-md resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Terms & Conditions</label>
                <textarea
                  required
                  value={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md resize-none"
                  rows={4}
                />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={!formData.quoteId}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              Create Purchase Order
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

function ViewPOModal({ po, onClose }: { po: any; onClose: () => void }) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const issueMutation = useMutation({
    mutationFn: () => posApi.send(po.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      toast({ title: 'Purchase Order issued successfully' })
      onClose()
    },
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Purchase Order</h2>
          {getStatusBadge(po.status)}
        </div>

        <div className="space-y-6">
          {/* Header */}
          <div className="grid grid-cols-2 gap-6 pb-6 border-b">
            <div>
              <p className="text-sm text-gray-500">PO Number</p>
              <p className="text-xl font-bold">{po.poNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Delivery Date</p>
              <p className="text-xl font-bold">{format(new Date(po.deliveryDate), 'MMM dd, yyyy')}</p>
            </div>
          </div>

          {/* Vendor Details */}
          <div>
            <h3 className="font-semibold mb-3">Vendor Details</h3>
            <div className="p-4 bg-gray-50 rounded">
              <p className="font-medium text-lg">{po.vendor?.name}</p>
              <p className="text-sm text-gray-600 mt-1">{po.vendor?.email}</p>
              <p className="text-sm text-gray-600">{po.vendor?.phone}</p>
              <p className="text-sm text-gray-600 mt-2">{po.vendor?.address}</p>
              <p className="text-sm text-gray-600 mt-1">GST: {po.vendor?.gstNumber}</p>
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <h3 className="font-semibold mb-3">Delivery Address</h3>
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-gray-900">{po.deliveryAddress}</p>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="font-semibold mb-3">Items</h3>
            <div className="space-y-2">
              {po.quote?.items?.map((item: any) => (
                <div key={item.id} className="p-4 bg-gray-50 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{item.rfqItem?.item?.name}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.rfqItem?.quantity} {item.rfqItem?.item?.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(item.totalPrice)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm mt-2 pt-2 border-t">
                    <div>
                      <span className="text-gray-500">Unit Price:</span>
                      <span className="ml-1 font-medium">{formatCurrency(item.unitPrice)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">GST:</span>
                      <span className="ml-1 font-medium">{item.gst}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500">GST Amount:</span>
                      <span className="ml-1 font-medium">{formatCurrency(item.gstAmount)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-end pt-4 border-t">
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(po.totalAmount)}</p>
            </div>
          </div>

          {/* Terms */}
          <div>
            <h3 className="font-semibold mb-3">Terms & Conditions</h3>
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-gray-900 whitespace-pre-wrap">{po.terms}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-6 mt-6 border-t">
          {po.status === 'DRAFT' && (
            <Button
              onClick={() => issueMutation.mutate()}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Issue PO to Vendor
            </Button>
          )}
          <Button onClick={onClose} variant="outline" className="flex-1">
            Close
          </Button>
        </div>
      </Card>
    </div>
  )
}

function getStatusBadge(status: string) {
  const colors: any = {
    DRAFT: 'bg-gray-100 text-gray-800',
    ISSUED: 'bg-blue-100 text-blue-800',
    RECEIVED: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-purple-100 text-purple-800',
  }
  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded ${colors[status] || colors.DRAFT}`}>
      {status}
    </span>
  )
}
