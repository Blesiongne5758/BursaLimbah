/**
 * BursaLimbah.com - Navbar Component
 * Main navigation bar
 */

import { useStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { Recycle, Menu, X, Bell, LogOut } from 'lucide-react';

export default function Navbar() {
  const { currentPage, setPage, isAuthenticated, currentUser, logout, mobileMenuOpen, setMobileMenuOpen } = useStore();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => setPage('landing')} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all">
              <Recycle className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-lg text-slate-900 leading-tight block">
                Bursa<span className="text-emerald-600">Limbah</span>
              </span>
              <span className="text-[9px] text-slate-400 leading-none hidden sm:block">Marketplace Limbah Indonesia</span>
            </div>
          </button>

          <div className="hidden md:flex items-center gap-1">
            <NavLink active={currentPage === 'marketplace'} onClick={() => setPage('marketplace')}>
              Marketplace
            </NavLink>
            <NavLink active={currentPage === 'pricing'} onClick={() => setPage('pricing')}>
              Harga
            </NavLink>
            {isAuthenticated && (
              <NavLink active={currentPage === 'dashboard'} onClick={() => setPage('dashboard')}>
                Dashboard
              </NavLink>
            )}
            {currentUser?.role === 'ADMIN' && (
              <NavLink active={currentPage === 'admin'} onClick={() => setPage('admin')}>
                Admin
              </NavLink>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full"></span>
                </button>
                <div className="h-8 w-px bg-slate-200 mx-1"></div>
                <button
                  onClick={() => setPage('dashboard')}
                  className="flex items-center gap-2 pl-1 hover:bg-slate-50 rounded-lg p-1.5 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{currentUser?.name?.charAt(0)}</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-slate-700 leading-tight">{currentUser?.name}</p>
                    <p className="text-[10px] text-slate-500">
                      {currentUser?.membershipTier === 'CORPORATE'
                        ? 'Corporate'
                        : currentUser?.membershipTier === 'SMALL_BUSINESS'
                        ? 'Bisnis'
                        : 'Personal'}
                    </p>
                  </div>
                </button>
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Keluar"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage('auth')}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  Masuk
                </button>
                <button
                  onClick={() => setPage('auth')}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
                >
                  Daftar Gratis
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-slate-200 bg-white overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {[
                ['marketplace', 'Marketplace'],
                ['pricing', 'Harga'],
              ].map(([page, label]) => (
                <button
                  key={page}
                  onClick={() => {
                    setPage(page as any);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  {label}
                </button>
              ))}
              {isAuthenticated && (
                <button
                  onClick={() => {
                    setPage('dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Dashboard
                </button>
              )}
              {!isAuthenticated && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <button
                    onClick={() => {
                      setPage('auth');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg"
                  >
                    Masuk
                  </button>
                  <button
                    onClick={() => {
                      setPage('auth');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg"
                  >
                    Daftar Gratis
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function NavLink({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
        active ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  );
}
