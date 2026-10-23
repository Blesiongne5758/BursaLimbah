# 🚀 GitHub Actions Deployment Guide

Panduan lengkap untuk setup automatic deployment dari GitHub ke InfinityFree.com

## 📋 Overview

Workflow ini akan otomatis:
1. ✅ Build project saat push ke branch `main`
2. ✅ Upload ke InfinityFree via FTP
3. ✅ Verify deployment
4. ✅ Notify status

## 🔧 Setup Instructions

### Step 1: Push Code ke GitHub

```bash
# Initialize git (jika belum)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to main branch
git branch -M main
git push -u origin main
```

### Step 2: Configure GitHub Secrets

Buka repository GitHub Anda, lalu:

1. **Settings** → **Secrets and variables** → **Actions**
2. Klik **New repository secret**
3. Tambahkan secrets berikut:

#### FTP Credentials
```
Name: FTP_USERNAME
Value: if0_43249513

Name: FTP_PASSWORD
Value: N0m4d3n0
```

#### Domain (Optional)
```
Name: DOMAIN
Value: your-domain.infinityfreeapp.com
```

#### Supabase (Jika menggunakan)
```
Name: VITE_SUPABASE_URL
Value: https://your-project.supabase.co

Name: VITE_SUPABASE_ANON_KEY
Value: your-anon-key-here
```

#### Cloudinary (Jika menggunakan)
```
Name: VITE_CLOUDINARY_CLOUD_NAME
Value: your-cloud-name

Name: VITE_CLOUDINARY_UPLOAD_PRESET
Value: your-upload-preset

Name: VITE_CLOUDINARY_API_KEY
Value: your-api-key
```

### Step 3: Enable GitHub Actions

1. Buka tab **Actions** di repository
2. Jika ada warning, klik **I understand my workflows, go ahead and enable them**
3. Workflow akan otomatis berjalan saat push ke `main`

## 📊 Workflow Details

### Trigger
- **Push ke branch `main`** - Automatic deployment
- **Manual trigger** - Via workflow_dispatch

### Jobs
1. **Build** - Install dependencies, run tests, build project
2. **Deploy** - Upload via FTP ke InfinityFree
3. **Verify** - Check deployment status
4. **Notify** - Create summary

### Environment Variables
Semua environment variables di-inject dari GitHub Secrets saat build.

## 🔍 Monitoring Deployment

### View Workflow Runs
1. Buka tab **Actions** di repository
2. Klik workflow run yang ingin dilihat
3. Lihat logs untuk detail

### Check Deployment Status
- ✅ Success: Website live
- ❌ Failure: Check logs untuk error

## 🛠️ Troubleshooting

### FTP Connection Failed
**Error:** `Connection refused` atau `Authentication failed`

**Solusi:**
1. Verify FTP credentials di GitHub Secrets
2. Check InfinityFree FTP status
3. Ensure FTP is enabled di InfinityFree control panel

### Build Failed
**Error:** `npm run build` failed

**Solusi:**
1. Check logs untuk error details
2. Test build locally: `npm run build`
3. Verify all dependencies di `package.json`

### Deployment Verification Failed
**Error:** `Website returned HTTP 000`

**Solusi:**
1. Ini normal jika domain belum configured
2. Check InfinityFree DNS settings
3. Wait 5-10 menit untuk DNS propagation

### Secrets Not Working
**Error:** Environment variables undefined

**Solusi:**
1. Verify secret names di GitHub
2. Ensure secrets di-set untuk repository yang benar
3. Re-run workflow setelah update secrets

## 📝 Manual Deployment

Jika ingin deploy manual:

1. Buka tab **Actions**
2. Pilih workflow **Deploy to InfinityFree**
3. Klik **Run workflow**
4. Pilih branch dan klik **Run workflow**

## 🔒 Security Best Practices

### Secrets Management
- ✅ Gunakan GitHub Secrets untuk credentials
- ❌ JANGAN commit `.env` file
- ❌ JANGAN hardcode credentials di code
- ✅ Rotate credentials secara berkala

### FTP Security
- ✅ Gunakan FTPS jika tersedia
- ✅ Limit FTP access di InfinityFree
- ✅ Monitor FTP logs

### Access Control
- ✅ Limit who can push to `main`
- ✅ Require pull request reviews
- ✅ Enable branch protection

## 📊 Deployment Flow

```
Push to main
    ↓
GitHub Actions Trigger
    ↓
Install Dependencies
    ↓
Run Tests
    ↓
Type Check
    ↓
Build Project
    ↓
Upload via FTP
    ↓
Verify Deployment
    ↓
Create Summary
    ↓
Website Live! 🎉
```

## 🎯 Success Criteria

Deployment berhasil jika:
- ✅ Build successful
- ✅ FTP upload complete
- ✅ Website accessible
- ✅ No console errors
- ✅ All pages working

## 📞 Support

### GitHub Actions
- Docs: https://docs.github.com/en/actions
- FTP Action: https://github.com/SamKirkland/FTP-Deploy-Action

### InfinityFree
- Support: https://www.infinityfree.com/support
- FTP Guide: https://www.infinityfree.com/knowledgebase/ftp-access

## 🔄 Workflow Customization

### Change Trigger Branch
Edit `.github/workflows/deploy.yml`:
```yaml
on:
  push:
    branches:
      - main  # Change to your branch
```

### Add Staging Environment
```yaml
on:
  push:
    branches:
      - main    # Production
      - develop # Staging
```

### Add Manual Approval
```yaml
jobs:
  deploy:
    environment: production  # Require approval
```

## 📈 Optimization Tips

### Speed Up Build
- ✅ Use `npm ci` instead of `npm install`
- ✅ Cache node_modules
- ✅ Skip tests if not needed

### Reduce Deployment Time
- ✅ Use `dangerous-clean-slate: false`
- ✅ Exclude unnecessary files
- ✅ Compress assets

### Monitor Performance
- ✅ Check workflow duration
- ✅ Monitor build size
- ✅ Track deployment frequency

## 🎉 You're Ready!

Workflow sudah configured. Sekarang:

1. ✅ Push code ke GitHub
2. ✅ Configure secrets
3. ✅ Enable Actions
4. ✅ Push to main
5. ✅ Watch deployment! 🚀

## 📚 Additional Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [FTP Deploy Action](https://github.com/SamKirkland/FTP-Deploy-Action)
- [InfinityFree FTP](https://www.infinityfree.com/knowledgebase/ftp-access)
- [Vite Build](https://vitejs.dev/guide/build.html)

---

**Last Updated:** 2024  
**Status:** ✅ Ready to Deploy
