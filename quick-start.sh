#!/bin/bash

# EcoGuard Pro Quick Start Script
# This script will get EcoGuard Pro running in under 5 minutes

set -e

echo "🌍 EcoGuard Pro - Quick Start"
echo "============================="
echo ""
echo "This script will:"
echo "1. Check system requirements"
echo "2. Set up the environment"
echo "3. Deploy all services with Docker"
echo "4. Initialize with demo data"
echo ""

# Check if user wants to continue
read -p "Continue with deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

# Make scripts executable
chmod +x scripts/*.sh

# Run deployment
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
echo "Need help? Check SETUP.md for detailed instructions."