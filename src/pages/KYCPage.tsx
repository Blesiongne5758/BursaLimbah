/**
 * BursaLimbah.com - KYC Page
 * KYC/KYB verification flow for users
 */

import { useState } from 'react';
import { useStore } from '../store';
import { Card, Button, Alert } from '../components/ui';
import { KYCService } from '../services';
import { ProgressStepper } from '../components/ui';
import { motion } from 'framer-motion';
import { User, FileText, Building2, ShieldCheck, Upload } from 'lucide-react';

export default function KYCPage() {
  const { setPage } = useStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<string, any>>({});

  const steps = [
    { title: 'KTP', desc: 'Verifikasi identitas dengan KTP', icon: <User className="w-5 h-5" /> },
    { title: 'NPWP', desc: 'Verifikasi nomor pajak', icon: <FileText className="w-5 h-5" /> },
    { title: 'NIB', desc: 'Nomor Induk Berusaha (untuk bisnis)', icon: <Building2 className="w-5 h-5" /> },
    { title: 'Izin Lingkungan', desc: 'Izin KLHK untuk limbah B3', icon: <ShieldCheck className="w-5 h-5" /> },
  ];

  const handleVerify = async () => {
    setLoading(true);
    let result: any = {};
    switch (currentStep) {
      case 0:
        result = await KYCService.submitKTP({ name: '', nik: '', photo: '' });
        break;
      case 1:
        result = await KYCService.submitNPWP({ npwp: '', document: '' });
        break;
      case 2:
        result = await KYCService.submitNIB({ nib: '', document: '' });
        break;
      case 3:
        result = await KYCService.checkEnvironmentalPermit({ permitNumber: '' });
        break;
    }
    setResults((prev) => ({ ...prev, [currentStep]: result }));
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="font-display text-2xl font-bold text-slate-900">Verifikasi KYC/KYB</h1>
        <p className="text-sm text-slate-600 mt-1">Lengkapi verifikasi untuk mengakses fitur lengkap</p>
      </div>

      <ProgressStepper steps={steps.map((s) => s.title)} currentStep={currentStep} />

      <div className="mt-8">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
              {steps[currentStep].icon}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{steps[currentStep].title}</h3>
              <p className="text-sm text-slate-500">{steps[currentStep].desc}</p>
            </div>
          </div>

          {currentStep === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">NIK (16 digit)</label>
                <input
                  type="text"
                  placeholder="3201xxxxxxxxxxxx"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  maxLength={16}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Upload Foto KTP</label>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-emerald-300 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600">Klik atau drag foto KTP ke sini</p>
                  <p className="text-xs text-slate-400 mt-1">JPG, PNG. Max 5MB</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">NPWP</label>
                <input
                  type="text"
                  placeholder="01.234.567.8-901.000"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Upload Dokumen NPWP</label>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-emerald-300 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600">Upload kartu/faktur NPWP</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">NIB (Nomor Induk Berusaha)</label>
                <input
                  type="text"
                  placeholder="1234567890123"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <Alert type="info">NIB dapat diperoleh melalui OSS (oss.go.id)</Alert>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nomor Izin KLHK</label>
                <input
                  type="text"
                  placeholder="SKT-XXXX/XXXX"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <Alert type="warning">Wajib untuk penanganan limbah B3 sesuai PP No. 22/2021</Alert>
            </div>
          )}

          {results[currentStep] && (
            <Alert type="success" title="Berhasil dikirim">
              {results[currentStep].message || 'Verifikasi sedang diproses'}
            </Alert>
          )}

          <div className="mt-6 flex gap-3">
            {currentStep > 0 && (
              <Button variant="outline" onClick={() => setCurrentStep((s) => s - 1)}>
                Kembali
              </Button>
            )}
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => {
                if (results[currentStep]) {
                  if (currentStep < steps.length - 1) setCurrentStep((s) => s + 1);
                  else setPage('dashboard');
                } else {
                  handleVerify();
                }
              }}
              loading={loading}
            >
              {results[currentStep] ? (currentStep < steps.length - 1 ? 'Lanjut' : 'Selesai') : 'Verifikasi'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
