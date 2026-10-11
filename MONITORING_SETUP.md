# 📊 Monitoring & Observability Setup

## Overview

Panduan lengkap untuk setup monitoring dan observability BursaLimbah.com.

## 🎯 Monitoring Stack

```
┌─────────────────────────────────────┐
│         Application Layer           │
│  ┌──────────────────────────────┐  │
│  │  Frontend (Vite + React)     │  │
│  │  - Vercel Analytics          │  │
│  │  - Sentry (Errors)           │  │
│  │  - Google Analytics 4        │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│         Backend Layer               │
│  ┌──────────────────────────────┐  │
│  │  Next.js API Routes          │  │
│  │  - Vercel Logs               │  │
│  │  - Sentry (Errors)           │  │
│  │  - Custom Metrics            │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│      Infrastructure Layer           │
│  ┌──────────────────────────────┐  │
│  │  - Uptime Monitoring         │  │
│  │  - Performance Monitoring    │  │
│  │  - Error Tracking            │  │
│  │  - Log Aggregation           │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

## 🔧 Tools & Services

### 1. Error Tracking (Sentry)

**Setup:**
```bash
npm install @sentry/react @sentry/tracing
```

**Configuration:**
```typescript
// src/main.tsx
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
  environment: import.meta.env.MODE,
  release: 'bursalimbah@1.0.0',
});
```

**Features:**
- ✅ Real-time error tracking
- ✅ Performance monitoring
- ✅ Release tracking
- ✅ Source maps
- ✅ Custom context

### 2. Analytics (Google Analytics 4)

**Setup:**
```typescript
// src/components/SEO.tsx
export function Analytics() {
  useEffect(() => {
    const gaId = import.meta.env.VITE_GA_ID;
    if (!gaId) return;

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
  }, []);

  return null;
}
```

**Track Events:**
```typescript
// Track page view
gtag('event', 'page_view', {
  page_title: document.title,
  page_location: window.location.href,
});

// Track custom event
gtag('event', 'listing_view', {
  listing_id: listing.id,
  category: listing.category,
  price: listing.pricePerKg,
});
```

### 3. Vercel Analytics

**Setup:**
```bash
npm install @vercel/analytics
```

**Configuration:**
```typescript
// src/main.tsx
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      {/* Your app */}
      <Analytics />
    </>
  );
}
```

**Features:**
- ✅ Real-time analytics
- ✅ Core Web Vitals
- ✅ Audience insights
- ✅ Speed insights

### 4. Uptime Monitoring (Better Stack)

**Setup:**
1. Create account at [betterstack.com](https://betterstack.com)
2. Add monitors:
   - https://bursalimbah.com (Homepage)
   - https://bursalimbah.com/marketplace (Marketplace)
   - https://bursalimbah.com/api/health (API Health)

**Configuration:**
- Check interval: 1 minute
- Regions: Multiple (US, EU, Asia)
- Alert contacts: Email, SMS, Slack

### 5. Log Management (Vercel Logs)

**Features:**
- ✅ Real-time logs
- ✅ Log search
- ✅ Log aggregation
- ✅ Log retention (30 days)

**Access Logs:**
```bash
vercel logs https://bursalimbah.com
```

### 6. Performance Monitoring

**Core Web Vitals:**
```typescript
// src/lib/performance.ts
export function reportWebVitals(metric: any) {
  // Send to analytics
  gtag('event', metric.name, {
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    event_category: 'Web Vitals',
    event_label: metric.id,
  });
}
```

**Custom Metrics:**
```typescript
// Track API response time
const start = performance.now();
const response = await api.listings.getAll();
const duration = performance.now() - start;

gtag('event', 'api_response_time', {
  endpoint: 'listings',
  duration: Math.round(duration),
});
```

## 📊 Dashboards

### 1. Application Dashboard
- Active users
- Page views
- Conversion rates
- Error rates
- Response times

### 2. Infrastructure Dashboard
- Server uptime
- CPU usage
- Memory usage
- Database connections
- Cache hit rate

### 3. Business Dashboard
- Total transactions
- Revenue
- Active listings
- User growth
- Geographic distribution

## 🚨 Alerts

### Critical Alerts (Immediate)
- Application down
- Database connection failed
- Payment gateway error
- Security breach detected

### High Priority (Within 1 hour)
- Error rate > 5%
- Response time > 3s
- Disk space < 10%
- Memory usage > 90%

### Medium Priority (Within 24 hours)
- Slow queries detected
- Unusual traffic patterns
- Failed login attempts spike
- Cache miss rate high

### Low Priority (Weekly review)
- Performance degradation
- Unused features
- Optimization opportunities
- Documentation updates

## 📈 Key Metrics

### Performance Metrics
- **FCP (First Contentful Paint):** < 1.5s
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1
- **TTFB (Time to First Byte):** < 600ms

### Business Metrics
- **DAU (Daily Active Users)**
- **MAU (Monthly Active Users)**
- **Conversion Rate**
- **Average Order Value**
- **Customer Lifetime Value**

### Technical Metrics
- **Error Rate:** < 0.1%
- **Uptime:** > 99.9%
- **API Response Time:** < 500ms
- **Database Query Time:** < 100ms
- **Cache Hit Rate:** > 90%

## 🔍 Debugging

### Common Issues

**1. High Error Rate**
```bash
# Check Sentry
https://sentry.io/organizations/bursalimbah/issues/

# Check logs
vercel logs https://bursalimbah.com --follow
```

**2. Slow Performance**
```bash
# Check Lighthouse
lighthouse https://bursalimbah.com

# Check Web Vitals
https://web.dev/measure/
```

**3. Database Issues**
```bash
# Check slow queries
npx prisma studio

# Check connection pool
SELECT * FROM pg_stat_activity;
```

## 📚 Resources

### Documentation
- [Sentry Documentation](https://docs.sentry.io/)
- [Google Analytics](https://support.google.com/analytics)
- [Vercel Analytics](https://vercel.com/docs/analytics)
- [Better Stack](https://betterstack.com/docs)

### Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [GTmetrix](https://gtmetrix.com/)
- [Pingdom](https://www.pingdom.com/)

---

**Last Updated:** 2024
**Version:** 1.0.0
**Status:** Ready for Implementation
