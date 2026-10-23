/**
 * BursaLimbah.com - Enhanced SEO Component
 * Comprehensive on-page SEO with structured data
 */

import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  noindex?: boolean;
  structuredData?: any;
  breadcrumbs?: Array<{ name: string; url: string }>;
}

export function SEO({
  title,
  description,
  keywords = [],
  image = '/og-image.jpg',
  url = 'https://bursalimbah.com',
  type = 'website',
  noindex = false,
  structuredData,
  breadcrumbs,
}: SEOProps) {
  useEffect(() => {
    // Update document title
    document.title = `${title} | BursaLimbah.com`;

    // Helper to set meta tag
    const setMeta = (name: string, content: string, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector) as HTMLMetaElement;

      if (!element) {
        element = document.createElement('meta');
        if (property) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        document.head.appendChild(element);
      }

      element.content = content;
    };

    // Basic meta tags
    setMeta('description', description);
    if (keywords.length > 0) {
      setMeta('keywords', keywords.join(', '));
    }
    setMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow');
    setMeta('author', 'BursaLimbah.com');
    setMeta('language', 'Indonesian');
    setMeta('revisit-after', '7 days');

    // Open Graph (Facebook, LinkedIn)
    setMeta('og:title', `${title} | BursaLimbah.com`, true);
    setMeta('og:description', description, true);
    setMeta('og:image', image, true);
    setMeta('og:url', url, true);
    setMeta('og:type', type, true);
    setMeta('og:site_name', 'BursaLimbah.com', true);
    setMeta('og:locale', 'id_ID', true);

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', `${title} | BursaLimbah.com`);
    setMeta('twitter:description', description);
    setMeta('twitter:image', image);
    setMeta('twitter:site', '@bursalimbah');
    setMeta('twitter:creator', '@bursalimbah');

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    // Structured Data (JSON-LD) - Organization
    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'BursaLimbah.com',
      url: 'https://bursalimbah.com',
      logo: 'https://bursalimbah.com/logo.png',
      description: 'Marketplace perdagangan limbah B2B & B2C terpercaya di Indonesia',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+62-21-5555-BURS',
        contactType: 'customer service',
        email: 'info@bursalimbah.com',
        availableLanguage: ['Indonesian', 'English'],
      },
      sameAs: [
        'https://www.facebook.com/bursalimbah',
        'https://twitter.com/bursalimbah',
        'https://www.instagram.com/bursalimbah',
        'https://www.linkedin.com/company/bursalimbah',
      ],
    };

    // Breadcrumbs Schema
    const breadcrumbsSchema = breadcrumbs
      ? {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbs.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
          })),
        }
      : null;

    // Combine all structured data
    const allStructuredData = [
      organizationSchema,
      structuredData,
      breadcrumbsSchema,
    ].filter(Boolean);

    let script = document.querySelector('#structured-data') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = 'structured-data';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(allStructuredData);

    // Cleanup on unmount
    return () => {
      // Reset to defaults if needed
      document.title = 'BursaLimbah.com — Marketplace Limbah Terpercaya Indonesia';
    };
  }, [title, description, keywords, image, url, type, noindex, structuredData, breadcrumbs]);

  return null; // This component doesn't render anything
}

/**
 * SEO for Homepage
 */
export function HomepageSEO() {
  return (
    <SEO
      title="Marketplace Limbah Terpercaya Indonesia"
      description="Jual beli limbah plastik, kertas, logam, elektronik dengan aman. Escrow payment, AI assistant, enkripsi lokasi, dan compliance regulasi KLHK."
      keywords={['limbah', 'daur ulang', 'marketplace', 'B2B', 'B2C', 'Indonesia', 'escrow', 'plastik', 'kertas', 'logam', 'elektronik']}
      url="https://bursalimbah.com"
      type="website"
      structuredData={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'BursaLimbah.com',
        url: 'https://bursalimbah.com',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://bursalimbah.com/marketplace?search={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      }}
    />
  );
}

/**
 * SEO for Marketplace Page
 */
export function MarketplaceSEO() {
  return (
    <SEO
      title="Marketplace Limbah"
      description="Temukan ribuan listing limbah dari seluruh Indonesia. Filter berdasarkan kategori, lokasi, dan harga. Plastik, kertas, logam, elektronik, dan lainnya."
      keywords={['marketplace limbah', 'jual limbah', 'beli limbah', 'limbah plastik', 'limbah kertas', 'limbah logam']}
      url="https://bursalimbah.com/marketplace"
      type="website"
      breadcrumbs={[
        { name: 'Home', url: 'https://bursalimbah.com' },
        { name: 'Marketplace', url: 'https://bursalimbah.com/marketplace' },
      ]}
      structuredData={{
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Limbah Plastik',
            url: 'https://bursalimbah.com/marketplace?category=PLASTIC',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Limbah Kertas',
            url: 'https://bursalimbah.com/marketplace?category=PAPER',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Limbah Logam',
            url: 'https://bursalimbah.com/marketplace?category=METAL',
          },
        ],
      }}
    />
  );
}

/**
 * SEO for Pricing Page
 */
export function PricingSEO() {
  return (
    <SEO
      title="Harga & Paket Membership"
      description="Pilih paket membership yang sesuai dengan bisnis Anda. Personal, Small Business, atau Corporate. Fitur lengkap dengan harga terjangkau."
      keywords={['harga bursalimbah', 'paket membership', 'biaya listing', 'paket bisnis', 'paket corporate']}
      url="https://bursalimbah.com/pricing"
      type="website"
      breadcrumbs={[
        { name: 'Home', url: 'https://bursalimbah.com' },
        { name: 'Harga', url: 'https://bursalimbah.com/pricing' },
      ]}
      structuredData={{
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'BursaLimbah Membership',
        description: 'Paket membership untuk marketplace limbah',
        offers: {
          '@type': 'AggregateOffer',
          lowPrice: '0',
          highPrice: '999000',
          priceCurrency: 'IDR',
          offerCount: '3',
        },
      }}
    />
  );
}

/**
 * SEO for Auth Page
 */
export function AuthSEO() {
  return (
    <SEO
      title="Masuk / Daftar"
      description="Masuk atau daftar akun baru untuk mulai bertransaksi limbah. Aman, cepat, dan mudah."
      keywords={['login bursalimbah', 'daftar bursalimbah', 'register', 'sign up']}
      url="https://bursalimbah.com/auth"
      type="website"
      noindex={true}
    />
  );
}

/**
 * SEO for Dashboard Page
 */
export function DashboardSEO() {
  return (
    <SEO
      title="Dashboard"
      description="Kelola listing, booking, wallet, dan laporan transaksi Anda di dashboard BursaLimbah."
      keywords={['dashboard', 'kelola listing', 'transaksi', 'wallet']}
      url="https://bursalimbah.com/dashboard"
      type="website"
      noindex={true}
    />
  );
}

/**
 * SEO for Wallet Page
 */
export function WalletSEO() {
  return (
    <SEO
      title="Blockchain Wallet"
      description="Kelola wallet crypto Anda untuk transaksi BLW token. Deposit, withdraw, dan lihat riwayat transaksi."
      keywords={['wallet crypto', 'blockchain', 'BLW token', 'cryptocurrency']}
      url="https://bursalimbah.com/wallet"
      type="website"
      noindex={true}
    />
  );
}

/**
 * SEO for KYC Page
 */
export function KYCSEO() {
  return (
    <SEO
      title="Verifikasi KYC"
      description="Lengkapi verifikasi identitas (KTP, NPWP, NIB) untuk mengakses fitur lengkap BursaLimbah."
      keywords={['KYC', 'verifikasi identitas', 'KTP', 'NPWP', 'NIB']}
      url="https://bursalimbah.com/kyc"
      type="website"
      noindex={true}
    />
  );
}

/**
 * SEO for Payment Page
 */
export function PaymentSEO() {
  return (
    <SEO
      title="Pembayaran"
      description="Proses pembayaran dengan escrow yang aman. DP 30% ditahan hingga barang diterima dan divalidasi."
      keywords={['pembayaran', 'escrow', 'transaksi', 'DP']}
      url="https://bursalimbah.com/payment"
      type="website"
      noindex={true}
    />
  );
}

/**
 * SEO for Terms Page
 */
export function TermsSEO() {
  return (
    <SEO
      title="Syarat & Ketentuan"
      description="Syarat dan ketentuan penggunaan platform BursaLimbah.com. Baca sebelum menggunakan layanan kami."
      keywords={['syarat ketentuan', 'terms of service', 'legal']}
      url="https://bursalimbah.com/terms"
      type="website"
    />
  );
}

/**
 * SEO for Privacy Page
 */
export function PrivacySEO() {
  return (
    <SEO
      title="Kebijakan Privasi"
      description="Kebijakan privasi compliant dengan UU PDP No. 27/2023. Pelajari bagaimana kami melindungi data Anda."
      keywords={['kebijakan privasi', 'privacy policy', 'UU PDP', 'data protection']}
      url="https://bursalimbah.com/privacy"
      type="website"
    />
  );
}
