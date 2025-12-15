'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { itemsApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Plus, Search, Edit2, Trash2, Package, Ruler, Tag } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function ItemsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: items, isLoading } = useQuery({
    queryKey: ['items'],
    queryFn: () => itemsApi.getAll().then(res => res.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => itemsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      toast({ title: 'Item deleted successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to delete item', variant: 'destructive' })
    },
  })

  const filteredItems = items?.filter((item: any) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.hsn.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Items Catalog</h1>
          <p className="text-gray-500 mt-1">Manage your procurement items</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search items by name or HSN code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Items Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems?.map((item: any) => (
            <Card key={item.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{item.name}</h3>
                </div>
                <div className="flex gap-2 ml-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Tag className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="font-mono">{item.hsn}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Ruler className="w-4 h-4 mr-2 text-gray-400" />
                  {item.unit}
                </div>
                {item.description && (
                  <div className="flex items-start text-sm text-gray-600">
                    <Package className="w-4 h-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                    <span className="line-clamp-3">{item.description}</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {filteredItems?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No items found</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <ItemModal
          item={editingItem}
          onClose={() => {
            setIsModalOpen(false)
            setEditingItem(null)
          }}
        />
      )}
    </div>
  )
}

function ItemModal({ item, onClose }: { item: any; onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    hsn: item?.hsn || '',
    unit: item?.unit || 'PCS',
    description: item?.description || '',
  })
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: any) => 
      item ? itemsApi.update(item.id, data) : itemsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      toast({ title: `Item ${item ? 'updated' : 'created'} successfully` })
      onClose()
    },
    onError: () => {
      toast({ title: 'Failed to save item', variant: 'destructive' })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(formData)
  }

  const units = ['PCS', 'KG', 'L', 'M', 'BOX', 'SET', 'PAIR', 'DOZEN']

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">
          {item ? 'Edit Item' : 'Add New Item'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Item Name</label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Steel Bars 10mm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">HSN Code</label>
            <Input
              required
              value={formData.hsn}
              onChange={(e) => setFormData({ ...formData, hsn: e.target.value })}
              placeholder="7213"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Unit of Measurement</label>
            <select
              required
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            >
              {units.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional specifications, grade, quality..."
              className="w-full px-3 py-2 border rounded-md resize-none"
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
              {item ? 'Update' : 'Create'}
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
