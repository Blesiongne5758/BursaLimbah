# 🚀 Panduan Deployment ke InfinityFree - LENGKAP

## 📋 Informasi FTP Anda

```
Host:     ftpupload.net
Username: if0_43249513
Password: N0m4d3n0
Port:     21
Target:   htdocs/
```

---

## ✅ Step 1: Build Project (SUDAH SELESAI)

Build sudah berhasil! Output ada di folder `dist/`

```
✅ Total Size: ~283 KB (gzip: ~93 KB)
✅ Pages: 15 halaman (lazy loaded)
✅ Chunks: 50+ files (optimized)
```

---

## 📤 Step 2: Upload ke InfinityFree

### **Method 1: FileZilla (RECOMMENDED)**

#### 2.1 Download & Install FileZilla
1. Download: https://filezilla-project.org/download.php
2. Install FileZilla Client
3. Buka FileZilla

#### 2.2 Import Konfigurasi (Opsional)
1. File → Import
2. Pilih file `filezilla-config.xml`
3. Klik OK

#### 2.3 Manual Connection
1. **Host:** `ftpupload.net`
2. **Username:** `if0_43249513`
3. **Password:** `N0m4d3n0`
4. **Port:** `21`
5. Klik **Quickconnect**

#### 2.4 Upload Files
1. Di panel **kiri** (Local site), navigate ke folder `dist/`
2. Di panel **kanan** (Remote site), navigate ke folder `htdocs/`
3. Select **SEMUA** file dan folder di `dist/`
4. **Drag & drop** ke panel kanan
5. Tunggu upload selesai

#### 2.5 Verify Upload
Pastikan file-file ini ada di `htdocs/`:
- ✅ `index.html`
- ✅ `assets/` (folder)
- ✅ `.htaccess`
- ✅ `sitemap.xml`
- ✅ `robots.txt`

---

### **Method 2: WinSCP (Windows)**

#### 2.1 Download & Install WinSCP
1. Download: https://winscp.net/eng/download.php
2. Install WinSCP
3. Buka WinSCP

#### 2.2 Connect
1. **File protocol:** FTP
2. **Host name:** `ftpupload.net`
3. **Port number:** `21`
4. **User name:** `if0_43249513`
5. **Password:** `N0m4d3n0`
6. Klik **Login**

#### 2.3 Upload
1. Navigate ke `htdocs/` di panel kanan
2. Drag & drop semua isi folder `dist/`
3. Klik **OK** untuk konfirmasi

---

### **Method 3: Command Line (Advanced)**

#### Windows PowerShell
```powershell
# Jalankan script
.\deploy-infinityfree.ps1
```

#### Linux/Mac Bash
```bash
# Make script executable
chmod +x deploy-infinityfree.sh

# Run script
./deploy-infinityfree.sh
```

#### Manual FTP Command
```bash
ftp ftpupload.net
# Username: if0_43249513
# Password: N0m4d3n0
cd htdocs
lcd dist
binary
prompt
mput *
bye
```

---

### **Method 4: InfinityFree File Manager**

#### 2.1 Login ke Control Panel
1. Buka: https://www.infinityfree.com/accounts
2. Login dengan akun InfinityFree Anda
3. Pilih hosting account

#### 2.2 Buka File Manager
1. Klik **File Manager**
2. Navigate ke folder `htdocs/`

#### 2.3 Upload ZIP
1. Compress folder `dist/` menjadi ZIP:
   ```bash
   # Windows
   cd dist
   powershell Compress-Archive -Path .\* -DestinationPath ..\deploy.zip
   
   # Linux/Mac
   cd dist
   zip -r ../deploy.zip .
   ```

2. Upload file `deploy.zip` ke `htdocs/`
3. Extract ZIP file
4. Hapus file ZIP setelah extract

---

## 🔧 Step 3: Konfigurasi .htaccess

Pastikan file `.htaccess` ada di root `htdocs/` dengan isi:

```apache
RewriteEngine On
RewriteBase /

# Redirect all requests to index.html (SPA routing)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Security headers
<IfModule mod_headers.c>
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript application/json
</IfModule>

# Browser caching
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/html "access plus 0 seconds"
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
```

**File ini sudah otomatis ter-copy saat build!**

---

## 🧪 Step 4: Test Website

### 4.1 Akses Website
Buka browser dan akses:
```
https://your-domain.infinityfreeapp.com
```

### 4.2 Test Checklist
- [ ] Homepage loads
- [ ] Navigation works
- [ ] All pages accessible
- [ ] No 404 errors
- [ ] Images load
- [ ] Console no errors (F12)

### 4.3 Test Connection Page
1. Login sebagai admin:
   - Email: `admin@bursalimbah.com`
   - Password: `password123`
2. Klik menu **Admin** → **Test Koneksi**
3. Klik **Run All Tests**
4. Pastikan semua test ✅ hijau

---

## 🔐 Step 5: Konfigurasi Environment

### 5.1 Edit .env (Local Development)
```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=bursalimbah-upload
VITE_CLOUDINARY_API_KEY=your-api-key
```

### 5.2 Rebuild & Re-upload
```bash
npm run build
# Upload ulang folder dist/ ke InfinityFree
```

---

## 🆘 Troubleshooting

### Problem 1: 404 Error saat refresh

**Solusi:**
1. Pastikan `.htaccess` ada di root `htdocs/`
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

### Problem 2: FTP Connection Failed

**Solusi:**
1. Check credentials:
   - Host: `ftpupload.net`
   - Username: `if0_43249513`
   - Password: `N0m4d3n0`
   - Port: `21`
2. Try passive mode di FTP client
3. Check firewall tidak block FTP
4. Try different FTP client (FileZilla recommended)

### Problem 3: Files Not Showing

**Solusi:**
1. Verify files uploaded to `htdocs/` (bukan subfolder)
2. Check file permissions (should be 644 for files, 755 for folders)
3. Refresh File Manager
4. Check file names (case-sensitive)

### Problem 4: CSS/JS Not Loading

**Solusi:**
1. Check `assets/` folder exists
2. Verify paths in `index.html`
3. Clear browser cache
4. Check console for 404 errors

### Problem 5: Slow Loading

**Solusi:**
1. Enable gzip compression di `.htaccess`
2. Set proper cache headers
3. Optimize images
4. Use CDN (Cloudinary sudah otomatis)

---

## 📊 Monitoring

### InfinityFree Stats
1. Login ke control panel
2. Go to **Statistics**
3. Monitor:
   - Visitors
   - Bandwidth usage
   - Disk usage
   - Error logs

### Console Monitoring
1. Buka browser DevTools (F12)
2. Tab **Console**
3. Check for errors
4. Tab **Network**
5. Monitor loading times

---

## ✅ Success Criteria

Deployment berhasil jika:
- ✅ Website accessible via HTTPS
- ✅ All pages load correctly
- ✅ No 404 errors
- ✅ No console errors
- ✅ Navigation works
- ✅ Performance acceptable (< 3s load)
- ✅ Mobile responsive

---

## 📞 Support

### InfinityFree Support
- Knowledge Base: https://www.infinityfree.com/knowledgebase
- Forum: https://forum.infinityfree.com

### FTP Issues
- FileZilla Forum: https://forum.filezilla-project.org/
- WinSCP Forum: https://winscp.net/forum/

---

## 🎉 Congratulations!

Website Anda sekarang live di:
**https://your-domain.infinityfreeapp.com**

### Demo Accounts:
- **Admin:** admin@bursalimbah.com / password123
- **Seller:** budi@plastikjaya.com / password123
- **Buyer:** siti@greencycle.id / password123

---

**Last Updated:** 2024  
**Status:** ✅ Ready to Deploy

**Good luck!** 🚀
