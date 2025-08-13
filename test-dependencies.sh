#!/bin/bash

# Test script to verify dependency fixes
echo "🧪 Testing dependency fixes..."

# Clean npm cache
echo "🧹 Cleaning npm cache..."
npm cache clean --force

# Remove node_modules if it exists
if [ -d "node_modules" ]; then
    echo "🗑️ Removing existing node_modules..."
    rm -rf node_modules
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
    
    # Try to build the project
    echo "🏗️ Testing build..."
    npm run build
    
    if [ $? -eq 0 ]; then
        echo "✅ Build successful! Dependencies are fixed."
        echo ""
        echo "🚀 You can now run:"
        echo "   ./quick-start.sh    # For full deployment"
        echo "   npm run dev         # For development"
        echo "   ./docker-build.sh   # For Docker deployment"
    else
        echo "❌ Build failed. Check the output above for errors."
        exit 1
    fi
else
    echo "❌ Dependency installation failed. Check the output above for errors."
    exit 1
fi