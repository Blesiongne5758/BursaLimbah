/**
 * BursaLimbah.com - Reusable UI Components
 * Professional component library for the marketplace
 */

import { motion } from 'framer-motion';
import { Check, X, AlertCircle, Info, Loader2 } from 'lucide-react';
import { ReactNode } from 'react';

/* ============================================
   BADGE
   ============================================ */
export function Badge({ children, variant = 'default', size = 'sm' }: {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  size?: 'xs' | 'sm' | 'md';
}) {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    outline: 'border border-slate-200 text-slate-600',
  };
  const sizes = { xs: 'px-1.5 py-0.5 text-[10px]', sm: 'px-2 py-0.5 text-xs', md: 'px-2.5 py-1 text-sm' };

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
}

/* ============================================
   BUTTON
   ============================================ */
export function Button({ children, variant = 'primary', size = 'md', loading = false, disabled = false, className = '', ...props }: {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    outline: 'border border-slate-200 text-slate-700 hover:bg-slate-50',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}

/* ============================================
   CARD
   ============================================ */
export function Card({ children, className = '', hover = false, onClick }: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.div
      whileHover={hover ? { y: -2 } : undefined}
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200 ${hover ? 'hover:border-emerald-200 hover:shadow-lg cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ============================================
   ALERT
   ============================================ */
export function Alert({ type = 'info', title, children, onClose }: {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: ReactNode;
  onClose?: () => void;
}) {
  const types = {
    info: { bg: 'bg-blue-50 border-blue-200', icon: <Info className="w-4 h-4 text-blue-600" />, title: 'text-blue-800', text: 'text-blue-700' },
    success: { bg: 'bg-emerald-50 border-emerald-200', icon: <Check className="w-4 h-4 text-emerald-600" />, title: 'text-emerald-800', text: 'text-emerald-700' },
    warning: { bg: 'bg-amber-50 border-amber-200', icon: <AlertCircle className="w-4 h-4 text-amber-600" />, title: 'text-amber-800', text: 'text-amber-700' },
    error: { bg: 'bg-red-50 border-red-200', icon: <X className="w-4 h-4 text-red-600" />, title: 'text-red-800', text: 'text-red-700' },
  };
  const t = types[type];

  return (
    <div className={`p-4 rounded-lg border ${t.bg}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{t.icon}</div>
        <div className="flex-1">
          {title && <p className={`text-sm font-medium ${t.title} mb-1`}>{title}</p>}
          <div className={`text-sm ${t.text}`}>{children}</div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-black/5 rounded">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ============================================
   PROGRESS STEPPER
   ============================================ */
export function ProgressStepper({ steps, currentStep }: {
  steps: string[];
  currentStep: number;
}) {
  return (
    <div className="flex items-center w-full">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
              i <= currentStep ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {i < currentStep ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-[10px] mt-1 text-center max-w-[60px] ${i <= currentStep ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
              {step}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 ${i < currentStep ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ============================================
   SKELETON LOADER
   ============================================ */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-200 rounded ${className}`}></div>
  );
}

/* ============================================
   EMPTY STATE
   ============================================ */
export function EmptyState({ icon, title, description, action }: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-slate-700 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-4 max-w-sm mx-auto">{description}</p>
      {action}
    </div>
  );
}

/* ============================================
   MAP PLACEHOLDER
   ============================================ */
export function MapPlaceholder({ city, province, locked = true }: {
  city: string;
  province: string;
  locked?: boolean;
}) {
  return (
    <div className="relative w-full h-48 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl border border-slate-200 overflow-hidden">
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'linear-gradient(rgba(5,150,105,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(5,150,105,0.3) 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }}></div>

      {/* City marker */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-emerald-500/30 rounded-full animate-ping"></div>
        </div>
      </div>

      {/* City label */}
      <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-200">
        <p className="text-xs font-medium text-slate-700">📍 {city}, {province}</p>
        {locked ? (
          <p className="text-[10px] text-slate-500 mt-0.5">🔒 Lokasi detail terenkripsi</p>
        ) : (
          <p className="text-[10px] text-emerald-600 mt-0.5">✓ Lokasi terdekripsi - siap diambil</p>
        )}
      </div>

      {/* Lock overlay */}
      {locked && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/5 backdrop-blur-[1px]">
          <div className="bg-white/90 rounded-lg px-4 py-2 shadow-sm">
            <p className="text-xs font-medium text-slate-700">🔒 Lokasi terproteksi</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================
   TRANSACTION TIMELINE
   ============================================ */
export function TransactionTimeline({ events }: {
  events: Array<{
    status: string;
    label: string;
    date: string;
    completed: boolean;
    current?: boolean;
  }>;
}) {
  return (
    <div className="space-y-0">
      {events.map((event, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              event.completed ? 'bg-emerald-500' : event.current ? 'bg-amber-400 animate-pulse' : 'bg-slate-200'
            }`}>
              {event.completed ? (
                <Check className="w-3 h-3 text-white" />
              ) : event.current ? (
                <div className="w-2 h-2 bg-white rounded-full"></div>
              ) : (
                <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
              )}
            </div>
            {i < events.length - 1 && (
              <div className={`w-0.5 h-8 ${event.completed ? 'bg-emerald-300' : 'bg-slate-200'}`}></div>
            )}
          </div>
          <div className="pb-6">
            <p className={`text-sm font-medium ${event.completed || event.current ? 'text-slate-900' : 'text-slate-400'}`}>
              {event.label}
            </p>
            <p className="text-xs text-slate-500">{event.date}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================
   STAT CARD
   ============================================ */
export function StatCard({ title, value, change, icon, trend = 'up' }: {
  title: string;
  value: string;
  change?: string;
  icon: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}) {
  const trendColors = {
    up: 'text-emerald-600',
    down: 'text-red-600',
    neutral: 'text-slate-500',
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-slate-600">{title}</span>
        <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {change && (
        <p className={`text-xs mt-1 ${trendColors[trend]}`}>{change}</p>
      )}
    </Card>
  );
}
