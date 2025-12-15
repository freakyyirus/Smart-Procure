'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    vendors: 0,
    activeRFQs: 0,
    purchaseOrders: 0,
    upcomingPayments: 0,
    totalValue: 0,
  });

  useEffect(() => {
    // Fetch stats
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [vendorsRes, rfqsRes, posRes] = await Promise.all([
          fetch('http://localhost:3001/api/vendors', { headers }),
          fetch('http://localhost:3001/api/rfqs', { headers }),
          fetch('http://localhost:3001/api/purchase-orders', { headers }),
        ]);

        const vendors = await vendorsRes.json();
        const rfqs = await rfqsRes.json();
        const pos = await posRes.json();

        setStats({
          vendors: vendors.length || 0,
          activeRFQs: rfqs.filter((r: any) => ['SENT', 'IN_PROGRESS'].includes(r.status)).length || 0,
          purchaseOrders: pos.length || 0,
          upcomingPayments: pos.filter((p: any) => ['CONFIRMED', 'IN_TRANSIT'].includes(p.status)).length || 0,
          totalValue: pos.reduce((sum: number, po: any) => sum + (po.grandTotal || 0), 0) || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      name: 'Total Vendors',
      value: stats.vendors,
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      name: 'Active RFQs',
      value: stats.activeRFQs,
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      color: 'from-green-500 to-emerald-600',
      textColor: 'text-green-600 dark:text-green-400',
    },
    {
      name: 'Purchase Orders',
      value: stats.purchaseOrders,
      icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      name: 'Upcoming Payments',
      value: stats.upcomingPayments,
      icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
      color: 'from-orange-500 to-amber-600',
      textColor: 'text-orange-600 dark:text-orange-400',
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div
              key={stat.name}
              className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{stat.name}</p>
                  <p className={`text-4xl font-bold ${stat.textColor} mt-2`}>{stat.value}</p>
                </div>
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Large Value Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-600 dark:to-blue-900 rounded-3xl p-8 text-white shadow-2xl shadow-blue-500/30 backdrop-blur-xl border border-blue-400/20 hover:shadow-3xl transition-all duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-2">Total Purchase Order Value</p>
              <p className="text-5xl font-bold mb-4">₹{(Number(stats.totalValue || 0) / 100000).toFixed(2)}L</p>
              <p className="text-blue-200 text-sm">Across {stats.purchaseOrders} purchase orders</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center">
              <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Add Vendor', href: '/vendors', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'from-blue-500 to-blue-600' },
              { name: 'Create RFQ', href: '/rfqs', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'from-green-500 to-emerald-600' },
              { name: 'New PO', href: '/purchase-orders', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', color: 'from-purple-500 to-purple-600' },
              { name: 'View Mandates', href: '/mandates', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', color: 'from-orange-500 to-amber-600' },
            ].map((action) => (
              <Link
                key={action.name}
                href={action.href}
                className="group bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 text-center"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                  </svg>
                </div>
                <p className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {action.name}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { action: 'New RFQ created', time: '2 hours ago', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'bg-green-500' },
              { action: 'Purchase Order approved', time: '5 hours ago', icon: 'M5 13l4 4L19 7', color: 'bg-blue-500' },
              { action: 'New vendor added', time: '1 day ago', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', color: 'bg-purple-500' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className={`w-10 h-10 rounded-lg ${activity.color} flex items-center justify-center flex-shrink-0`}>
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={activity.icon} />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-white">{activity.action}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
