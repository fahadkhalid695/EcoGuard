# Scripts Directory

This directory contains utility scripts for the EcoGuard Pro project.

## Available Scripts

### `quick-start.sh`
Quick deployment script that sets up the entire EcoGuard Pro system in under 5 minutes.
- Checks system requirements
- Fixes dependency issues
- Sets up environment
- Deploys with Docker
- Initializes demo data

### `deploy.sh`
Main deployment script for Docker-based deployment.

### `backup-automation.sh`
Automated backup script for data persistence.

## Usage

Make scripts executable:
```bash
chmod +x scripts/*.sh
```

Run quick start:
```bash
./scripts/quick-start.sh
```

## Platform Support
- Linux/macOS: Use `.sh` scripts
- Windows: Use Git Bash or WSL to run shell scripts