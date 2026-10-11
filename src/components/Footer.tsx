/**
 * BursaLimbah.com - Footer Component
 * Main footer with links and contact info
 */

import { useStore } from '../store';
import { Recycle, Mail, Phone, MapPin, ShieldCheck, Leaf } from 'lucide-react';

export default function Footer() {
  const { setPage } = useStore();

  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Recycle className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-white">BursaLimbah</span>
            </div>
            <p className="text-sm text-slate-400">Marketplace perdagangan limbah terpercaya di Indonesia.</p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-medium text-white mb-3">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => setPage('marketplace')} className="hover:text-emerald-400">
                  Marketplace
                </button>
              </li>
              <li>
                <button onClick={() => setPage('pricing')} className="hover:text-emerald-400">
                  Harga
                </button>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-medium text-white mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => setPage('terms')} className="hover:text-emerald-400">
                  Syarat & Ketentuan
                </button>
              </li>
              <li>
                <button onClick={() => setPage('privacy')} className="hover:text-emerald-400">
                  Kebijakan Privasi
                </button>
              </li>
              <li>
                <button onClick={() => setPage('schema')} className="hover:text-emerald-400">
                  Database Schema
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-medium text-white mb-3">Kontak</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> info@bursalimbah.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> +62 21-5555-BURS
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Jakarta, Indonesia
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">© 2024 BursaLimbah.com. Hak cipta dilindungi.</p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> UU PDP
            </span>
            <span className="flex items-center gap-1">
              <Leaf className="w-3 h-3" /> Eco-Friendly
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
