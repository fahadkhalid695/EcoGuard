#!/bin/bash

echo "🧪 Testing Frontend Build Process..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf node_modules/

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Copy environment file
echo "📋 Setting up environment..."
cp .env.docker .env

# Build the application
echo "🏗️ Building application..."
npm run build

# Check if build was successful
if [ -d "dist" ]; then
    echo "✅ Build successful!"
    echo "📁 Build output:"
    ls -la dist/
    echo ""
    echo "📊 File count:"
    find dist -type f | wc -l
    echo ""
    echo "📄 Main files:"
    find dist -name "*.html" -o -name "*.js" -o -name "*.css" | head -10
else
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

# Test if we can serve it locally
echo ""
echo "🌐 Testing local serve..."
if command -v python3 &> /dev/null; then
    echo "Starting local server on http://localhost:8000"
    echo "Press Ctrl+C to stop"
    cd dist && python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "Starting local server on http://localhost:8000"
    echo "Press Ctrl+C to stop"
    cd dist && python -m SimpleHTTPServer 8000
else
    echo "Python not found. Install Python to test local serving."
    echo "Or use: npx serve dist"
fi