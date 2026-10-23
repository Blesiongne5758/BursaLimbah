# 🚀 Panduan Deployment Lengkap - InfinityFree + Supabase + Cloudinary

## 📋 Overview

Panduan lengkap untuk deploy BursaLimbah.com ke:
- **Frontend:** InfinityFree.com (Free PHP hosting)
- **Database:** Supabase (Free PostgreSQL)
- **File Storage:** Cloudinary (Free tier)

**Status:** ✅ Build Successful  
**Bundle Size:** ~282 KB (gzip: ~93 KB)  
**Pages:** 14 halaman (lazy loaded)

---

## 🎯 Step-by-Step Deployment

### Step 1: Setup Supabase Database (10 menit)

#### 1.1 Buat Account Supabase
1. Buka https://supabase.com
2. Klik "Start your project"
3. Login dengan GitHub atau Email
4. Klik "New Project"

#### 1.2 Konfigurasi Project
- **Name:** `bursalimbah`
- **Database Password:** (buat password yang kuat, simpan!)
- **Region:** Southeast Asia (Singapore) - untuk performa terbaik di Indonesia
- **Pricing Plan:** Free

#### 1.3 Jalankan SQL Schema
1. Setelah project dibuat, buka **SQL Editor** (icon di sidebar kiri)
2. Klik "New query"
3. Copy **SEMUA** isi file `supabase/schema.sql`
4. Paste ke SQL Editor
5. Klik **Run** (atau tekan Ctrl+Enter)
6. Tunggu sampai selesai (~30 detik)

#### 1.4 Verifikasi Tables
1. Buka **Table Editor** (icon di sidebar)
2. Pastikan semua tables sudah dibuat:
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

#### 1.5 Copy Credentials
1. Buka **Settings** → **API**
2. Copy dan simpan:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

### Step 2: Setup Cloudinary Storage (5 menit)

#### 2.1 Buat Account Cloudinary
1. Buka https://cloudinary.com
2. Klik "Sign Up for Free"
3. Isi form registrasi
4. Verify email

#### 2.2 Buat Upload Preset
1. Login ke Dashboard
2. Klik **Settings** (icon gear) → **Upload**
3. Scroll ke bagian **Upload presets**
4. Klik **Add upload preset**
5. Konfigurasi:
   - **Preset name:** `bursalimbah-upload`
   - **Signing Mode:** `Unsigned` (PENTING!)
   - **Folder:** `bursalimbah`
   - **Auto tagging:** Enable
   - **Context metadata:** Enable
6. Klik **Save**

#### 2.3 Copy Credentials
1. Di halaman utama Dashboard, copy:
   - **Cloud Name:** `your-cloud-name`
   - **API Key:** `123456789012345`
   - **API Secret:** (simpan, tapi tidak perlu untuk frontend)

---

### Step 3: Setup InfinityFree Hosting (5 menit)

#### 3.1 Buat Account InfinityFree
1. Buka https://infinityfree.com
2. Klik "Free Account"
3. Isi form registrasi
4. Verify email

#### 3.2 Buat Hosting Account
1. Login ke control panel
2. Klik "Create Account"
3. Pilih:
   - **Free Subdomain:** `bursalimbah.infinityfreeapp.com` (atau custom domain)
   - **Account Password:** (buat password, simpan!)
4. Tunggu account aktif (~1 menit)

#### 3.3 Catat FTP Credentials
1. Di control panel, buka **Account Details**
2. Catat:
   - **FTP Host:** `ftpupload.net` (atau yang tertera)
   - **FTP Username:** `if0_xxxxxxx`
   - **FTP Password:** (password yang Anda buat)

---

### Step 4: Konfigurasi Environment (2 menit)

#### 4.1 Edit File .env
Buka file `.env` di root project, isi dengan credentials Anda:

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=bursalimbah-upload
VITE_CLOUDINARY_API_KEY=123456789012345

# Feature Flags
VITE_ENABLE_AI_CHAT=true
VITE_ENABLE_ESCROW=true
VITE_ENABLE_KYC=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_CRYPTO_WALLET=false
```

**PENTING:** Ganti semua nilai dengan credentials Anda!

#### 4.2 Test Local
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Buka browser: http://localhost:3000
# Klik menu Admin → Test Koneksi
# Klik "Run All Tests"
```

Jika semua test ✅ hijau, berarti konfigurasi sudah benar!

---

### Step 5: Build & Deploy (5 menit)

#### 5.1 Build Production
```bash
npm run build
```

Output akan ada di folder `dist/`

#### 5.2 Upload ke InfinityFree

**Option A: Via FTP Client (FileZilla) - RECOMMENDED**

1. Download FileZilla: https://filezilla-project.org
2. Install dan buka FileZilla
3. Isi credentials:
   - **Host:** `ftpupload.net` (dari Account Details)
   - **Username:** `if0_xxxxxxx`
   - **Password:** (password FTP Anda)
   - **Port:** 21
4. Klik **Quickconnect**
5. Di panel kanan, navigate ke folder `htdocs/`
6. Di panel kiri, navigate ke folder `dist/` di project Anda
7. Select **SEMUA** file dan folder di `dist/`
8. Drag ke panel kanan (folder `htdocs/`)
9. Tunggu upload selesai

**Option B: Via File Manager (Control Panel)**

1. Login ke InfinityFree control panel
2. Klik **File Manager**
3. Navigate ke folder `htdocs/`
4. Klik **Upload**
5. Compress folder `dist/` jadi ZIP:
   ```bash
   # Windows
   cd dist
   powershell Compress-Archive -Path .\* -DestinationPath ..\deploy.zip
   
   # Linux/Mac
   cd dist
   zip -r ../deploy.zip .
   ```
6. Upload file `deploy.zip`
7. Klik **Extract** untuk extract ZIP

#### 5.3 Verify .htaccess
Pastikan file `.htaccess` ada di root `htdocs/`. File ini sudah otomatis ter-copy saat build.

Isi file `.htaccess`:
```apache
RewriteEngine On
RewriteBase /
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

---

### Step 6: Test Website (2 menit)

#### 6.1 Akses Website
Buka browser dan akses:
```
https://bursalimbah.infinityfreeapp.com
```
(atau domain Anda)

#### 6.2 Test Fitur
- ✅ Homepage loads
- ✅ Navigation works
- ✅ Browse marketplace
- ✅ Click listing detail
- ✅ Login/Register (jika sudah setup auth)
- ✅ Upload images (Cloudinary)
- ✅ Database operations (Supabase)

#### 6.3 Test Connection Page
1. Login sebagai admin (email: `admin@bursalimbah.com`, password: `password123`)
2. Klik menu **Admin** → **Test Koneksi**
3. Klik **Run All Tests**
4. Pastikan semua test ✅ hijau

---

## 🔧 Troubleshooting

### Problem: 404 Error saat refresh halaman

**Solusi:**
1. Pastikan file `.htaccess` ada di root `htdocs/`
2. Check isi `.htaccess`:
   ```apache
   RewriteEngine On
   RewriteBase /
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]
   ```
3. Tunggu 5 menit (InfinityFree cache)
4. Clear browser cache (Ctrl+Shift+R)

### Problem: CORS Error saat akses Supabase

**Solusi:**
1. Buka Supabase Dashboard → **Authentication** → **URL Configuration**
2. Tambahkan domain InfinityFree ke **Site URL**:
   ```
   https://bursalimbah.infinityfreeapp.com
   ```
3. Tambahkan ke **Redirect URLs**:
   ```
   https://bursalimbah.infinityfreeapp.com/**
   http://localhost:3000/**
   ```
4. Save changes

### Problem: Cloudinary Upload Gagal

**Solusi:**
1. Check upload preset adalah **Unsigned** (bukan Signed)
2. Verify Cloud Name benar
3. Check API Key valid
4. Test di Test Connection Page

### Problem: Database Connection Error

**Solusi:**
1. Verify `VITE_SUPABASE_URL` benar (tanpa trailing slash)
2. Check `VITE_SUPABASE_ANON_KEY` valid
3. Ensure SQL schema sudah dijalankan
4. Test di Test Connection Page

### Problem: Website lambat

**Solusi:**
1. Enable gzip compression di `.htaccess`:
   ```apache
   <IfModule mod_deflate.c>
     AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript
   </IfModule>
   ```
2. Set cache headers:
   ```apache
   <IfModule mod_expires.c>
     ExpiresActive On
     ExpiresByType text/html "access plus 0 seconds"
     ExpiresByType text/css "access plus 1 year"
     ExpiresByType application/javascript "access plus 1 year"
     ExpiresByType image/jpeg "access plus 1 year"
     ExpiresByType image/png "access plus 1 year"
   </IfModule>
   ```

---

## 📊 Monitoring

### Supabase Dashboard
- **Database:** Query performance, connections
- **Auth:** Login attempts, user management
- **Logs:** API requests, errors

### Cloudinary Dashboard
- **Storage:** Total storage used
- **Bandwidth:** Monthly usage
- **Transformations:** Number of transformations

### InfinityFree Stats
- **Traffic:** Visitors, page views
- **Bandwidth:** Monthly usage
- **Disk:** Storage usage

---

## 📝 Checklist Deployment

### Pre-Deployment
- [ ] Supabase account created
- [ ] SQL schema executed
- [ ] Tables verified (13 tables)
- [ ] RLS policies enabled
- [ ] Cloudinary account created
- [ ] Upload preset created (unsigned)
- [ ] InfinityFree account created
- [ ] FTP credentials noted
- [ ] `.env` file configured
- [ ] Local test successful

### Build
- [ ] `npm install` successful
- [ ] `npm run build` successful
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Bundle size optimized (~282 KB)

### Upload
- [ ] Files uploaded to InfinityFree
- [ ] `.htaccess` in place
- [ ] Permissions correct (755 for folders, 644 for files)
- [ ] index.html accessible

### Testing
- [ ] Homepage loads
- [ ] Navigation works
- [ ] Auth works (login/register)
- [ ] Marketplace loads
- [ ] Listing detail works
- [ ] File upload works (Cloudinary)
- [ ] Database operations work (Supabase)
- [ ] Test Connection Page all green

### Post-Deployment
- [ ] SSL certificate active (HTTPS)
- [ ] Custom domain configured (optional)
- [ ] Monitoring setup
- [ ] Backup strategy defined

---

## 🎉 Success!

Jika semua langkah berhasil, website Anda live di:
**https://bursalimbah.infinityfreeapp.com**

### Demo Accounts:
- **Admin:** admin@bursalimbah.com / password123
- **Seller:** budi@plastikjaya.com / password123
- **Buyer:** siti@greencycle.id / password123

### Features:
- ✅ 14 halaman (lazy loaded)
- ✅ Supabase database (13 tables)
- ✅ Cloudinary file storage
- ✅ AI Chat Assistant
- ✅ Escrow Payment
- ✅ Blockchain Wallet
- ✅ Admin Configuration
- ✅ Feature Flags

---

## 📚 Resources

### Documentation
- **Quick Start:** `QUICK_START.md`
- **Supabase Setup:** `SUPABASE_SETUP.md`
- **Cloudinary Setup:** `CLOUDINARY_SETUP.md`
- **Full Deployment:** `DEPLOYMENT_INFINITYFREE.md`

### External Resources
- **Supabase Docs:** https://supabase.com/docs
- **Cloudinary Docs:** https://cloudinary.com/documentation
- **InfinityFree:** https://infinityfree.com/knowledgebase

---

## 🆘 Support

Jika ada masalah:
1. Check Test Connection Page (Admin → Test Koneksi)
2. Review error messages di browser console (F12)
3. Check Supabase logs di dashboard
4. Check Cloudinary logs di dashboard
5. Review dokumentasi di folder `docs/`

---

**Last Updated:** 2024  
**Version:** 2.0.0  
**Status:** ✅ Production Ready

**Developed with 🌿 in Indonesia**
