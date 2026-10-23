# 🖼️ Cloudinary Setup Guide

## 📋 Overview

Panduan lengkap setup Cloudinary untuk file storage BursaLimbah.com

---

## 🚀 Step 1: Create Cloudinary Account

### 1.1 Sign Up

1. Go to: https://cloudinary.com
2. Click "Sign Up for Free"
3. Fill in:
   - Email
   - Password
   - Company name (optional)
4. Verify email
5. Login to dashboard

---

## 🔑 Step 2: Get Credentials

### 2.1 Dashboard

1. Login ke Cloudinary Dashboard
2. You'll see your credentials on the main page:
   - **Cloud Name:** `your-cloud-name`
   - **API Key:** `123456789012345`
   - **API Secret:** `AbCdEfGhIjKlMnOpQrStUvWxYz` (keep secret!)

### 2.2 Copy Credentials

Save these for later:
```bash
CLOUD_NAME=your-cloud-name
API_KEY=123456789012345
API_SECRET=AbCdEfGhIjKlMnOpQrStUvWxYz
```

---

## 📤 Step 3: Create Upload Preset

### 3.1 Go to Upload Settings

1. Dashboard → Settings (gear icon)
2. Click "Upload" tab
3. Scroll to "Upload presets"

### 3.2 Create Unsigned Preset

1. Click "Add upload preset"
2. Configure:
   - **Preset name:** `bursalimbah-upload`
   - **Signing Mode:** Unsigned (important!)
   - **Delivery type:** Upload
3. Click "Save"

### 3.3 Configure Transformations (Optional)

In the same preset, add default transformations:

```json
{
  "quality": "auto",
  "format": "auto",
  "fetch_format": "auto"
}
```

This will automatically:
- Optimize quality
- Convert to best format (WebP)
- Compress images

---

## 🎨 Step 4: Configure Folders

### 4.1 Create Folder Structure

Cloudinary will auto-create folders based on upload path:

```
bursalimbah/
├── listings/          # Listing photos
├── profiles/          # Profile pictures
├── kyc/              # KYC documents
├── chat/             # Chat attachments
├── validation/       # Validation photos
└── thumbnails/       # Auto-generated thumbnails
```

### 4.2 Set Folder in Upload

When uploading, specify folder:

```typescript
formData.append('folder', 'bursalimbah/listings');
```

---

## 🔐 Step 5: Configure Environment

### 5.1 Create .env File

```bash
# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=bursalimbah-upload
VITE_CLOUDINARY_API_KEY=123456789012345
```

### 5.2 Test Configuration

```typescript
// src/lib/cloudinary.ts
const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

console.log('Cloud Name:', cloudName);
console.log('Upload Preset:', uploadPreset);
```

---

## 📤 Step 6: Upload Files

### 6.1 Single Image Upload

```typescript
import { uploadToCloudinary } from './lib/cloudinary';

const handleUpload = async (file: File) => {
  try {
    const result = await uploadToCloudinary(file, 'bursalimbah/listings');
    console.log('Upload success:', result);
    // result.url - image URL
    // result.thumbnailUrl - thumbnail URL
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### 6.2 Multiple Images Upload

```typescript
import { uploadMultipleToCloudinary } from './lib/cloudinary';

const handleMultipleUpload = async (files: File[]) => {
  try {
    const results = await uploadMultipleToCloudinary(files, 'bursalimbah/listings');
    console.log('Upload success:', results);
    // Array of uploaded images
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### 6.3 Using FileUpload Component

```typescript
import { FileUpload } from './components/FileUpload';

<FileUpload
  category="listing"
  maxFiles={10}
  onUploadComplete={(files) => {
    console.log('Uploaded:', files);
    // Save to database
  }}
  onError={(error) => {
    console.error('Error:', error);
  }}
/>
```

---

## 🖼️ Step 7: Image Transformations

### 7.1 Get Optimized URL

```typescript
import { getOptimizedUrl } from './lib/cloudinary';

const originalUrl = 'https://res.cloudinary.com/.../image/upload/...';

// Get thumbnail
const thumbnail = getOptimizedUrl(originalUrl, {
  width: 200,
  height: 200,
  quality: 'auto',
  format: 'webp',
});

// Get medium size
const medium = getOptimizedUrl(originalUrl, {
  width: 800,
  quality: 'auto',
  format: 'webp',
});

// Get full size
const full = getOptimizedUrl(originalUrl, {
  quality: 'auto',
  format: 'webp',
});
```

### 7.2 Responsive Images

```typescript
<picture>
  <source
    srcSet={getOptimizedUrl(url, { width: 400, format: 'webp' })}
    media="(max-width: 600px)"
  />
  <source
    srcSet={getOptimizedUrl(url, { width: 800, format: 'webp' })}
    media="(max-width: 1200px)"
  />
  <img
    src={getOptimizedUrl(url, { width: 1200, format: 'webp' })}
    alt="Listing"
  />
</picture>
```

---

## 📊 Step 8: Monitor Usage

### 8.1 Dashboard Metrics

Go to Dashboard to monitor:
- **Credits:** Monthly usage
- **Storage:** Total storage used
- **Bandwidth:** Monthly bandwidth
- **Transformations:** Number of transformations

### 8.2 Free Tier Limits

- **Storage:** 25 GB
- **Bandwidth:** 25 GB/month
- **Transformations:** 25 transformations/minute
- **Webhooks:** 10 webhooks

### 8.3 View Logs

1. Dashboard → Media Library
2. Click on any image
3. View upload details
4. Check transformations applied

---

## 🔧 Troubleshooting

### Problem: Upload Failed

**Solusi:**
```typescript
// Check credentials
console.log('Cloud Name:', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
console.log('Upload Preset:', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

// Check file
console.log('File size:', file.size);
console.log('File type:', file.type);

// Check response
const response = await fetch(uploadUrl, { method: 'POST', body: formData });
console.log('Response:', await response.json());
```

### Problem: CORS Error

**Solusi:**
1. Dashboard → Settings → Upload
2. Scroll to "CORS settings"
3. Add allowed origins:
   ```
   https://your-domain.infinityfreeapp.com
   http://localhost:3000
   ```

### Problem: Image Not Loading

**Solusi:**
```typescript
// Check URL
console.log('Image URL:', imageUrl);

// Test in browser
window.open(imageUrl, '_blank');

// Check Cloudinary dashboard
// Dashboard → Media Library → Find image
```

---

## 📚 Resources

- **Cloudinary Docs:** https://cloudinary.com/documentation
- **Upload API:** https://cloudinary.com/documentation/image_upload_api_reference
- **Transformations:** https://cloudinary.com/documentation/image_transformations
- **React SDK:** https://cloudinary.com/documentation/react_integration

---

## ✅ Checklist

- [ ] Cloudinary account created
- [ ] Credentials copied
- [ ] Upload preset created (unsigned)
- [ ] Folder structure planned
- [ ] Environment variables set
- [ ] Upload tested
- [ ] Transformations configured
- [ ] Monitoring setup

---

**Last Updated:** 2024  
**Status:** ✅ Ready
