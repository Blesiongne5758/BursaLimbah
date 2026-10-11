#!/bin/bash

# ============================================
# PRODUCTION DEPLOYMENT SCRIPT
# ============================================

set -e  # Exit on error

echo "🚀 Starting Production Deployment..."
echo "======================================"

# Check if required tools are installed
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed."; exit 1; }
command -v vercel >/dev/null 2>&1 || { echo "❌ Vercel CLI is required but not installed. Run: npm install -g vercel"; exit 1; }

# Step 1: Install dependencies
echo ""
echo "📦 Step 1: Installing dependencies..."
npm ci

# Step 2: Run tests
echo ""
echo "🧪 Step 2: Running tests..."
npm run test

# Step 3: Type check
echo ""
echo "🔍 Step 3: Type checking..."
npm run typecheck

# Step 4: Build for production
echo ""
echo "🔨 Step 4: Building for production..."
npm run build

# Step 5: Run E2E tests
echo ""
echo "🎭 Step 5: Running E2E tests..."
npm run test:e2e

# Step 6: Security audit
echo ""
echo "🔒 Step 6: Running security audit..."
npm audit --audit-level=high || echo "⚠️  Security vulnerabilities found, but continuing..."

# Step 7: Deploy to Vercel
echo ""
echo "🚀 Step 7: Deploying to Vercel..."
vercel --prod --yes

echo ""
echo "======================================"
echo "✅ Deployment completed successfully!"
echo "🌐 URL: https://bursalimbah.com"
echo "======================================"
