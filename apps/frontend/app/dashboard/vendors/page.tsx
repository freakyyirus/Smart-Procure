'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vendorsApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Plus, Search, Edit2, Trash2, Mail, Phone, MapPin } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function VendorsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVendor, setEditingVendor] = useState<any>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: vendors, isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => vendorsApi.getAll().then(res => res.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => vendorsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] })
      toast({ title: 'Vendor deleted successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to delete vendor', variant: 'destructive' })
    },
  })

  const filteredVendors = vendors?.filter((vendor: any) =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (vendor: any) => {
    setEditingVendor(vendor)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this vendor?')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendors</h1>
          <p className="text-gray-500 mt-1">Manage your vendor relationships</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Vendor
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search vendors by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Vendors Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors?.map((vendor: any) => (
            <Card key={vendor.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{vendor.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">GST: {vendor.gstNumber}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(vendor)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(vendor.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  {vendor.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  {vendor.phone}
                </div>
                <div className="flex items-start text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                  <span className="line-clamp-2">{vendor.address}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {filteredVendors?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No vendors found</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <VendorModal
          vendor={editingVendor}
          onClose={() => {
            setIsModalOpen(false)
            setEditingVendor(null)
          }}
        />
      )}
    </div>
  )
}

function VendorModal({ vendor, onClose }: { vendor: any; onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: vendor?.name || '',
    email: vendor?.email || '',
    phone: vendor?.phone || '',
    address: vendor?.address || '',
    gstNumber: vendor?.gstNumber || '',
  })
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: any) => 
      vendor ? vendorsApi.update(vendor.id, data) : vendorsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] })
      toast({ title: `Vendor ${vendor ? 'updated' : 'created'} successfully` })
      onClose()
    },
    onError: () => {
      toast({ title: 'Failed to save vendor', variant: 'destructive' })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">
          {vendor ? 'Edit Vendor' : 'Add New Vendor'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Company Name</label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="ABC Corporation"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="vendor@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <Input
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98765 43210"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">GST Number</label>
            <Input
              required
              value={formData.gstNumber}
              onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
              placeholder="22AAAAA0000A1Z5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Address</label>
            <textarea
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Street, City, State, PIN"
              className="w-full px-3 py-2 border rounded-md resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              {vendor ? 'Update' : 'Create'}
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
