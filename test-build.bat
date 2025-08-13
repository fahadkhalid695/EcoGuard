@echo off
echo 🧪 Testing Frontend Build Process...

REM Clean previous builds
echo 🧹 Cleaning previous builds...
if exist dist rmdir /s /q dist
if exist node_modules rmdir /s /q node_modules

REM Install dependencies
echo 📦 Installing dependencies...
npm install --legacy-peer-deps

REM Copy environment file
echo 📋 Setting up environment...
copy .env.docker .env

REM Build the application
echo 🏗️ Building application...
npm run build

REM Check if build was successful
if exist dist (
    echo ✅ Build successful!
    echo 📁 Build output:
    dir dist
    echo.
    echo 📄 Main files:
    dir dist\*.html dist\*.js dist\*.css 2>nul
) else (
    echo ❌ Build failed - dist directory not found
    exit /b 1
)

REM Test if we can serve it locally
echo.
echo 🌐 Testing local serve...
echo You can test the build by running:
echo   npx serve dist
echo   or
echo   python -m http.server 8000 (in dist directory)

pause