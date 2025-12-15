'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { quotesApi, rfqsApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Plus, Search, Eye, CheckCircle, TrendingDown, Building2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'

export default function QuotesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewingQuote, setViewingQuote] = useState<any>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: quotes, isLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => quotesApi.getAll().then(res => res.data),
  })

  const filteredQuotes = quotes?.filter((quote: any) =>
    quote.rfq?.rfqNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.vendor?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const colors: any = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded ${colors[status] || colors.PENDING}`}>
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
          <h1 className="text-3xl font-bold text-gray-900">Vendor Quotes</h1>
          <p className="text-gray-500 mt-1">Review and compare vendor quotations</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Quote
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search quotes by RFQ number or vendor name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Quotes Table */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RFQ Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valid Until</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredQuotes?.map((quote: any) => (
                  <tr key={quote.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">{quote.rfq?.rfqNumber}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{quote.vendor?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-900">{formatCurrency(quote.totalAmount)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {format(new Date(quote.validUntil), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(quote.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setViewingQuote(quote)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {filteredQuotes?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No quotes found</p>
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <CreateQuoteModal onClose={() => setIsModalOpen(false)} />
      )}

      {/* View Modal */}
      {viewingQuote && (
        <ViewQuoteModal quote={viewingQuote} onClose={() => setViewingQuote(null)} />
      )}
    </div>
  )
}

function CreateQuoteModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    rfqId: '',
    vendorId: '',
    validUntil: format(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    items: [{ rfqItemId: '', unitPrice: '', gst: '18' }],
  })
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: rfqs } = useQuery({
    queryKey: ['rfqs'],
    queryFn: () => rfqsApi.getAll().then(res => res.data),
  })

  const selectedRFQ = rfqs?.find((r: any) => r.id === formData.rfqId)

  const mutation = useMutation({
    mutationFn: (data: any) => quotesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
      toast({ title: 'Quote created successfully' })
      onClose()
    },
    onError: () => {
      toast({ title: 'Failed to create quote', variant: 'destructive' })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({
      rfqId: formData.rfqId,
      vendorId: formData.vendorId,
      validUntil: new Date(formData.validUntil).toISOString(),
      items: formData.items.map(item => ({
        rfqItemId: item.rfqItemId,
        unitPrice: parseFloat(item.unitPrice),
        gst: parseFloat(item.gst),
      })),
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Add Vendor Quote</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Select RFQ</label>
            <select
              required
              value={formData.rfqId}
              onChange={(e) => setFormData({ ...formData, rfqId: e.target.value, vendorId: '', items: [] })}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select RFQ...</option>
              {rfqs?.filter((r: any) => r.status === 'SENT').map((rfq: any) => (
                <option key={rfq.id} value={rfq.id}>{rfq.rfqNumber}</option>
              ))}
            </select>
          </div>

          {selectedRFQ && (
            <div>
              <label className="block text-sm font-medium mb-2">Select Vendor</label>
              <select
                required
                value={formData.vendorId}
                onChange={(e) => {
                  const vendorId = e.target.value
                  setFormData({
                    ...formData,
                    vendorId,
                    items: selectedRFQ.items.map((item: any) => ({
                      rfqItemId: item.id,
                      unitPrice: '',
                      gst: '18',
                    }))
                  })
                }}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select vendor...</option>
                {selectedRFQ.rfqVendors?.map((rv: any) => (
                  <option key={rv.vendor.id} value={rv.vendor.id}>
                    {rv.vendor.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {formData.vendorId && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Valid Until</label>
                <Input
                  required
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Item Pricing</label>
                <div className="space-y-3">
                  {formData.items.map((item, index) => {
                    const rfqItem = selectedRFQ?.items.find((i: any) => i.id === item.rfqItemId)
                    return (
                      <div key={index} className="p-3 border rounded-md">
                        <p className="font-medium mb-2">{rfqItem?.item?.name}</p>
                        <p className="text-sm text-gray-600 mb-3">Quantity: {rfqItem?.quantity} {rfqItem?.item?.unit}</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Unit Price (₹)</label>
                            <Input
                              required
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={item.unitPrice}
                              onChange={(e) => {
                                const newItems = [...formData.items]
                                newItems[index].unitPrice = e.target.value
                                setFormData({ ...formData, items: newItems })
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">GST %</label>
                            <Input
                              required
                              type="number"
                              step="0.01"
                              value={item.gst}
                              onChange={(e) => {
                                const newItems = [...formData.items]
                                newItems[index].gst = e.target.value
                                setFormData({ ...formData, items: newItems })
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={!formData.vendorId}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              Create Quote
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

function ViewQuoteModal({ quote, onClose }: { quote: any; onClose: () => void }) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const approveMutation = useMutation({
    mutationFn: () => quotesApi.approve(quote.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
      toast({ title: 'Quote approved successfully' })
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
      <Card className="w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Quote Details</h2>
          {quote.status === 'PENDING' && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">Pending</span>
          )}
          {quote.status === 'APPROVED' && (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">Approved</span>
          )}
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">RFQ Number</p>
              <p className="font-semibold">{quote.rfq?.rfqNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Vendor</p>
              <p className="font-semibold">{quote.vendor?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Valid Until</p>
              <p className="font-semibold">{format(new Date(quote.validUntil), 'MMM dd, yyyy')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="font-semibold text-lg">{formatCurrency(quote.totalAmount)}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Items</h3>
            <div className="space-y-2">
              {quote.items?.map((item: any) => (
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
        </div>

        <div className="flex gap-3 pt-6 mt-6 border-t">
          {quote.status === 'PENDING' && (
            <Button
              onClick={() => approveMutation.mutate()}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve Quote
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
