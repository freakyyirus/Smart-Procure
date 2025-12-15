'use client';

import { cn } from '@/lib/utils';

// Base Skeleton component
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />;
}

// Skeleton for stat cards
export function StatCardSkeleton() {
  return (
    <div className="glass-card">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-8 w-24 mb-2" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

// Skeleton for table rows
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b border-border/50">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <Skeleton className={cn('h-4', i === 0 ? 'w-32' : 'w-20')} />
        </td>
      ))}
    </tr>
  );
}

// Skeleton for table
export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50/50 dark:bg-slate-800/50">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <Skeleton className="h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Skeleton for cards grid
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card">
          <div className="flex items-start justify-between mb-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-4" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Skeleton for list items
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-border/50">
      <Skeleton className="h-12 w-12 rounded-xl" />
      <div className="flex-1">
        <Skeleton className="h-5 w-40 mb-2" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-8 w-24 rounded-lg" />
    </div>
  );
}

// Skeleton for dashboard
export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card">
          <Skeleton className="h-6 w-40 mb-4" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
        <div className="glass-card">
          <Skeleton className="h-6 w-40 mb-4" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
      
      {/* Recent Items */}
      <div className="glass-card">
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="space-y-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <ListItemSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Skeleton for AI Hub
export function AIHubSkeleton() {
  return (
    <div className="space-y-8">
      {/* Status Banner */}
      <div className="glass-card flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      
      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-card">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton for forms
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="glass-card max-w-2xl mx-auto">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="space-y-6">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-8">
        <Skeleton className="h-12 flex-1 rounded-xl" />
        <Skeleton className="h-12 w-32 rounded-xl" />
      </div>
    </div>
  );
}

// Page loading skeleton wrapper
export function PageLoadingSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-pulse">
      {children}
    </div>
  );
}
