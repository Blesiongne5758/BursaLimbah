/**
 * BursaLimbah.com - Authentication Page
 * Login and registration with form validation
 */

import { useState } from 'react';
import { useStore } from '../store';
import { Card, Button, Alert } from '../components/ui';
import { AuthService } from '../services';
import { loginSchema, registerSchema, type LoginFormData, type RegisterFormData } from '../lib/validators';
import { motion } from 'framer-motion';
import { Recycle, Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function AuthPage() {
  const { login, register, setPage } = useStore();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Validate login
        const validation = loginSchema.safeParse({ email, password });
        if (!validation.success) {
          setError(validation.error.errors[0].message);
          setLoading(false);
          return;
        }

        // Attempt login
        const result = await AuthService.login(email, password);
        if (result.success && result.user) {
          login(result.user.email, '');
          setPage('dashboard');
        } else {
          setError(result.error || 'Login gagal');
        }
      } else {
        // Validate registration
        const validation = registerSchema.safeParse({
          name,
          email,
          phone: '+6281234567890', // Placeholder
          password,
          confirmPassword: password,
          city: 'Jakarta',
          province: 'DKI Jakarta',
          membershipTier: 'PERSONAL',
        });

        if (!validation.success) {
          setError(validation.error.errors[0].message);
          setLoading(false);
          return;
        }

        // Register user
        register({ name, email });
        setPage('dashboard');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
            <Recycle className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            {isLogin ? 'Masuk ke BursaLimbah' : 'Daftar Akun Baru'}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {isLogin ? 'Kelola transaksi limbah Anda' : 'Mulai jual beli limbah dengan aman'}
          </p>
        </div>

        {/* Form Card */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name (Register only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nama / Perusahaan
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="PT Contoh Indonesia"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@perusahaan.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {!isLogin && (
                <p className="text-xs text-slate-500 mt-1">
                  Minimal 8 karakter, huruf besar, kecil, dan angka
                </p>
              )}
            </div>

            {/* Error Alert */}
            {error && (
              <Alert type="error" title="Error">
                {error}
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
            >
              {isLogin ? 'Masuk' : 'Daftar Sekarang'}
            </Button>
          </form>

          {/* Demo Accounts */}
          {isLogin && (
            <div className="mt-4 p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 font-medium mb-1">Demo accounts:</p>
              <p className="text-xs text-slate-600">• budi@plastikjaya.com (Seller)</p>
              <p className="text-xs text-slate-600">• siti@greencycle.id (Buyer)</p>
              <p className="text-xs text-slate-600">• admin@bursalimbah.com (Admin)</p>
            </div>
          )}

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setEmail('');
                setPassword('');
                setName('');
              }}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              {isLogin ? 'Belum punya akun? Daftar gratis' : 'Sudah punya akun? Masuk'}
            </button>
          </div>
        </Card>

        {/* Legal Notice */}
        <p className="text-xs text-center text-slate-500 mt-6">
          Dengan mendaftar, Anda menyetujui{' '}
          <button onClick={() => setPage('terms')} className="text-emerald-600 hover:underline">
            Syarat & Ketentuan
          </button>{' '}
          dan{' '}
          <button onClick={() => setPage('privacy')} className="text-emerald-600 hover:underline">
            Kebijakan Privasi
          </button>
          .
        </p>
      </motion.div>
    </div>
  );
}
