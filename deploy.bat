@echo off
REM ============================================
REM DEPLOYMENT SCRIPT FOR INFINITYFREE (Windows)
REM ============================================
REM Usage: deploy.bat

echo 🚀 BursaLimbah Deployment Script
echo ======================================
echo.

REM Step 1: Install dependencies
echo 📦 Step 1: Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Error: npm install failed!
    pause
    exit /b 1
)
echo ✅ Dependencies installed
echo.

REM Step 2: Run tests
echo 🧪 Step 2: Running tests...
call npm run test
if errorlevel 1 (
    echo ❌ Error: Tests failed!
    pause
    exit /b 1
)
echo ✅ Tests passed
echo.

REM Step 3: Build
echo 🔨 Step 3: Building for production...
call npm run build
if errorlevel 1 (
    echo ❌ Error: Build failed!
    pause
    exit /b 1
)
echo ✅ Build complete
echo.

REM Step 4: Check build output
if not exist "dist" (
    echo ❌ Error: dist folder not found!
    pause
    exit /b 1
)

echo ✅ Build output: dist\ folder
echo.

REM Step 5: Create deployment package
echo 📦 Step 4: Creating deployment package...
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set datetime=%datetime:~0,8%-%datetime:~8,4%
cd dist
powershell Compress-Archive -Path .\* -DestinationPath ..\deploy-%datetime%.zip -Force
cd ..
echo ✅ Deployment package created
echo.

REM Step 6: Show deployment instructions
echo 📤 Step 5: Deployment Instructions
echo ======================================
echo.
echo Option A: Upload via FTP (FileZilla^)
echo --------------------------------------
echo 1. Download FileZilla: https://filezilla-project.org
echo 2. Connect to your InfinityFree FTP:
echo    - Host: ftpupload.net (or your FTP host^)
echo    - Username: your-ftp-username
echo    - Password: your-ftp-password
echo 3. Navigate to htdocs\ folder
echo 4. Upload all files from dist\ folder
echo.
echo Option B: Upload via File Manager
echo --------------------------------------
echo 1. Login to InfinityFree control panel
echo 2. Go to File Manager
echo 3. Navigate to htdocs\
echo 4. Upload the ZIP file created above
echo 5. Extract the ZIP file
echo.
echo Option C: Upload via Control Panel
echo --------------------------------------
echo 1. Login to InfinityFree control panel
echo 2. Go to File Manager
echo 3. Navigate to htdocs\
echo 4. Upload all files from dist\ folder
echo.
echo ======================================
echo.

REM Step 7: Verify .htaccess
echo 🔍 Step 6: Verifying .htaccess...
if exist "dist\.htaccess" (
    echo ✅ .htaccess file found
) else (
    echo ❌ Warning: .htaccess file not found!
    echo Please ensure .htaccess is in dist\ folder
)
echo.

REM Step 8: Show success message
echo ======================================
echo ✅ DEPLOYMENT READY!
echo ======================================
echo.
echo Next steps:
echo 1. Upload files to InfinityFree
echo 2. Visit your domain to test
echo 3. Check console for errors
echo.
echo Deployment package: deploy-*.zip
echo.
echo Need help? Check DEPLOYMENT_INFINITYFREE.md
echo.
pause
