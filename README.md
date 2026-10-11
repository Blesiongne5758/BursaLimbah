# 🌿 BursaLimbah.com

**Marketplace Perdagangan Limbah B2B & B2C Terpercaya di Indonesia**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)]()
[![License](https://img.shields.io/badge/license-proprietary-red)]()
[![Indonesia](https://img.shields.io/badge/made%20in-Indonesia-red)]()

BursaLimbah.com adalah platform marketplace yang mempertemukan penjual dan pembeli limbah di Indonesia. Dilengkapi dengan sistem escrow payment, AI assistant, enkripsi lokasi, dan compliance regulasi KLHK.

![BursaLimbah Preview](https://img.shields.io/badge/preview-live-emerald?style=for-the-badge)

## ✨ Fitur Utama

### 🏪 Marketplace
- Browse ribuan listing limbah dari seluruh Indonesia
- Filter berdasarkan kategori, lokasi, dan harga
- 9 kategori limbah: Plastik, Kertas, Logam, Elektronik, Organik, B3, Industri, Tekstil, Konstruksi
- Sistem rating & review untuk seller

### 🔒 Privasi & Keamanan
- **Enkripsi AES-256-GCM** untuk koordinat GPS seller
- Lokasi hanya ditampilkan sebagai kota & provinsi (publik)
- Lokasi detail terbuka **hanya setelah booking + DP**
- Compliant dengan **UU PDP No. 27/2023**
- Audit trail untuk setiap akses data

### 🤖 AI Assistant (GPT-4o)
- Chat assistant context-aware
- Auto-fill listing dari foto + deskripsi
- Interest-based search ("cari limbah plastik PP di Jawa Timur")
- Price calculator & market benchmark
- Compliance checker untuk regulasi KLHK
- Location export ke Google Maps/Waze

### 💰 Escrow Payment System
- DP 30% ditahan di escrow (configurable)
- Integrasi Midtrans Snap + Xendit
- Release dana otomatis setelah validasi
- Platform fee 2-5% (tergantung tier)
- Dispute resolution mechanism

### 📦 Shipping Integration
- Kalkulasi ongkir via RajaOngkir
- Tracking shipment real-time
- Support multiple courier (JNE, SiCepat, Anteraja)
- Self-pickup option dengan lokasi terdekripsi

### 📊 Dashboard
- Overview statistik & aktivitas terbaru
- CRUD listing dengan AI enhancement
- Manajemen booking dengan timeline visual
- Wallet dengan riwayat transaksi
- Laporan penjualan (PDF/Excel export)
- Settings & KYC verification

### 👥 Membership Tiers

| Fitur | Personal | Small Business | Corporate |
|-------|----------|----------------|-----------|
| Max Listing | 5 | 25 | Unlimited |
| Negosiasi/bulan | 20 | 100 | Unlimited |
| AI Chat | Basic | Full | Full + Custom |
| Riwayat Transaksi | ❌ | ✅ | ✅ |
| Bulk Upload | ❌ | ✅ | ✅ |
| Export Laporan | ❌ | ✅ | ✅ |
| Priority Listing | ❌ | ❌ | ✅ |
| Dedicated Manager | ❌ | ❌ | ✅ |
| API Access | ❌ | ❌ | ✅ |
| Custom SLA | ❌ | ❌ | ✅ |

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18 + Vite
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS 4
- **State Management:** Zustand
- **Animation:** Framer Motion
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod

### Backend (Architecture)
- **Auth:** NextAuth.js v5 (Auth.js)
- **API:** tRPC v11 + Next.js API Routes
- **ORM:** Prisma (PostgreSQL)
- **Queue:** BullMQ + Redis
- **Realtime:** Supabase Realtime

### Integrations
- **Payment:** Midtrans Snap + Xendit
- **Shipping:** RajaOngkir + Shipper.id
- **AI:** OpenAI GPT-4o (Vercel AI SDK)
- **Maps:** Mapbox GL JS + Google Maps
- **Storage:** Cloudinary + AWS S3
- **Monitoring:** Sentry + Vercel Analytics

### Infrastructure
- **Hosting:** Vercel (Edge)
- **Database:** Supabase PostgreSQL (RLS)
- **Cache:** Upstash Redis
- **CDN:** Cloudflare
- **CI/CD:** GitHub Actions

## 📁 Project Structure

```
bursalimbah/
├── src/
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Entry point
│   ├── index.css            # Global styles + Tailwind
│   ├── types.ts             # TypeScript types + Prisma schema
│   ├── data.ts              # Mock data
│   ├── store.ts             # Zustand state management
│   ├── components/
│   │   └── ui.tsx           # Reusable UI components
│   └── services/
│       └── index.ts         # Service layer (Auth, Payment, AI, etc.)
├── public/                  # Static assets
├── index.html               # HTML entry
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── vite.config.js           # Vite config
├── DATABASE_SCHEMA.md       # Database documentation
└── README.md                # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/Blesiongne5758/BursaLimbah.git
cd BursaLimbah

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type check
npm run typecheck
```

### Demo Accounts

| Email | Role | Tier |
|-------|------|------|
| `budi@plastikjaya.com` | Seller | Small Business |
| `siti@greencycle.id` | Buyer | Corporate |
| `admin@bursalimbah.com` | Admin | Corporate |

## 🗄️ Database Schema

The application uses a Prisma schema with PostgreSQL. Key models:

- **User** - Core entity with role-based access
- **CompanyInfo** - KYB verification data
- **Listing** - Waste listing with privacy masking
- **Booking** - Transaction with escrow payment
- **Validation** - Post-pickup verification
- **Conversation** - Chat with AI agent support
- **ChatMessage** - Individual messages with tool calls

View the full schema visualization at `/schema` in the app.

## ⚖️ Indonesian Legal Compliance

### ✅ UU PDP No. 27/2023 (Data Protection)
- Encrypted PII at-rest
- Right to access, rectify, delete data
- Data portability API
- Consent management

### ✅ PP No. 22/2021 (Environmental Protection)
- B3 waste permit validation
- KLHK SIPSN cross-reference
- Environmental license verification

### ✅ KUHPerdata (Contract Law)
- Compliant Terms of Service
- Escrow mechanism
- Dispute resolution via BAPSI

## 🔐 Security Features

1. **Rate Limiting** - 5 login attempts / 15 minutes
2. **Password Hashing** - Argon2id
3. **JWT Tokens** - 15min access, 7 days refresh
4. **2FA** - Mandatory for Corporate tier
5. **Row-Level Security** - Database-level access control
6. **Input Validation** - Zod schemas for all inputs
7. **XSS Prevention** - DOMPurify for user content
8. **HTTPS Only** - HSTS headers
9. **CSP Headers** - Strict content security policy
10. **Audit Logging** - All data access tracked

## 📄 License

This project is proprietary software. All rights reserved.

## 🤝 Contributing

This is a private project. For inquiries, contact: info@bursalimbah.com

## 📞 Contact

- **Email:** info@bursalimbah.com
- **Phone:** +62 21-5555-BURS
- **Location:** Jakarta, Indonesia

---

**Made with 🌿 in Indonesia**

*Compliant with Indonesian regulations • Eco-friendly • Secure & Transparent*
