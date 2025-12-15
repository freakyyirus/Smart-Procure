'use client'

import { useQuery } from '@tanstack/react-query'
import { mandatesApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { Plus, FileCheck, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function MandatesPage() {
  const { toast } = useToast()
  
  const { data: mandates, refetch } = useQuery({
    queryKey: ['mandates'],
    queryFn: () => mandatesApi.getAll().then(res => res.data),
  })

  const handleExecuteMandate = async (mandateId: string) => {
    try {
      const response = await mandatesApi.execute(mandateId)
      
      toast({
        title: response.data.success ? 'Success' : 'Failed',
        description: response.data.message,
        variant: response.data.success ? 'default' : 'destructive',
      })
      
      refetch()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to execute mandate',
        variant: 'destructive',
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />
      case 'ACTIVE':
        return <CheckCircle2 className="w-4 h-4" />
      case 'COMPLETED':
        return <FileCheck className="w-4 h-4" />
      case 'FAILED':
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Mandates</h1>
          <p className="text-gray-500 mt-1">Manage automatic payment agreements with vendors</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Mandate
        </Button>
      </div>

      {/* Info Card */}
      <Card className="mb-6 bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start">
            <div className="p-2 bg-blue-100 rounded-lg mr-4">
              <FileCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                What are Payment Mandates?
              </h3>
              <p className="text-sm text-blue-700">
                Payment mandates are digital agreements between your company and vendors that enable 
                automatic payment deduction on scheduled dates. Both parties must sign digitally to activate.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mandates List */}
      <div className="grid gap-6">
        {mandates && mandates.length > 0 ? (
          mandates.map((mandate: any) => (
            <Card key={mandate.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {mandate.vendor.name}
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      PO: {mandate.po.poNumber} • Mandate: {mandate.mandateNumber}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(mandate.mandateStatus)}`}>
                      {getStatusIcon(mandate.mandateStatus)}
                      {mandate.mandateStatus}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="text-xl font-bold text-primary">
                      {formatCurrency(mandate.totalAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Due Date</p>
                    <p className="font-semibold">{formatDate(mandate.dueDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Installments</p>
                    <p className="font-semibold">{mandate.installments}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Auto-Deduct</p>
                    <p className="font-semibold">
                      {mandate.autoDeductEnabled ? '✓ Enabled' : '✗ Disabled'}
                    </p>
                  </div>
                </div>

                {/* Signature Status */}
                <div className="flex gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Vendor Signature</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {mandate.signedByVendorAt 
                        ? `✓ Signed on ${formatDate(mandate.signedByVendorAt)}`
                        : '⏳ Pending'}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Company Signature</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {mandate.signedByCompanyAt 
                        ? `✓ Signed on ${formatDate(mandate.signedByCompanyAt)}`
                        : '⏳ Pending'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">View Details</Button>
                  
                  {mandate.mandateStatus === 'VENDOR_SIGNED' && (
                    <Button size="sm">
                      Sign as Company
                    </Button>
                  )}
                  
                  {mandate.mandateStatus === 'ACTIVE' && (
                    <Button 
                      size="sm" 
                      variant="default"
                      onClick={() => handleExecuteMandate(mandate.id)}
                    >
                      Execute Payment
                    </Button>
                  )}
                  
                  {mandate.mandateStatus === 'COMPLETED' && mandate.executedAt && (
                    <p className="text-sm text-green-600 flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Completed on {formatDate(mandate.executedAt)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <FileCheck className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No mandates yet</h3>
              <p className="text-gray-500 mb-4">
                Create your first payment mandate to automate vendor payments
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Mandate
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
