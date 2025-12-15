'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { rfqsApi, vendorsApi, itemsApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Plus, Search, Eye, Send, Calendar, FileText, Building2, Package } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'

export default function RFQsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewingRFQ, setViewingRFQ] = useState<any>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: rfqs, isLoading } = useQuery({
    queryKey: ['rfqs'],
    queryFn: () => rfqsApi.getAll().then(res => res.data),
  })

  const filteredRFQs = rfqs?.filter((rfq: any) =>
    rfq.rfqNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const colors: any = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SENT: 'bg-blue-100 text-blue-800',
      RECEIVED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-red-100 text-red-800',
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded ${colors[status] || colors.DRAFT}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Request for Quotations</h1>
          <p className="text-gray-500 mt-1">Create and manage RFQs to vendors</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Create RFQ
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search RFQs by number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* RFQs Table */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RFQ Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valid Until</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendors</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredRFQs?.map((rfq: any) => (
                  <tr key={rfq.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-purple-500 mr-2" />
                        <span className="font-medium text-gray-900">{rfq.rfqNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {format(new Date(rfq.validUntil), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                        {rfq.rfqVendors?.length || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <Package className="w-4 h-4 mr-2 text-gray-400" />
                        {rfq.items?.length || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(rfq.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setViewingRFQ(rfq)}
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

      {filteredRFQs?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No RFQs found</p>
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <CreateRFQModal onClose={() => setIsModalOpen(false)} />
      )}

      {/* View Modal */}
      {viewingRFQ && (
        <ViewRFQModal rfq={viewingRFQ} onClose={() => setViewingRFQ(null)} />
      )}
    </div>
  )
}

function CreateRFQModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    validUntil: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    vendorIds: [] as string[],
    items: [{ itemId: '', quantity: '' }],
  })
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: vendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => vendorsApi.getAll().then(res => res.data),
  })

  const { data: items } = useQuery({
    queryKey: ['items'],
    queryFn: () => itemsApi.getAll().then(res => res.data),
  })

  const mutation = useMutation({
    mutationFn: (data: any) => rfqsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] })
      toast({ title: 'RFQ created successfully' })
      onClose()
    },
    onError: () => {
      toast({ title: 'Failed to create RFQ', variant: 'destructive' })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({
      validUntil: new Date(formData.validUntil).toISOString(),
      vendorIds: formData.vendorIds,
      items: formData.items.map(item => ({
        itemId: item.itemId,
        quantity: parseInt(item.quantity),
      })),
    })
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { itemId: '', quantity: '' }],
    })
  }

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Create New RFQ</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
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
            <label className="block text-sm font-medium mb-2">Select Vendors (at least 3)</label>
            <div className="border rounded-md p-4 space-y-2 max-h-48 overflow-y-auto">
              {vendors?.map((vendor: any) => (
                <label key={vendor.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={formData.vendorIds.includes(vendor.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, vendorIds: [...formData.vendorIds, vendor.id] })
                      } else {
                        setFormData({ ...formData, vendorIds: formData.vendorIds.filter(id => id !== vendor.id) })
                      }
                    }}
                    className="rounded"
                  />
                  <span>{vendor.name}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Selected: {formData.vendorIds.length} vendor(s)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Items</label>
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <select
                    required
                    value={item.itemId}
                    onChange={(e) => {
                      const newItems = [...formData.items]
                      newItems[index].itemId = e.target.value
                      setFormData({ ...formData, items: newItems })
                    }}
                    className="flex-1 px-3 py-2 border rounded-md"
                  >
                    <option value="">Select item...</option>
                    {items?.map((i: any) => (
                      <option key={i.id} value={i.id}>{i.name}</option>
                    ))}
                  </select>
                  <Input
                    required
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => {
                      const newItems = [...formData.items]
                      newItems[index].quantity = e.target.value
                      setFormData({ ...formData, items: newItems })
                    }}
                    className="w-24"
                  />
                  {formData.items.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeItem(index)}
                      className="text-red-600"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" onClick={addItem} className="mt-3 w-full">
              + Add Item
            </Button>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={formData.vendorIds.length < 3}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              Create RFQ
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

function ViewRFQModal({ rfq, onClose }: { rfq: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">RFQ Details</h2>
          {rfq.status === 'DRAFT' && (
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm">Draft</span>
          )}
          {rfq.status === 'SENT' && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">Sent</span>
          )}
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">RFQ Number</p>
              <p className="font-semibold">{rfq.rfqNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Valid Until</p>
              <p className="font-semibold">{format(new Date(rfq.validUntil), 'MMM dd, yyyy')}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Vendors ({rfq.rfqVendors?.length || 0})</h3>
            <div className="space-y-2">
              {rfq.rfqVendors?.map((rv: any) => (
                <div key={rv.id} className="p-3 bg-gray-50 rounded">
                  <p className="font-medium">{rv.vendor?.name}</p>
                  <p className="text-sm text-gray-600">{rv.vendor?.email}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Items ({rfq.items?.length || 0})</h3>
            <div className="space-y-2">
              {rfq.items?.map((item: any) => (
                <div key={item.id} className="p-3 bg-gray-50 rounded flex justify-between">
                  <div>
                    <p className="font-medium">{item.item?.name}</p>
                    <p className="text-sm text-gray-600">HSN: {item.item?.hsn}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">Qty: {item.quantity}</p>
                    <p className="text-sm text-gray-600">{item.item?.unit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-6 mt-6 border-t">
          <Button onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </Card>
    </div>
  )
}
