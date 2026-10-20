/**
 * Test Connection Page
 * Verifikasi koneksi ke Supabase dan Cloudinary
 */

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { uploadToCloudinary } from '../lib/cloudinary';
import { Card, Button, Alert } from '../components/ui';
import { CheckCircle2, XCircle, Loader2, Database, Image, Wifi } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

export default function TestConnectionPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const updateResult = (index: number, result: Partial<TestResult>) => {
    setResults(prev => prev.map((r, i) => i === index ? { ...r, ...result } : r));
  };

  const testSupabaseConnection = async () => {
    const index = results.length;
    addResult({
      name: 'Supabase Connection',
      status: 'pending',
      message: 'Testing connection...',
    });

    try {
      // Test 1: Check connection
      const { data: connectionData, error: connectionError } = await supabase
        .from('users')
        .select('*')
        .limit(1);

      if (connectionError) {
        updateResult(index, {
          status: 'error',
          message: 'Connection failed',
          details: connectionError.message,
        });
        return false;
      }

      // Test 2: Check tables exist
      const { data: tablesData, error: tablesError } = await supabase
        .from('listings')
        .select('*')
        .limit(1);

      if (tablesError) {
        updateResult(index, {
          status: 'error',
          message: 'Tables not found',
          details: tablesError.message,
        });
        return false;
      }

      // Test 3: Check feature flags
      const { data: flagsData, error: flagsError } = await supabase
        .from('feature_flags')
        .select('*')
        .limit(5);

      updateResult(index, {
        status: 'success',
        message: 'Connection successful',
        details: {
          users: connectionData?.length || 0,
          listings: tablesData?.length || 0,
          featureFlags: flagsData?.length || 0,
        },
      });

      return true;
    } catch (error: any) {
      updateResult(index, {
        status: 'error',
        message: 'Connection failed',
        details: error.message,
      });
      return false;
    }
  };

  const testCloudinaryUpload = async () => {
    const index = results.length;
    addResult({
      name: 'Cloudinary Upload',
      status: 'pending',
      message: 'Testing upload...',
    });

    try {
      // Create a test image (1x1 pixel red PNG)
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, 1, 1);
      }

      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });

      const file = new File([blob], 'test.png', { type: 'image/png' });

      // Upload to Cloudinary
      const result = await uploadToCloudinary(file, 'bursalimbah/test');

      updateResult(index, {
        status: 'success',
        message: 'Upload successful',
        details: {
          url: result.url,
          publicId: result.publicId,
          format: result.format,
          size: result.size,
        },
      });

      return true;
    } catch (error: any) {
      updateResult(index, {
        status: 'error',
        message: 'Upload failed',
        details: error.message,
      });
      return false;
    }
  };

  const testDatabaseOperations = async () => {
    const index = results.length;
    addResult({
      name: 'Database Operations',
      status: 'pending',
      message: 'Testing CRUD operations...',
    });

    try {
      // Test INSERT
      const { data: insertData, error: insertError } = await supabase
        .from('audit_logs')
        .insert({
          action: 'TEST',
          resource: 'TestConnection',
          metadata: { test: true, timestamp: new Date().toISOString() },
        })
        .select()
        .single();

      if (insertError) {
        updateResult(index, {
          status: 'error',
          message: 'INSERT failed',
          details: insertError.message,
        });
        return false;
      }

      // Test SELECT
      const { data: selectData, error: selectError } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('id', insertData.id)
        .single();

      if (selectError) {
        updateResult(index, {
          status: 'error',
          message: 'SELECT failed',
          details: selectError.message,
        });
        return false;
      }

      // Test DELETE
      const { error: deleteError } = await supabase
        .from('audit_logs')
        .delete()
        .eq('id', insertData.id);

      if (deleteError) {
        updateResult(index, {
          status: 'error',
          message: 'DELETE failed',
          details: deleteError.message,
        });
        return false;
      }

      updateResult(index, {
        status: 'success',
        message: 'CRUD operations successful',
        details: {
          inserted: insertData.id,
          selected: selectData.id,
          deleted: true,
        },
      });

      return true;
    } catch (error: any) {
      updateResult(index, {
        status: 'error',
        message: 'Operations failed',
        details: error.message,
      });
      return false;
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setResults([]);

    const supabaseOk = await testSupabaseConnection();
    const cloudinaryOk = await testCloudinaryUpload();
    const dbOpsOk = await testDatabaseOperations();

    setTesting(false);

    // Show summary
    const allPassed = supabaseOk && cloudinaryOk && dbOpsOk;
    if (allPassed) {
      alert('✅ Semua test berhasil! Sistem siap digunakan.');
    } else {
      alert('❌ Beberapa test gagal. Periksa konfigurasi Anda.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">
          Test Koneksi
        </h1>
        <p className="text-slate-600">
          Verifikasi koneksi ke Supabase dan Cloudinary
        </p>
      </div>

      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Configuration Check
          </h2>
          <Button
            variant="primary"
            onClick={runAllTests}
            loading={testing}
            disabled={testing}
          >
            <Wifi className="w-4 h-4" />
            Run All Tests
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-slate-900">Supabase URL</p>
                <p className="text-xs text-slate-500 font-mono">
                  {import.meta.env.VITE_SUPABASE_URL || 'Not configured'}
                </p>
              </div>
            </div>
            {import.meta.env.VITE_SUPABASE_URL ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-slate-900">Supabase Anon Key</p>
                <p className="text-xs text-slate-500 font-mono">
                  {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configured' : 'Not configured'}
                </p>
              </div>
            </div>
            {import.meta.env.VITE_SUPABASE_ANON_KEY ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Image className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-slate-900">Cloudinary Cloud Name</p>
                <p className="text-xs text-slate-500 font-mono">
                  {import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'Not configured'}
                </p>
              </div>
            </div>
            {import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Image className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-slate-900">Cloudinary Upload Preset</p>
                <p className="text-xs text-slate-500 font-mono">
                  {import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'Not configured'}
                </p>
              </div>
            </div>
            {import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
          </div>
        </div>
      </Card>

      {results.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Test Results
          </h2>
          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  result.status === 'success'
                    ? 'bg-emerald-50 border-emerald-200'
                    : result.status === 'error'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {result.status === 'pending' && (
                    <Loader2 className="w-5 h-5 text-slate-400 animate-spin flex-shrink-0 mt-0.5" />
                  )}
                  {result.status === 'success' && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  )}
                  {result.status === 'error' && (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{result.name}</p>
                    <p className="text-sm text-slate-600 mt-1">{result.message}</p>
                    {result.details && (
                      <pre className="text-xs text-slate-500 mt-2 bg-white p-2 rounded overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="mt-6">
        <Alert type="info">
          <p className="text-sm">
            <strong>Tip:</strong> Jika test gagal, periksa file <code className="bg-slate-200 px-1 rounded">.env</code> dan pastikan semua credentials sudah benar. Lihat dokumentasi di <code className="bg-slate-200 px-1 rounded">SUPABASE_SETUP.md</code> dan <code className="bg-slate-200 px-1 rounded">CLOUDINARY_SETUP.md</code>.
          </p>
        </Alert>
      </div>
    </div>
  );
}
