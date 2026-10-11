/**
 * BursaLimbah.com - Schema Page
 * Database schema visualization
 */

import { useState } from 'react';
import { Card, Badge, Alert } from '../components/ui';
import { PRISMA_SCHEMA } from '../types';
import { motion } from 'framer-motion';
import { X, ArrowRight, Lock, Shield, FileText, Database } from 'lucide-react';

export default function SchemaPage() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const modelColors: Record<string, string> = {
    emerald: 'border-emerald-500 bg-emerald-50',
    blue: 'border-blue-500 bg-blue-50',
    amber: 'border-amber-500 bg-amber-50',
    purple: 'border-purple-500 bg-purple-50',
    teal: 'border-teal-500 bg-teal-50',
    pink: 'border-pink-500 bg-pink-50',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-900">Database Schema</h1>
        <p className="text-slate-600 mt-2">Visualisasi skema PostgreSQL yang digunakan oleh BursaLimbah.com</p>
      </div>

      <Alert type="info" title="Prisma ORM + PostgreSQL">
        Skema ini diimplementasikan menggunakan Prisma ORM dengan PostgreSQL sebagai database utama. Setiap model memiliki Row-Level Security (RLS) untuk proteksi data multi-tenant.
      </Alert>

      {/* Model Overview */}
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PRISMA_SCHEMA.map((model) => (
          <Card
            key={model.name}
            className={`p-5 cursor-pointer hover:shadow-lg transition-all border-l-4 ${modelColors[model.color]}`}
            onClick={() => setSelectedModel(selectedModel === model.name ? null : model.name)}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-bold text-lg text-slate-900">{model.name}</h3>
              <Badge variant="outline">{model.fields.length} fields</Badge>
            </div>
            <p className="text-sm text-slate-600">{model.description}</p>
          </Card>
        ))}
      </div>

      {/* Selected Model Detail */}
      {selectedModel && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-slate-900">Model: {selectedModel}</h2>
              <button onClick={() => setSelectedModel(null)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Field</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Attributes</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {PRISMA_SCHEMA.find((m) => m.name === selectedModel)?.fields.map((field) => (
                    <tr key={field.name} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono text-slate-900">{field.name}</code>
                          {field.isPK && <Badge variant="warning">PK</Badge>}
                          {field.isFK && <Badge variant="info">FK</Badge>}
                          {field.isRelation && <Badge variant="success">Relation</Badge>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs font-mono text-purple-600 bg-purple-50 px-2 py-1 rounded">{field.type}</code>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {field.isOptional && <Badge variant="outline">nullable</Badge>}
                          {field.isPK && <Badge variant="warning">@id</Badge>}
                          {field.isFK && <Badge variant="info">@relation</Badge>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{field.description || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Schema Relationships */}
      <div className="mt-8">
        <Card className="p-6">
          <h3 className="font-display text-xl font-bold text-slate-900 mb-4">Relasi Antar Model</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Badge variant="success">User</Badge>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <Badge variant="warning">Listing</Badge>
              <span className="text-slate-600 ml-2">1:N (seller memiliki banyak listing)</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Badge variant="success">User</Badge>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <Badge variant="info">Booking</Badge>
              <span className="text-slate-600 ml-2">1:N (buyer memiliki banyak booking)</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Badge variant="warning">Listing</Badge>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <Badge variant="info">Booking</Badge>
              <span className="text-slate-600 ml-2">1:N (listing dapat memiliki banyak booking)</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Badge variant="success">User</Badge>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <Badge variant="info">CompanyInfo</Badge>
              <span className="text-slate-600 ml-2">1:1 (user memiliki satu company info)</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Badge variant="info">Booking</Badge>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <Badge variant="success">Validation</Badge>
              <span className="text-slate-600 ml-2">1:1 (booking memiliki satu validation)</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Security Features */}
      <div className="mt-8">
        <Card className="p-6">
          <h3 className="font-display text-xl font-bold text-slate-900 mb-4">Fitur Keamanan Database</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-5 h-5 text-emerald-600" />
                <h4 className="font-semibold text-emerald-900">AES-256-GCM Encryption</h4>
              </div>
              <p className="text-sm text-emerald-700">
                Koordinat GPS seller dienkripsi di kolom <code className="bg-emerald-100 px-1 rounded">encryptedCoords</code>. Hanya terbuka setelah booking + DP.
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-blue-900">Row-Level Security</h4>
              </div>
              <p className="text-sm text-blue-700">
                Setiap query divalidasi berdasarkan role dan ownership. User hanya bisa akses data mereka sendiri.
              </p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-amber-600" />
                <h4 className="font-semibold text-amber-900">Audit Trail</h4>
              </div>
              <p className="text-sm text-amber-700">
                Setiap akses data sensitif dicatat dengan timestamp, user ID, dan IP address untuk compliance UU PDP.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold text-purple-900">Encrypted PII</h4>
              </div>
              <p className="text-sm text-purple-700">
                Data pribadi (phone, email, NPWP) dienkripsi at-rest menggunakan PostgreSQL pgcrypto extension.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
