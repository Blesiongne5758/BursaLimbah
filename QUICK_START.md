# 🚀 Quick Start - InfinityFree + Supabase + Cloudinary

## 📋 Persiapan Akun

### 1. InfinityFree (Hosting)
1. Daftar: https://www.infinityfree.com
2. Buat hosting account
3. Catat FTP credentials

### 2. Supabase (Database)
1. Daftar: https://supabase.com
2. Buat project baru
3. Copy credentials:
   - Project URL
   - Anon Key

### 3. Cloudinary (File Storage)
1. Daftar: https://cloudinary.com
2. Buat upload preset (unsigned)
3. Copy credentials:
   - Cloud Name
   - Upload Preset

---

## 🔧 Setup Database (Supabase)

### Step 1: Jalankan SQL Schema

1. Login ke Supabase Dashboard
2. Go to SQL Editor
3. Copy isi file `supabase/schema.sql`
4. Paste dan klik "Run"
5. Tunggu sampai selesai

### Step 2: Verifikasi Tables

Check di Table Editor:
- ✅ users
- ✅ listings
- ✅ bookings
- ✅ wallets
- ✅ feature_flags
- ✅ file_records
- dll.

---

## 🎨 Setup Cloudinary

### Step 1: Buat Upload Preset

1. Dashboard → Settings → Upload
2. Scroll ke "Upload presets"
3. Click "Add upload preset"
4. Configure:
   - **Name:** `bursalimbah-upload`
   - **Signing Mode:** Unsigned
   - **Folder:** `bursalimbah`
5. Save

### Step 2: Catat Credentials

- Cloud Name: `your-cloud-name`
- Upload Preset: `bursalimbah-upload`

---

## 🔐 Setup Environment Variables

### Buat file `.env` di root project:

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

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

**Ganti dengan credentials Anda!**

---

## 🏗️ Build & Deploy

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Test Local

```bash
npm run dev
```

Buka http://localhost:3000 dan test:
- ✅ Landing page loads
- ✅ Navigation works
- ✅ Login/Register (jika sudah setup auth)

### Step 3: Build Production

```bash
npm run build
```

Output akan ada di folder `dist/`

### Step 4: Upload ke InfinityFree

**Option A: Via FTP (FileZilla)**

1. Download FileZilla: https://filezilla-project.org
2. Connect ke FTP server InfinityFree
3. Navigate ke folder `htdocs/`
4. Upload semua isi folder `dist/`

**Option B: Via File Manager**

1. Login ke InfinityFree control panel
2. Go to File Manager
3. Navigate ke `htdocs/`
4. Compress folder `dist/` jadi ZIP
5. Upload ZIP file
6. Extract ZIP

### Step 5: Verify .htaccess

Pastikan file `.htaccess` ada di root `htdocs/`:

```apache
RewriteEngine On
RewriteBase /
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

File ini sudah otomatis ter-copy saat build.

---

## 🧪 Testing

### Test Website

1. Buka domain InfinityFree Anda
2. Test fitur:
   - ✅ Homepage loads
   - ✅ Navigation works
   - ✅ Browse marketplace
   - ✅ Upload images (Cloudinary)
   - ✅ Database operations (Supabase)

### Test Console

Buka DevTools (F12) dan check:
- ✅ No errors
- ✅ Supabase connection OK
- ✅ Cloudinary upload OK

---

## 📊 Monitoring

### Supabase Dashboard
- Database queries
- Auth logs
- API requests

### Cloudinary Dashboard
- Upload count
- Storage usage
- Bandwidth

### InfinityFree Stats
- Traffic
- Bandwidth
- Disk usage

---

## 🔧 Troubleshooting

### Problem: 404 Error saat refresh

**Solusi:**
```bash
# Pastikan .htaccess ada di htdocs/
# Isi file:
RewriteEngine On
RewriteBase /
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### Problem: CORS Error

**Solusi:**
1. Supabase Dashboard → Authentication → URL Configuration
2. Tambahkan domain InfinityFree ke "Allowed origins"
3. Contoh: `https://your-domain.infinityfreeapp.com`

### Problem: Cloudinary Upload Gagal

**Solusi:**
- Check upload preset adalah "Unsigned"
- Verify cloud name benar
- Check API key valid

### Problem: Database Connection Error

**Solusi:**
- Verify `VITE_SUPABASE_URL` benar
- Check `VITE_SUPABASE_ANON_KEY` valid
- Ensure SQL schema sudah dijalankan

---

## 📝 Checklist Deployment

### Pre-Deployment
- [ ] Supabase project created
- [ ] SQL schema executed
- [ ] Cloudinary account created
- [ ] Upload preset created
- [ ] InfinityFree account created
- [ ] `.env` file configured

### Build
- [ ] `npm install` successful
- [ ] `npm run build` successful
- [ ] No errors in console
- [ ] Bundle size optimized

### Upload
- [ ] Files uploaded to InfinityFree
- [ ] `.htaccess` in place
- [ ] Permissions correct

### Testing
- [ ] Homepage loads
- [ ] Navigation works
- [ ] Auth works
- [ ] Database queries work
- [ ] File uploads work

---

## 🎉 Success!

Jika semua test berhasil, website Anda live di:
**https://your-domain.infinityfreeapp.com**

---

## 📚 Resources

- **InfinityFree Docs:** https://www.infinityfree.com/knowledgebase
- **Supabase Docs:** https://supabase.com/docs
- **Cloudinary Docs:** https://cloudinary.com/documentation

---

**Need Help?**
Check `DEPLOYMENT_INFINITYFREE.md` untuk panduan lengkap.
