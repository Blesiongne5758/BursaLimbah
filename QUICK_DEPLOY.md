# 🚀 QUICK DEPLOYMENT GUIDE

## FTP Credentials
```
Host:     ftpupload.net
Username: if0_43249513
Password: N0m4d3n0
Port:     21
Path:     htdocs/
```

## Quick Deploy (3 Steps)

### Step 1: Build (SUDAH SELESAI ✅)
```bash
npm run build
```

### Step 2: Upload via FileZilla
1. Download FileZilla: https://filezilla-project.org
2. Connect:
   - Host: `ftpupload.net`
   - User: `if0_43249513`
   - Pass: `N0m4d3n0`
   - Port: `21`
3. Navigate to `htdocs/`
4. Upload ALL files from `dist/` folder

### Step 3: Verify
Visit: `https://your-domain.infinityfreeapp.com`

---

## Alternative Methods

### Method A: WinSCP (Windows)
```powershell
.\deploy-infinityfree.ps1
```

### Method B: Command Line (Linux/Mac)
```bash
chmod +x deploy-infinityfree.sh
./deploy-infinityfree.sh
```

### Method C: File Manager
1. Login ke InfinityFree control panel
2. Go to File Manager → htdocs/
3. Upload `deploy.zip` (compress dist/ folder)
4. Extract

---

## Troubleshooting

**404 Error?**
- Check `.htaccess` exists in htdocs/
- Wait 5 minutes for cache
- Clear browser cache (Ctrl+Shift+R)

**FTP Failed?**
- Verify credentials
- Try passive mode
- Use FileZilla (recommended)

**Files Not Showing?**
- Upload to `htdocs/` (not subfolder)
- Check permissions (644 files, 755 folders)

---

## Test After Deploy

1. Visit website
2. Test navigation
3. Login as admin:
   - Email: admin@bursalimbah.com
   - Password: password123
4. Go to Admin → Test Koneksi
5. Run All Tests

---

## Success! 🎉

Website live at: `https://your-domain.infinityfreeapp.com`

**Full Guide:** See `DEPLOY_INSTRUCTIONS.md`
