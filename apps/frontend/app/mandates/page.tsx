'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';

interface Mandate {
  id: string;
  mandateNumber: string;
  vendor: { name: string; email?: string; phone?: string };
  po: { poNumber: string; status: string };
  totalAmount: number;
  dueDate: string;
  installments: number;
  installmentAmount?: number | null;
  autoDeductEnabled: boolean;
  terms?: string | null;
  bankDetails?: string | null;
  mandateStatus: string;
  createdAt: string;
  signedByVendorAt?: string | null;
  signedByCompanyAt?: string | null;
  executedAt?: string | null;
  failureReason?: string | null;
}

interface PurchaseOrderOption {
  id: string;
  poNumber: string;
  status: string;
  totalAmount: number;
  vendor?: { name: string };
}

export default function MandatesPage() {
  const router = useRouter();
  const [mandates, setMandates] = useState<Mandate[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    poId: '',
    totalAmount: '',
    dueDate: '',
    installments: 1,
    autoDeductEnabled: true,
    terms: '',
    bankDetails: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const [mandatesRes, poRes] = await Promise.all([
        fetch('http://localhost:3001/api/mandates', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:3001/api/purchase-orders', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (mandatesRes.status === 401 || poRes.status === 401) {
        router.push('/login');
        return;
      }

      if (mandatesRes.ok) setMandates(await mandatesRes.json());
      if (poRes.ok) setPurchaseOrders(await poRes.json());
    } catch (error) {
      console.error('Failed to load mandates:', error);
    } finally {
      setLoading(false);
    }
  };

  const availablePOs = useMemo(() => {
    const usedPoIds = new Set(mandates.map((m) => m.po?.poNumber && m.po.poNumber));
    return purchaseOrders.filter((po) => !usedPoIds.has(po.poNumber));
  }, [mandates, purchaseOrders]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.poId || !form.totalAmount || !form.dueDate) {
      alert('Please fill all required fields');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch('http://localhost:3001/api/mandates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          poId: form.poId,
          totalAmount: Number(form.totalAmount),
          dueDate: form.dueDate,
          installments: form.installments,
          autoDeductEnabled: form.autoDeductEnabled,
          terms: form.terms || undefined,
          bankDetails: form.bankDetails || undefined,
        }),
      });

      if (res.ok) {
        alert('Mandate created and sent to vendor');
        setIsModalOpen(false);
        setForm({ poId: '', totalAmount: '', dueDate: '', installments: 1, autoDeductEnabled: true, terms: '', bankDetails: '' });
        loadData();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to create mandate');
      }
    } catch (error) {
      console.error('Create mandate failed:', error);
      alert('Failed to create mandate');
    } finally {
      setSubmitting(false);
    }
  };

  const signVendor = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return router.push('/login');
    try {
      const res = await fetch(`http://localhost:3001/api/mandates/${id}/sign/vendor`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ signature: 'Signed by vendor via portal' }),
      });
      if (res.ok) {
        alert('Vendor signed mandate');
        loadData();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to sign');
      }
    } catch (error) {
      alert('Failed to sign');
    }
  };

  const signCompany = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return router.push('/login');
    try {
      const res = await fetch(`http://localhost:3001/api/mandates/${id}/sign/company`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ signature: 'Approved by company' }),
      });
      if (res.ok) {
        alert('Company approved mandate');
        loadData();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to approve');
      }
    } catch (error) {
      alert('Failed to approve');
    }
  };

  const executeMandate = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return router.push('/login');
    try {
      const res = await fetch(`http://localhost:3001/api/mandates/${id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('Payment executed successfully');
      } else {
        alert(data.message || 'Payment failed');
      }
      loadData();
    } catch (error) {
      alert('Failed to execute payment');
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      PENDING: 'bg-amber-100 text-amber-800',
      VENDOR_SIGNED: 'bg-blue-100 text-blue-800',
      ACTIVE: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-emerald-100 text-emerald-800',
      FAILED: 'bg-red-100 text-red-800',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  const filtered = selectedStatus === 'All' ? mandates : mandates.filter((m) => m.mandateStatus === selectedStatus);

  const stats = useMemo(() => ({
    total: mandates.length,
    pending: mandates.filter((m) => m.mandateStatus === 'PENDING').length,
    active: mandates.filter((m) => m.mandateStatus === 'ACTIVE').length,
    completed: mandates.filter((m) => m.mandateStatus === 'COMPLETED').length,
    value: mandates.reduce((acc, m) => acc + m.totalAmount, 0),
  }), [mandates]);

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Payment Mandates</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Create, sign, and execute mandate-based payments for POs</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadData}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 text-sm font-semibold shadow-sm"
            >
              Refresh
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold shadow-lg hover:shadow-blue-500/30"
            >
              New Mandate
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <StatCard label="Total Mandates" value={stats.total.toString()} accent="blue" />
          <StatCard label="Pending" value={stats.pending.toString()} accent="amber" />
          <StatCard label="Active" value={stats.active.toString()} accent="green" />
          <StatCard label="Completed" value={stats.completed.toString()} accent="emerald" />
          <StatCard label="Total Value" value={`₹${(Number(stats.value || 0) / 1000).toFixed(0)}k`} accent="indigo" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {['All', 'PENDING', 'VENDOR_SIGNED', 'ACTIVE', 'COMPLETED', 'FAILED'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                selectedStatus === status
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white/80 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Mandates List */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="bg-white/80 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center shadow-sm">
              <p className="text-slate-600 dark:text-slate-400">No mandates found</p>
            </div>
          ) : (
            filtered.map((mandate) => (
              <div key={mandate.id} className="bg-white/80 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">{mandate.mandateNumber}</span>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusBadge(mandate.mandateStatus)}`}>
                        {mandate.mandateStatus.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">₹{mandate.totalAmount.toLocaleString('en-IN')}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">PO: {mandate.po?.poNumber || '-'} • Vendor: {mandate.vendor?.name || '-'}</p>
                    <p className="text-xs text-slate-500">Due: {new Date(mandate.dueDate).toLocaleDateString()}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    {mandate.mandateStatus === 'PENDING' && (
                      <button onClick={() => signVendor(mandate.id)} className="px-4 py-2 rounded-lg bg-amber-100 text-amber-800 font-semibold hover:bg-amber-200">
                        Vendor Sign
                      </button>
                    )}
                    {mandate.mandateStatus === 'VENDOR_SIGNED' && (
                      <button onClick={() => signCompany(mandate.id)} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow">
                        Company Approve
                      </button>
                    )}
                    {mandate.mandateStatus === 'ACTIVE' && (
                      <button onClick={() => executeMandate(mandate.id)} className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow">
                        Execute Payment
                      </button>
                    )}
                    {['COMPLETED', 'FAILED'].includes(mandate.mandateStatus) && (
                      <span className="text-sm text-slate-600 dark:text-slate-300">{mandate.mandateStatus}</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid md:grid-cols-4 gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">Installments</p>
                    <p>{mandate.installments}x {mandate.installmentAmount ? `₹${mandate.installmentAmount.toLocaleString('en-IN')}` : '—'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">Auto-Deduct</p>
                    <p>{mandate.autoDeductEnabled ? 'Enabled' : 'Manual'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">Signatures</p>
                    <p>Vendor: {mandate.signedByVendorAt ? '✓' : '—'} • Company: {mandate.signedByCompanyAt ? '✓' : '—'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">Updated</p>
                    <p>{new Date(mandate.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {mandate.failureReason && (
                  <div className="mt-3 text-xs text-red-600">Failure Reason: {mandate.failureReason}</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create Mandate</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Bind payment to a delivered PO with auto-deduction</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">Purchase Order</label>
                <select
                  value={form.poId}
                  onChange={(e) => {
                    const poId = e.target.value;
                    const po = purchaseOrders.find((p) => p.id === poId);
                    setForm((prev) => ({
                      ...prev,
                      poId,
                      totalAmount: po ? String(po.totalAmount) : prev.totalAmount,
                    }));
                  }}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  required
                >
                  <option value="">Select PO</option>
                  {availablePOs.map((po) => (
                    <option key={po.id} value={po.id}>
                      {po.poNumber} • {po.vendor?.name || 'Vendor'} • ₹{po.totalAmount.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">Total Amount (₹)</label>
                <input
                  type="number"
                  value={form.totalAmount}
                  onChange={(e) => setForm((p) => ({ ...p, totalAmount: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">Due Date</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">Installments</label>
                <input
                  type="number"
                  min={1}
                  value={form.installments}
                  onChange={(e) => setForm((p) => ({ ...p, installments: Number(e.target.value) }))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                />
              </div>

              <div className="flex items-center gap-2 md:col-span-2">
                <input
                  id="autoDeduct"
                  type="checkbox"
                  checked={form.autoDeductEnabled}
                  onChange={(e) => setForm((p) => ({ ...p, autoDeductEnabled: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="autoDeduct" className="text-sm font-semibold text-slate-800 dark:text-slate-200">Enable auto-deduction after delivery confirmation</label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">Terms</label>
                <textarea
                  value={form.terms}
                  onChange={(e) => setForm((p) => ({ ...p, terms: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  rows={3}
                  placeholder="Payment triggers after GRN; late fee 0.5%/week"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">Bank / UPI Details</label>
                <textarea
                  value={form.bankDetails}
                  onChange={(e) => setForm((p) => ({ ...p, bankDetails: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  rows={3}
                  placeholder="Account: 123456789 • IFSC: HDFC0001234 • UPI: vendor@upi"
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white text-slate-700 dark:text-slate-200">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 disabled:opacity-60"
                >
                  {submitting ? 'Creating…' : 'Create Mandate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  const bg = {
    blue: 'from-blue-500/10 to-blue-600/10 text-blue-700',
    amber: 'from-amber-500/10 to-amber-600/10 text-amber-700',
    green: 'from-green-500/10 to-green-600/10 text-green-700',
    emerald: 'from-emerald-500/10 to-emerald-600/10 text-emerald-700',
    indigo: 'from-indigo-500/10 to-indigo-600/10 text-indigo-700',
  }[accent];

  return (
    <div className={`p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br ${bg} shadow-sm`}>
      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{label}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
    </div>
  );
}
