#!/bin/bash

# ============================================
# DEPLOYMENT SCRIPT - INFINITYFREE FTP
# ============================================
# Credentials:
# Host: ftpupload.net
# Username: if0_43249513
# Password: N0m4d3n0
# Target: htdocs/

echo "======================================"
echo "BursaLimbah Deployment Script"
echo "======================================"
echo ""

# FTP Credentials
FTP_HOST="ftpupload.net"
FTP_USER="if0_43249513"
FTP_PASS="N0m4d3n0"
FTP_PATH="/htdocs/"

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist folder not found!"
    echo "Please run 'npm run build' first."
    exit 1
fi

echo "✅ Build folder found"
echo ""

# Method 1: Using lftp (if installed)
if command -v lftp &> /dev/null; then
    echo "📤 Uploading via lftp..."
    
    lftp -u $FTP_USER,$FTP_PASS $FTP_HOST <<EOF
set ssl:verify-certificate no
cd $FTP_PATH
mirror -R dist/ .
bye
EOF
    
    if [ $? -eq 0 ]; then
        echo "✅ Upload complete via lftp!"
        exit 0
    fi
fi

# Method 2: Using curl (if installed)
if command -v curl &> /dev/null; then
    echo "📤 Uploading via curl..."
    
    cd dist
    
    for file in *; do
        if [ -f "$file" ]; then
            echo "Uploading: $file"
            curl -T "$file" "ftp://$FTP_HOST$FTP_PATH$file" --user "$FTP_USER:$FTP_PASS" --insecure
        elif [ -d "$file" ]; then
            echo "Uploading directory: $file"
            curl -T "$file/*" "ftp://$FTP_HOST$FTP_PATH$file/" --user "$FTP_USER:$FTP_PASS" --insecure --ftp-create-dirs
        fi
    done
    
    cd ..
    echo "✅ Upload complete via curl!"
    exit 0
fi

# Method 3: Using ncftp (if installed)
if command -v ncftpput &> /dev/null; then
    echo "📤 Uploading via ncftp..."
    
    ncftpput -u $FTP_USER -p $FTP_PASS -R $FTP_HOST $FTP_PATH dist/*
    
    if [ $? -eq 0 ]; then
        echo "✅ Upload complete via ncftp!"
        exit 0
    fi
fi

# If all methods fail
echo "❌ No FTP client found!"
echo ""
echo "Please install one of these:"
echo "1. lftp: sudo apt-get install lftp (Linux) or brew install lftp (Mac)"
echo "2. ncftp: sudo apt-get install ncftp (Linux) or brew install ncftp (Mac)"
echo "3. Or use FileZilla GUI client"
echo ""
echo "Alternative: Use InfinityFree File Manager"
echo "1. Login to InfinityFree control panel"
echo "2. Go to File Manager"
echo "3. Navigate to htdocs/"
echo "4. Upload dist/ contents"

exit 1
