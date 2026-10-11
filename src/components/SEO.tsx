/**
 * BursaLimbah.com - SEO Component
 * Manages document head for better SEO and social sharing
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
}

/**
 * SEO Component
 * Updates document head with meta tags for SEO and social sharing
 */
export function SEO({
  title,
  description,
  keywords = [],
  image = '/og-image.jpg',
  url = 'https://bursalimbah.com',
  type = 'website',
  noindex = false,
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

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    // Structured Data (JSON-LD)
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': type === 'product' ? 'Product' : 'WebSite',
      name: 'BursaLimbah.com',
      url: 'https://bursalimbah.com',
      description: 'Marketplace perdagangan limbah B2B & B2C terpercaya di Indonesia',
      publisher: {
        '@type': 'Organization',
        name: 'BursaLimbah',
        logo: {
          '@type': 'ImageObject',
          url: 'https://bursalimbah.com/logo.png',
        },
      },
    };

    let script = document.querySelector('#structured-data') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = 'structured-data';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(structuredData);

    // Cleanup on unmount
    return () => {
      // Reset to defaults if needed
      document.title = 'BursaLimbah.com — Marketplace Limbah Terpercaya Indonesia';
    };
  }, [title, description, keywords, image, url, type, noindex]);

  return null; // This component doesn't render anything
}

/**
 * Preload critical resources
 */
export function PreloadResources() {
  useEffect(() => {
    // Preload critical fonts
    const preloadFont = (href: string) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = href;
      document.head.appendChild(link);
    };

    // Preload critical images
    const preloadImage = (href: string) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = href;
      document.head.appendChild(link);
    };

    // Preconnect to external domains
    const preconnect = (href: string) => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = href;
      document.head.appendChild(link);
    };

    preconnect('https://fonts.googleapis.com');
    preconnect('https://fonts.gstatic.com');

    // Note: In production, add actual font/image URLs
  }, []);

  return null;
}

/**
 * Analytics tracking component
 */
export function Analytics() {
  useEffect(() => {
    // Google Analytics 4 (placeholder)
    const gaId = 'G-XXXXXXXXXX'; // Replace with actual GA ID

    if (import.meta.env.PROD && gaId !== 'G-XXXXXXXXXX') {
      // Load GA script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script);

      // Initialize GA
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) {
        window.dataLayer.push(args);
      }
      gtag('js', new Date());
      gtag('config', gaId);

      // Track page view
      gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
      });
    }
  }, []);

  return null;
}

// Extend Window interface for GA
declare global {
  interface Window {
    dataLayer: any[];
  }
}
