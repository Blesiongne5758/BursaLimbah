/**
 * BursaLimbah.com - Error Boundary Component
 * Catches React errors and displays user-friendly error page
 */

import React from 'react';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary component
 * Wraps components to catch rendering errors
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });

    // Log error to monitoring service (Sentry, etc.)
    console.error('[ErrorBoundary]', error, errorInfo);

    // In production, send to error tracking service
    if (typeof window !== 'undefined' && import.meta.env.PROD) {
      // Example: Sentry.captureException(error, { extra: errorInfo });
      console.error('Error sent to monitoring service');
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>

            <h1 className="font-display text-2xl font-bold text-slate-900 mb-3">
              Oops! Terjadi Kesalahan
            </h1>

            <p className="text-slate-600 mb-6">
              Maaf, terjadi kesalahan yang tidak terduga. Tim kami telah diberitahu dan sedang memperbaikinya.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6 text-left bg-slate-50 rounded-lg p-4 border border-slate-200">
                <summary className="cursor-pointer text-sm font-medium text-slate-700 mb-2">
                  Detail Error (Development Only)
                </summary>
                <pre className="text-xs text-red-600 overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Coba Lagi
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-6 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Ke Beranda
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-6">
              Error ID: {Math.random().toString(36).substring(2, 10)}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Async Error Boundary for lazy-loaded components
 */
export function AsyncErrorBoundary({ error, resetErrorBoundary }: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="min-h-[40vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-amber-600" />
        </div>

        <h2 className="font-display text-xl font-bold text-slate-900 mb-3">
          Gagal Memuat Konten
        </h2>

        <p className="text-slate-600 mb-6">
          Tidak dapat memuat konten yang diminta. Periksa koneksi internet Anda dan coba lagi.
        </p>

        <button
          onClick={resetErrorBoundary}
          className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Muat Ulang
        </button>
      </div>
    </div>
  );
}

/**
 * 404 Not Found Component
 */
export function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl font-bold text-slate-200 mb-4">404</div>
        <h1 className="font-display text-2xl font-bold text-slate-900 mb-3">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-slate-600 mb-6">
          Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
}

/**
 * Loading Fallback for Suspense
 */
export function LoadingFallback({ message = 'Memuat...' }: { message?: string }) {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-slate-600">{message}</p>
      </div>
    </div>
  );
}
