/**
 * BursaLimbah.com - Skeleton Loading Components
 * Provides loading placeholders for better UX
 */

import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

/**
 * Base Skeleton component
 */
export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const baseClasses = 'bg-slate-200';

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

/**
 * Listing Card Skeleton
 */
export function ListingCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Image placeholder */}
      <Skeleton variant="rectangular" className="h-40 w-full" />

      <div className="p-4 space-y-3">
        {/* Title */}
        <Skeleton variant="text" className="h-5 w-3/4" />

        {/* Location */}
        <div className="flex items-center gap-2">
          <Skeleton variant="circular" className="w-4 h-4" />
          <Skeleton variant="text" className="h-4 w-1/2" />
        </div>

        {/* Price and quantity */}
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <Skeleton variant="text" className="h-6 w-24" />
            <Skeleton variant="text" className="h-4 w-20" />
          </div>
          <Skeleton variant="rounded" className="h-6 w-16" />
        </div>

        {/* Seller info */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
          <Skeleton variant="circular" className="w-5 h-5" />
          <Skeleton variant="text" className="h-4 w-32" />
        </div>
      </div>
    </div>
  );
}

/**
 * Listing Grid Skeleton
 */
export function ListingGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Dashboard Stats Skeleton
 */
export function DashboardStatsSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <Skeleton variant="text" className="h-4 w-24" />
            <Skeleton variant="rounded" className="w-9 h-9" />
          </div>
          <Skeleton variant="text" className="h-8 w-32 mb-2" />
          <Skeleton variant="text" className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

/**
 * Table Skeleton
 */
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} variant="text" className="h-4 flex-1" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="px-4 py-3 border-b border-slate-100 flex gap-4">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Chat Message Skeleton
 */
export function ChatMessageSkeleton({ isAI = false }: { isAI?: boolean }) {
  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[80%] space-y-2 ${isAI ? '' : 'items-end'}`}>
        <Skeleton
          variant="rounded"
          className={`h-4 ${isAI ? 'w-48' : 'w-32'}`}
        />
        <Skeleton
          variant="rounded"
          className={`h-4 ${isAI ? 'w-64' : 'w-48'}`}
        />
        <Skeleton
          variant="rounded"
          className={`h-4 ${isAI ? 'w-32' : 'w-24'}`}
        />
      </div>
    </div>
  );
}

/**
 * Chat Container Skeleton
 */
export function ChatSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <ChatMessageSkeleton isAI={true} />
      <ChatMessageSkeleton isAI={false} />
      <ChatMessageSkeleton isAI={true} />
      <ChatMessageSkeleton isAI={false} />
    </div>
  );
}

/**
 * Profile Card Skeleton
 */
export function ProfileCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" className="w-16 h-16" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="h-6 w-48" />
          <Skeleton variant="text" className="h-4 w-32" />
          <Skeleton variant="text" className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}

/**
 * Form Skeleton
 */
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton variant="text" className="h-4 w-24" />
          <Skeleton variant="rounded" className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

/**
 * Page Loader (full page)
 */
export function PageLoader({ message = 'Memuat halaman...' }: { message?: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-emerald-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-sm text-slate-600">{message}</p>
      </div>
    </div>
  );
}

/**
 * Content Placeholder (for empty states)
 */
export function ContentPlaceholder({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-12 px-4">
      {icon && (
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-slate-700 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 mb-4 max-w-sm mx-auto">{description}</p>
      {action}
    </div>
  );
}
