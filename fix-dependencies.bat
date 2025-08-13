@echo off
echo 🔧 Fixing dependency conflicts...

REM Remove node_modules and package-lock.json
echo 🗑️ Cleaning existing dependencies...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

REM Clear npm cache
echo 🧹 Clearing npm cache...
npm cache clean --force

REM Install dependencies with legacy peer deps flag
echo 📦 Installing dependencies...
npm install --legacy-peer-deps

REM Check for vulnerabilities and fix
echo 🔒 Checking for vulnerabilities...
npm audit fix --legacy-peer-deps

echo ✅ Dependencies fixed!
echo 🚀 You can now run: npm run dev

pause