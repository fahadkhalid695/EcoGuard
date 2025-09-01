#!/bin/bash

# EcoGuard Pro Quick Start Script
# This script will get EcoGuard Pro running in under 5 minutes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

echo "🌍 EcoGuard Pro - Quick Start"
echo "============================="
echo ""
echo "This script will:"
echo "1. Check system requirements"
echo "2. Fix dependency issues"
echo "3. Set up the environment"
echo "4. Deploy all services with Docker"
echo "5. Initialize with demo data"
echo ""

# Check if user wants to continue
read -p "Continue with deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

# Fix npm dependency issues
log "Fixing npm dependency issues..."
if [ -f package-lock.json ]; then
    rm package-lock.json
    warning "Removed existing package-lock.json to resolve dependency conflicts"
fi

# Ensure .npmrc exists with legacy peer deps
if [ ! -f .npmrc ]; then
    echo "legacy-peer-deps=true" > .npmrc
    success "Created .npmrc with legacy peer deps"
fi

# Clean npm cache
npm cache clean --force 2>/dev/null || true

# Make scripts executable
chmod +x scripts/*.sh

# Run deployment
log "Starting deployment..."
./scripts/deploy.sh

echo ""
echo "🎉 Quick start completed!"
echo ""
echo "Next steps:"
echo "1. Open http://localhost in your browser"
echo "2. Login with demo@ecoguard.com / password123"
echo "3. Explore the dashboard and features"
echo "4. Check the documentation in docs/ folder"
echo ""
echo "Need help? Check docs/setup-guides/DOCKER_TROUBLESHOOTING.md for detailed instructions."