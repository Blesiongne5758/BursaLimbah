# 🗄️ Supabase Setup Guide

## 📋 Overview

Panduan lengkap setup Supabase untuk BursaLimbah.com

---

## 🚀 Step 1: Create Supabase Project

### 1.1 Sign Up / Login

1. Go to: https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (recommended) or Email

### 1.2 Create New Project

1. Click "New Project"
2. Fill in:
   - **Name:** `bursalimbah`
   - **Database Password:** (save this!)
   - **Region:** Southeast Asia (Singapore) - for best performance in Indonesia
   - **Pricing Plan:** Free (for development)
3. Click "Create new project"
4. Wait for project to initialize (~2 minutes)

---

## 🔑 Step 2: Get Credentials

### 2.1 Project URL

1. Go to Project Settings → General
2. Copy **Project URL**
   ```
   https://xxxxx.supabase.co
   ```

### 2.2 Anon Key

1. Go to Project Settings → API
2. Copy **anon public** key
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 2.3 Service Role Key (Optional - for backend)

1. Go to Project Settings → API
2. Copy **service_role** key (keep this secret!)

---

## 🗃️ Step 3: Setup Database Schema

### 3.1 Run SQL Schema

1. Go to SQL Editor (icon di sidebar)
2. Click "New query"
3. Copy isi file `supabase/schema.sql`
4. Paste ke SQL Editor
5. Click "Run" (atau Ctrl+Enter)
6. Tunggu sampai selesai

### 3.2 Verify Tables

1. Go to Table Editor
2. Check tables created:
   - ✅ users
   - ✅ company_info
   - ✅ listings
   - ✅ bookings
   - ✅ validations
   - ✅ conversations
   - ✅ conversation_participants
   - ✅ messages
   - ✅ wallets
   - ✅ wallet_transactions
   - ✅ feature_flags
   - ✅ file_records
   - ✅ audit_logs

### 3.3 Verify RLS Policies

1. Go to Authentication → Policies
2. Check policies enabled for all tables

---

## 🔐 Step 4: Configure Authentication

### 4.1 Enable Email Auth

1. Go to Authentication → Providers
2. Enable "Email"
3. Configure:
   - Confirm email: **Disable** (for development)
   - Or setup email template

### 4.2 Configure URL

1. Go to Authentication → URL Configuration
2. Add site URL:
   ```
   https://your-domain.infinityfreeapp.com
   ```
3. Add redirect URLs:
   ```
   https://your-domain.infinityfreeapp.com/**
   http://localhost:3000/**
   ```

### 4.3 (Optional) Enable OAuth

For Google/GitHub login:

1. Go to Authentication → Providers
2. Enable "Google" or "GitHub"
3. Follow setup instructions
4. Add credentials

---

## 🪣 Step 5: Configure Storage (Optional)

**Note:** We use Cloudinary for file storage, but Supabase Storage can be used as backup.

### 5.1 Create Buckets

1. Go to Storage
2. Click "New bucket"
3. Create buckets:
   - `public-files` (public access)
   - `private-files` (private access)

### 5.2 Configure Policies

```sql
-- Public bucket
CREATE POLICY "Public files are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'public-files');

-- Private bucket
CREATE POLICY "Users can view their own private files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'private-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## 🎯 Step 6: Configure Environment

### 6.1 Create .env File

```bash
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 6.2 Test Connection

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Test connection
const { data, error } = await supabase.from('users').select('*').limit(1);
console.log('Connection test:', { data, error });
```

---

## 🧪 Step 7: Test Database

### 7.1 Insert Test User

```sql
INSERT INTO users (email, name, role, membership_tier, kyc_status, city, province)
VALUES (
  'test@example.com',
  'Test User',
  'USER',
  'PERSONAL',
  'VERIFIED',
  'Jakarta',
  'DKI Jakarta'
);
```

### 7.2 Insert Test Listing

```sql
INSERT INTO listings (
  seller_id,
  category,
  title,
  description,
  quantity,
  unit,
  base_price,
  city,
  province,
  status
)
VALUES (
  (SELECT id FROM users WHERE email = 'test@example.com'),
  'PLASTIC',
  'Limbah Plastik PP Grade A',
  'Limbah plastik dari pabrik kemasan makanan. Kondisi bersih.',
  5000,
  'kg',
  4500,
  'Surabaya',
  'Jawa Timur',
  'PUBLISHED'
);
```

### 7.3 Query Test

```sql
-- Get all listings
SELECT * FROM listings WHERE status = 'PUBLISHED';

-- Get user's listings
SELECT * FROM listings WHERE seller_id = (SELECT id FROM users WHERE email = 'test@example.com');

-- Get feature flags
SELECT * FROM feature_flags WHERE enabled = true;
```

---

## 📊 Step 8: Monitor Usage

### 8.1 Dashboard Metrics

Go to Project Dashboard to monitor:
- API requests
- Database queries
- Auth events
- Storage usage

### 8.2 Logs

Go to Logs to check:
- API logs
- Auth logs
- Database logs
- Edge function logs

### 8.3 Usage Limits (Free Tier)

- **Database:** 500 MB
- **Storage:** 1 GB
- **Bandwidth:** 2 GB/month
- **Auth:** 50,000 MAU
- **Edge Functions:** 500K invocations/month

---

## 🔧 Troubleshooting

### Problem: Connection Error

**Solusi:**
```typescript
// Check credentials
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY);

// Test connection
const { error } = await supabase.from('users').select('*').limit(1);
if (error) console.error('Connection error:', error);
```

### Problem: RLS Policy Error

**Solusi:**
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Enable RLS if needed
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

### Problem: CORS Error

**Solusi:**
1. Go to Authentication → URL Configuration
2. Add your domain to "Allowed origins"
3. Save changes

---

## 📚 Resources

- **Supabase Docs:** https://supabase.com/docs
- **JavaScript Client:** https://supabase.com/docs/reference/javascript
- **SQL Reference:** https://supabase.com/docs/guides/database
- **RLS Guide:** https://supabase.com/docs/guides/auth/row-level-security

---

## ✅ Checklist

- [ ] Supabase project created
- [ ] Credentials copied
- [ ] SQL schema executed
- [ ] Tables verified
- [ ] RLS policies enabled
- [ ] Authentication configured
- [ ] Environment variables set
- [ ] Connection tested
- [ ] Test data inserted
- [ ] Monitoring setup

---

**Last Updated:** 2024  
**Status:** ✅ Ready
