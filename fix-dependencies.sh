#!/bin/bash

echo "🔧 Fixing dependency conflicts..."

# Remove node_modules and package-lock.json
echo "🗑️ Cleaning existing dependencies..."
rm -rf node_modules
rm -f package-lock.json

# Clear npm cache
echo "🧹 Clearing npm cache..."
npm cache clean --force

# Install dependencies with legacy peer deps flag
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Check for vulnerabilities and fix
echo "🔒 Checking for vulnerabilities..."
npm audit fix --legacy-peer-deps

echo "✅ Dependencies fixed!"
echo "🚀 You can now run: npm run dev"