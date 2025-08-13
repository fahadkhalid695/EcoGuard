@echo off
REM Test script to verify dependency fixes

echo 🧪 Testing dependency fixes...

REM Clean npm cache
echo 🧹 Cleaning npm cache...
npm cache clean --force

REM Remove node_modules if it exists
if exist "node_modules" (
    echo 🗑️ Removing existing node_modules...
    rmdir /s /q node_modules
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Check if installation was successful
if %errorlevel% equ 0 (
    echo ✅ Dependencies installed successfully!
    
    REM Try to build the project
    echo 🏗️ Testing build...
    npm run build
    
    if %errorlevel% equ 0 (
        echo ✅ Build successful! Dependencies are fixed.
        echo.
        echo 🚀 You can now run:
        echo    quick-start.sh    # For full deployment
        echo    npm run dev       # For development
        echo    docker-build.bat  # For Docker deployment
    ) else (
        echo ❌ Build failed. Check the output above for errors.
        exit /b 1
    )
) else (
    echo ❌ Dependency installation failed. Check the output above for errors.
    exit /b 1
)

pause