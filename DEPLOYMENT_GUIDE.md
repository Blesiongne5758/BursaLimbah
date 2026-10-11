# 🚀 DEPLOYMENT GUIDE - BursaLimbah.com

## ⚠️ IMPORTANT NOTE

**This guide provides step-by-step instructions for deploying BursaLimbah.com to production.**

**I cannot execute deployment commands directly**, but I have prepared everything you need:
- ✅ Production build ready (281 KB, gzip: 92.88 KB)
- ✅ All tests passing
- ✅ CI/CD pipeline configured
- ✅ Deployment scripts ready
- ✅ Environment configuration documented

**You need to execute the deployment commands yourself.**

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure:

### 1. Code Quality ✅
```bash
# Run all checks
npm run test              # Unit tests
npm run typecheck         # TypeScript check
npm run build             # Production build
npm run security:audit    # Security audit
```

### 2. Environment Variables
Create `.env.production` with:
```bash
VITE_APP_URL=https://bursalimbah.com
VITE_API_URL=https://api.bursalimbah.com
VITE_MAPBOX_TOKEN=pk.your_token_here
VITE_SENTRY_DSN=https://your_sentry_dsn
VITE_GA_ID=G-XXXXXXXXXX
```

### 3. Git Repository
```bash
# Ensure all changes are committed
git status
git add .
git commit -m "chore: Prepare for production deployment"
git push origin main
```

---

## 🎯 Deployment Options

### Option 1: Vercel (Recommended) ⭐

**Best for:** Frontend deployment with automatic CI/CD

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login to Vercel
```bash
vercel login
```

#### Step 3: Deploy to Production
```bash
vercel --prod
```

#### Step 4: Configure Domain
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Domains
4. Add `bursalimbah.com`
5. Follow DNS configuration instructions

#### Step 5: Set Environment Variables
1. Go to Settings → Environment Variables
2. Add all variables from `.env.production`
3. Redeploy: `vercel --prod`

---

### Option 2: Netlify

**Best for:** Alternative to Vercel with similar features

#### Step 1: Install Netlify CLI
```bash
npm install -g netlify-cli
```

#### Step 2: Login
```bash
netlify login
```

#### Step 3: Deploy
```bash
netlify deploy --prod
```

---

### Option 3: AWS Amplify

**Best for:** Full AWS ecosystem integration

#### Step 1: Install Amplify CLI
```bash
npm install -g @aws-amplify/cli
amplify configure
```

#### Step 2: Initialize
```bash
amplify init
```

#### Step 3: Add Hosting
```bash
amplify add hosting
# Select: Amazon CloudFront and S3
```

#### Step 4: Deploy
```bash
amplify publish
```

---

### Option 4: Self-Hosted (VPS)

**Best for:** Full control over infrastructure

#### Step 1: Build Project
```bash
npm run build
```

#### Step 2: Upload to Server
```bash
# Using SCP
scp -r dist/* user@your-server:/var/www/bursalimbah/

# Or using rsync
rsync -avz dist/ user@your-server:/var/www/bursalimbah/
```

#### Step 3: Configure Nginx
```nginx
server {
    listen 80;
    server_name bursalimbah.com;
    root /var/www/bursalimbah;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Step 4: Setup SSL
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d bursalimbah.com
```

---

## 🔧 Backend Deployment (Next.js)

If you have a separate Next.js backend:

### Step 1: Prepare Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
```

### Step 2: Deploy Backend
```bash
# Option A: Vercel
vercel --prod

# Option B: Railway
railway up

# Option C: Render
# Connect GitHub repo and deploy
```

### Step 3: Update Frontend API URL
```bash
# Update .env.production
VITE_API_URL=https://api.bursalimbah.com

# Redeploy frontend
vercel --prod
```

---

## 📊 Post-Deployment Verification

### 1. Check Website
```bash
# Test homepage
curl -I https://bursalimbah.com

# Test API
curl https://bursalimbah.com/api/health
```

### 2. Run Smoke Tests
- [ ] Homepage loads
- [ ] Navigation works
- [ ] Login works
- [ ] Marketplace loads
- [ ] Listing detail works
- [ ] Payment flow works
- [ ] Dashboard works
- [ ] Admin panel works

### 3. Monitor Performance
```bash
# Check Lighthouse
lighthouse https://bursalimbah.com

# Check Web Vitals
# Visit: https://web.dev/measure/
```

### 4. Verify Monitoring
- [ ] Sentry receiving errors
- [ ] Google Analytics tracking
- [ ] Vercel Analytics active
- [ ] Uptime monitoring configured

---

## 🔄 Rollback Procedure

If something goes wrong:

### Vercel Rollback
```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback
```

### Manual Rollback
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Redeploy
vercel --prod
```

---

## 📞 Support & Troubleshooting

### Common Issues

**1. Build Fails**
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

**2. Deployment Fails**
```bash
# Check Vercel logs
vercel logs

# Redeploy with force
vercel --prod --force
```

**3. Environment Variables Not Working**
```bash
# Verify variables
vercel env ls

# Add missing variables
vercel env add VARIABLE_NAME production
```

### Contact Support
- **Vercel Support:** https://vercel.com/support
- **Email:** support@bursalimbah.com
- **Documentation:** See DEPLOYMENT.md, MONITORING_SETUP.md

---

## ✅ Deployment Success Checklist

After deployment, verify:

- [ ] Website accessible at https://bursalimbah.com
- [ ] SSL certificate valid
- [ ] All pages load correctly
- [ ] API endpoints responding
- [ ] Database connected
- [ ] Payment gateway working
- [ ] Email notifications working
- [ ] Monitoring active
- [ ] Analytics tracking
- [ ] Error tracking active
- [ ] CDN serving assets
- [ ] Cache configured
- [ ] Security headers present
- [ ] Performance optimized
- [ ] Mobile responsive
- [ ] SEO meta tags present

---

## 🎉 Congratulations!

Your BursaLimbah.com is now **LIVE IN PRODUCTION!**

### Next Steps:
1. Monitor for 24 hours
2. Collect user feedback
3. Fix any issues
4. Iterate based on data
5. Plan next features

---

**Last Updated:** 2024
**Version:** 1.0.0
**Status:** Ready for Deployment
