# 🚀 Panduan Deployment - InfinityFree + Supabase + Cloudinary

## 📋 Overview

Panduan lengkap untuk deploy BursaLimbah.com menggunakan:
- **Frontend Hosting:** InfinityFree.com (Free PHP hosting)
- **Database & Auth:** Supabase (Free tier)
- **File Storage:** Cloudinary (Free tier)

---

## 🎯 Prerequisites

### 1. InfinityFree Account
- Daftar di: https://www.infinityfree.com
- Buat hosting account
- Catat FTP credentials

### 2. Supabase Account
- Daftar di: https://supabase.com
- Buat project baru
- Catat credentials:
  - Project URL
  - Anon Key
  - Service Role Key (untuk backend)

### 3. Cloudinary Account
- Daftar di: https://cloudinary.com
- Buat upload preset (unsigned)
- Catat credentials:
  - Cloud Name
  - Upload Preset
  - API Key

---

## 🔧 Step 1: Setup Supabase Database

### 1.1 Buat Database Tables

Login ke Supabase Dashboard → SQL Editor, lalu jalankan:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'USER',
  membership_tier TEXT DEFAULT 'PERSONAL',
  kyc_status TEXT DEFAULT 'PENDING',
  city TEXT,
  province TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company info table
CREATE TABLE company_info (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  npwp TEXT,
  nib TEXT,
  business_license TEXT,
  industry_sector TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listings table
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  sub_category TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  base_price DECIMAL NOT NULL,
  negotiable BOOLEAN DEFAULT true,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  encrypted_coords TEXT,
  location_hash TEXT,
  status TEXT DEFAULT 'DRAFT',
  ai_generated BOOLEAN DEFAULT false,
  price_tier TEXT DEFAULT 'BRONZE',
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES users(id),
  seller_id UUID REFERENCES users(id),
  quantity DECIMAL NOT NULL,
  price_per_kg DECIMAL NOT NULL,
  total_price DECIMAL NOT NULL,
  down_payment DECIMAL NOT NULL,
  final_price DECIMAL,
  payment_method TEXT DEFAULT 'MIDTRANS',
  escrow_status TEXT DEFAULT 'PENDING',
  pickup_method TEXT DEFAULT 'SELF',
  pickup_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'BOOKED',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wallets table (Blockchain)
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  address TEXT UNIQUE NOT NULL,
  encrypted_private_key TEXT NOT NULL,
  balance DECIMAL DEFAULT 0,
  token_balance DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wallet transactions
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  token TEXT DEFAULT 'BLW',
  tx_hash TEXT UNIQUE,
  status TEXT DEFAULT 'PENDING',
  from_address TEXT,
  to_address TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature flags
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT false,
  category TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File records
CREATE TABLE file_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  bucket TEXT NOT NULL,
  key TEXT UNIQUE NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  url TEXT,
  thumbnail_url TEXT,
  cloudinary_public_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_listings_seller ON listings(seller_id);
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_city ON listings(city);
CREATE INDEX idx_bookings_buyer ON bookings(buyer_id);
CREATE INDEX idx_bookings_seller ON bookings(seller_id);
CREATE INDEX idx_wallets_user ON wallets(user_id);
CREATE INDEX idx_file_records_user ON file_records(user_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
```

### 1.2 Setup Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Listings policies
CREATE POLICY "Listings are viewable by everyone"
  ON listings FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own listings"
  ON listings FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update their own listings"
  ON listings FOR UPDATE
  USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete their own listings"
  ON listings FOR DELETE
  USING (auth.uid() = seller_id);

-- Bookings policies
CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);
```

### 1.3 Insert Default Feature Flags

```sql
INSERT INTO feature_flags (key, name, description, category, enabled) VALUES
('marketplace_enabled', 'Marketplace', 'Aktifkan fitur marketplace', 'core', true),
('ai_chat_enabled', 'AI Chat Assistant', 'Aktifkan asisten AI', 'core', true),
('escrow_payment_enabled', 'Escrow Payment', 'Aktifkan sistem escrow', 'core', true),
('midtrans_enabled', 'Midtrans', 'Aktifkan Midtrans payment', 'payment', true),
('crypto_payment_enabled', 'Crypto Payment', 'Aktifkan pembayaran crypto', 'payment', false),
('kyc_ktp_enabled', 'KYC KTP', 'Aktifkan verifikasi KTP', 'kyc', true),
('kyc_npwp_enabled', 'KYC NPWP', 'Aktifkan verifikasi NPWP', 'kyc', true),
('shipping_enabled', 'Shipping Calculator', 'Aktifkan kalkulator ongkir', 'shipping', true),
('blockchain_wallet_enabled', 'Blockchain Wallet', 'Aktifkan wallet crypto', 'blockchain', false),
('email_notifications_enabled', 'Email Notifications', 'Aktifkan notifikasi email', 'communication', true);
```

---

## 🎨 Step 2: Setup Cloudinary

### 2.1 Buat Upload Preset

1. Login ke Cloudinary Dashboard
2. Go to Settings → Upload
3. Scroll ke "Upload presets"
4. Click "Add upload preset"
5. Configure:
   - **Preset name:** `bursalimbah-upload`
   - **Signing Mode:** Unsigned
   - **Folder:** `bursalimbah`
   - **Auto tagging:** Enable
   - **Context metadata:** Enable
6. Save

### 2.2 Catat Credentials

- **Cloud Name:** Dari dashboard
- **Upload Preset:** `bursalimbah-upload`
- **API Key:** Dari dashboard

---

## 🌐 Step 3: Setup InfinityFree

### 3.1 Buat Hosting Account

1. Login ke InfinityFree
2. Create new account
3. Pilih subdomain atau custom domain
4. Catat FTP credentials:
   - FTP Host
   - FTP Username
   - FTP Password

### 3.2 Build Frontend

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

### 3.3 Upload ke InfinityFree

**Option A: Via FTP Client (FileZilla)**

1. Download FileZilla: https://filezilla-project.org
2. Connect ke FTP server
3. Upload semua file dari folder `dist/` ke `htdocs/`

**Option B: Via File Manager**

1. Login ke InfinityFree control panel
2. Go to File Manager
3. Navigate to `htdocs/`
4. Upload zip file dari `dist/`
5. Extract zip file

### 3.4 Konfigurasi .htaccess

File `.htaccess` sudah ada di `public/.htaccess` dan akan otomatis ter-copy saat build.

Jika perlu manual, buat file `.htaccess` di root `htdocs/`:

```apache
RewriteEngine On
RewriteBase /
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

---

## 🔐 Step 4: Konfigurasi Environment

### 4.1 Buat File .env

Di root project, buat file `.env`:

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=bursalimbah-upload
VITE_CLOUDINARY_API_KEY=your-api-key

# Feature Flags
VITE_ENABLE_AI_CHAT=true
VITE_ENABLE_ESCROW=true
VITE_ENABLE_KYC=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_CRYPTO_WALLET=false
```

### 4.2 Build dengan Environment

```bash
# Build dengan environment variables
npm run build
```

Environment variables akan di-embed ke dalam JavaScript saat build.

---

## 🧪 Step 5: Testing

### 5.1 Test Local

```bash
# Start development server
npm run dev

# Test di browser
# http://localhost:3000
```

### 5.2 Test Production Build

```bash
# Build
npm run build

# Preview production build
npm run preview

# Test di browser
# http://localhost:4173
```

### 5.3 Test di InfinityFree

1. Upload build ke InfinityFree
2. Akses domain: `https://your-domain.infinityfreeapp.com`
3. Test semua fitur:
   - ✅ Landing page loads
   - ✅ Navigation works
   - ✅ Login/Register
   - ✅ Browse listings
   - ✅ Upload images (Cloudinary)
   - ✅ Database operations (Supabase)

---

## 📊 Step 6: Monitoring

### 6.1 Supabase Dashboard

Monitor:
- Database queries
- Auth logs
- Storage usage
- API requests

### 6.2 Cloudinary Dashboard

Monitor:
- Upload count
- Storage usage
- Bandwidth usage
- Transformations

### 6.3 InfinityFree Stats

Monitor:
- Traffic
- Bandwidth
- Disk usage
- Error logs

---

## 🔧 Troubleshooting

### Problem: 404 Error saat refresh

**Solusi:**
- Pastikan `.htaccess` sudah ter-upload
- Check RewriteEngine On
- Verify RewriteBase /

### Problem: CORS Error

**Solusi:**
```sql
-- Supabase Dashboard → Authentication → URL Configuration
-- Tambahkan domain InfinityFree ke allowed origins
```

### Problem: Cloudinary Upload Gagal

**Solusi:**
- Check upload preset adalah "Unsigned"
- Verify cloud name benar
- Check API key valid

### Problem: Database Connection Error

**Solusi:**
- Verify Supabase URL benar
- Check anon key valid
- Ensure RLS policies sudah di-setup

---

## 📝 Checklist Deployment

### Pre-Deployment
- [ ] Supabase project created
- [ ] Database tables created
- [ ] RLS policies enabled
- [ ] Feature flags inserted
- [ ] Cloudinary account created
- [ ] Upload preset created
- [ ] InfinityFree account created
- [ ] Environment variables configured

### Build
- [ ] `npm install` successful
- [ ] `npm run build` successful
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Bundle size optimized

### Upload
- [ ] Files uploaded to InfinityFree
- [ ] `.htaccess` in place
- [ ] Permissions correct (755 for folders, 644 for files)
- [ ] index.html accessible

### Testing
- [ ] Homepage loads
- [ ] Navigation works
- [ ] Auth works (login/register)
- [ ] Database queries work
- [ ] File uploads work
- [ ] All pages accessible

### Post-Deployment
- [ ] SSL certificate active (HTTPS)
- [ ] Custom domain configured (optional)
- [ ] Monitoring setup
- [ ] Backup strategy defined

---

## 🚀 Quick Deploy Script

```bash
#!/bin/bash

# Build
echo "Building..."
npm run build

# Create zip
echo "Creating zip..."
cd dist
zip -r ../deploy.zip .
cd ..

# Upload via FTP (requires lftp)
echo "Uploading to InfinityFree..."
lftp -u username,password ftp.yourdomain.com <<EOF
cd htdocs
mirror -R dist/ .
bye
EOF

echo "Deployment complete!"
echo "Visit: https://your-domain.infinityfreeapp.com"
```

---

## 📚 Resources

### InfinityFree
- Documentation: https://www.infinityfree.com/knowledgebase
- FTP Guide: https://www.infinityfree.com/knowledgebase/ftp-access

### Supabase
- Documentation: https://supabase.com/docs
- JavaScript Client: https://supabase.com/docs/reference/javascript

### Cloudinary
- Documentation: https://cloudinary.com/documentation
- Upload API: https://cloudinary.com/documentation/image_upload_api_reference

---

## 🎉 Success Criteria

Deployment berhasil jika:
- ✅ Website accessible via HTTPS
- ✅ All pages load correctly
- ✅ Authentication works
- ✅ Database operations work
- ✅ File uploads work
- ✅ No console errors
- ✅ Performance acceptable

---

**Last Updated:** 2024  
**Version:** 1.0.0  
**Status:** Ready for Deployment
