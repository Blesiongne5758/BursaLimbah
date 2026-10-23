#!/bin/bash

# ============================================
# DEPLOYMENT SCRIPT FOR INFINITYFREE
# ============================================
# Usage: ./deploy.sh

set -e  # Exit on error

echo "🚀 BursaLimbah Deployment Script"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found!${NC}"
    echo "Please create .env file first. See .env.example"
    exit 1
fi

# Step 1: Install dependencies
echo -e "${YELLOW}📦 Step 1: Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 2: Run tests
echo -e "${YELLOW}🧪 Step 2: Running tests...${NC}"
npm run test
echo -e "${GREEN}✅ Tests passed${NC}"
echo ""

# Step 3: Build
echo -e "${YELLOW}🔨 Step 3: Building for production...${NC}"
npm run build
echo -e "${GREEN}✅ Build complete${NC}"
echo ""

# Step 4: Check build output
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Error: dist folder not found!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build output: dist/ folder${NC}"
echo ""

# Step 5: Create deployment package
echo -e "${YELLOW}📦 Step 4: Creating deployment package...${NC}"
cd dist
zip -r ../deploy-$(date +%Y%m%d-%H%M%S).zip .
cd ..
echo -e "${GREEN}✅ Deployment package created${NC}"
echo ""

# Step 6: Show deployment instructions
echo -e "${YELLOW}📤 Step 5: Deployment Instructions${NC}"
echo "======================================"
echo ""
echo "Option A: Upload via FTP (FileZilla)"
echo "--------------------------------------"
echo "1. Download FileZilla: https://filezilla-project.org"
echo "2. Connect to your InfinityFree FTP:"
echo "   - Host: ftpupload.net (or your FTP host)"
echo "   - Username: your-ftp-username"
echo "   - Password: your-ftp-password"
echo "3. Navigate to htdocs/ folder"
echo "4. Upload all files from dist/ folder"
echo ""
echo "Option B: Upload via File Manager"
echo "--------------------------------------"
echo "1. Login to InfinityFree control panel"
echo "2. Go to File Manager"
echo "3. Navigate to htdocs/"
echo "4. Upload the ZIP file created above"
echo "5. Extract the ZIP file"
echo ""
echo "Option C: Upload via Control Panel"
echo "--------------------------------------"
echo "1. Login to InfinityFree control panel"
echo "2. Go to File Manager"
echo "3. Navigate to htdocs/"
echo "4. Upload all files from dist/ folder"
echo ""
echo "======================================"
echo ""

# Step 7: Verify .htaccess
echo -e "${YELLOW}🔍 Step 6: Verifying .htaccess...${NC}"
if [ -f "dist/.htaccess" ]; then
    echo -e "${GREEN}✅ .htaccess file found${NC}"
else
    echo -e "${RED}❌ Warning: .htaccess file not found!${NC}"
    echo "Please ensure .htaccess is in dist/ folder"
fi
echo ""

# Step 8: Show success message
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}✅ DEPLOYMENT READY!${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo "Next steps:"
echo "1. Upload files to InfinityFree"
echo "2. Visit your domain to test"
echo "3. Check console for errors"
echo ""
echo "Deployment package: deploy-*.zip"
echo ""
echo "Need help? Check DEPLOYMENT_INFINITYFREE.md"
echo ""
