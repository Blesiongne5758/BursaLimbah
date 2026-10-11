/**
 * BursaLimbah.com - Legal Pages
 * Terms & Privacy policy pages
 */

import { Card } from '../components/ui';

interface LegalPageProps {
  type: 'terms' | 'privacy';
}

export default function LegalPage({ type }: LegalPageProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card className="p-8">
        {type === 'terms' ? (
          <>
            <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">Syarat & Ketentuan</h1>
            <p className="text-sm text-slate-500 mb-8">Terakhir diperbarui: 1 November 2024</p>
            <div className="space-y-6 text-sm text-slate-700">
              {[
                ['Ketentuan Umum', 'BursaLimbah.com adalah platform marketplace yang mempertemukan penjual dan pembeli limbah di Indonesia. Sesuai KUHPerdata.'],
                ['Pendaftaran & KYC', 'Verifikasi identitas wajib. Corporate tier memerlukan NPWP, NIB, dan izin KLHK untuk limbah B3.'],
                ['Transaksi & Escrow', 'Dana ditahan escrow hingga validasi. Platform fee 2-5%. Release max 7 hari setelah pickup.'],
                ['Limbah B3', 'Hanya pihak berizin KLHK. Sesuai PP No. 22/2021. BursaLimbah berhak menolak listing non-compliant.'],
                ['Penyelesaian Sengketa', 'Mediasi 3x24 jam. Jika gagal, melalui BAPSI atau jalur hukum Indonesia.'],
              ].map(([title, content]) => (
                <section key={title}>
                  <h2 className="text-lg font-semibold text-slate-900 mb-2">{title}</h2>
                  <p>{content}</p>
                </section>
              ))}
            </div>
          </>
        ) : (
          <>
            <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">Kebijakan Privasi</h1>
            <p className="text-sm text-slate-500 mb-8">Compliant UU PDP No. 27/2023 • Terakhir diperbarui: 1 November 2024</p>
            <div className="space-y-6 text-sm text-slate-700">
              {[
                ['Pengumpulan Data', 'Nama, email, telepon, alamat usaha, data transaksi. Lokasi GPS dienkripsi AES-256-GCM.'],
                ['Penggunaan Data', 'Memproses transaksi, verifikasi identitas, meningkatkan layanan. Tidak dijual ke pihak ketiga.'],
                ['Perlindungan Lokasi', 'Koordinat terenkripsi. Hanya kota/provinsi publik. Detail terbuka setelah booking + DP.'],
                ['Hak Pengguna (UU PDP)', 'Hak mengakses, memperbaiki, menghapus data. Hak portabilitas dan menarik consent.'],
                ['Retensi Data', 'Data transaksi 10 tahun (pajak). Data pribadi dihapus 30 hari setelah permintaan.'],
              ].map(([title, content]) => (
                <section key={title}>
                  <h2 className="text-lg font-semibold text-slate-900 mb-2">{title}</h2>
                  <p>{content}</p>
                </section>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
