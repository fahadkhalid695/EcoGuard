#!/bin/bash

# EcoGuard Pro Deployment Script
set -e

echo "🚀 Starting EcoGuard Pro Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
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

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
    fi
    
    # Check if ports are available
    if lsof -Pi :80 -sTCP:LISTEN -t >/dev/null 2>&1; then
        warning "Port 80 is already in use. Please stop the service using it."
    fi
    
    if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
        warning "Port 3001 is already in use. Please stop the service using it."
    fi
    
    success "Prerequisites check completed"
}

# Setup environment
setup_environment() {
    log "Setting up environment..."
    
    # Copy production environment file
    if [ ! -f .env ]; then
        cp .env.production .env
        warning "Created .env file from .env.production. Please review and update the configuration."
    fi
    
    # Create required directories
    mkdir -p logs/nginx backups mqtt/data mqtt/log nginx/ssl
    
    # Set permissions
    chmod 755 logs backups mqtt/data mqtt/log
    
    success "Environment setup completed"
}

# Generate SSL certificates (self-signed for demo)
generate_ssl() {
    log "Generating SSL certificates..."
    
    if [ ! -f nginx/ssl/cert.pem ]; then
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/key.pem \
            -out nginx/ssl/cert.pem \
            -subj "/C=US/ST=State/L=City/O=EcoGuard/CN=localhost" \
            2>/dev/null || warning "SSL certificate generation failed. HTTPS will not be available."
        
        if [ -f nginx/ssl/cert.pem ]; then
            success "SSL certificates generated"
        fi
    else
        success "SSL certificates already exist"
    fi
}

# Build and start services
deploy_services() {
    log "Building and starting services..."
    
    # Pull latest images
    docker-compose -f docker-compose.prod.yml pull postgres redis mqtt 2>/dev/null || true
    
    # Build custom images
    docker-compose -f docker-compose.prod.yml build --no-cache
    
    # Start services
    docker-compose -f docker-compose.prod.yml up -d
    
    success "Services started"
}

# Wait for services to be ready
wait_for_services() {
    log "Waiting for services to be ready..."
    
    # Wait for database
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U ecoguard -d ecoguard_pro >/dev/null 2>&1; then
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            error "Database failed to start after $max_attempts attempts"
        fi
        
        log "Waiting for database... (attempt $attempt/$max_attempts)"
        sleep 5
        attempt=$((attempt + 1))
    done
    
    success "Database is ready"
    
    # Wait for backend
    attempt=1
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:3001/health >/dev/null 2>&1; then
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            error "Backend failed to start after $max_attempts attempts"
        fi
        
        log "Waiting for backend... (attempt $attempt/$max_attempts)"
        sleep 5
        attempt=$((attempt + 1))
    done
    
    success "Backend is ready"
    
    # Wait for frontend
    attempt=1
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost/health >/dev/null 2>&1; then
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            error "Frontend failed to start after $max_attempts attempts"
        fi
        
        log "Waiting for frontend... (attempt $attempt/$max_attempts)"
        sleep 5
        attempt=$((attempt + 1))
    done
    
    success "Frontend is ready"
}

# Initialize database with demo data
initialize_database() {
    log "Initializing database with demo data..."
    
    # Run migrations
    docker-compose -f docker-compose.prod.yml exec -T backend npm run migrate
    
    # Seed demo data
    docker-compose -f docker-compose.prod.yml exec -T backend npm run seed
    
    success "Database initialized with demo data"
}

# Show deployment status
show_status() {
    log "Deployment Status:"
    
    echo ""
    echo "🌍 EcoGuard Pro is now running!"
    echo ""
    echo "📱 Frontend:     http://localhost"
    echo "🔧 Backend API:  http://localhost:3001"
    echo "📊 Health Check: http://localhost:3001/health"
    echo "🔌 WebSocket:    ws://localhost:8080"
    echo ""
    echo "👤 Demo Login Credentials:"
    echo "   Email:    demo@ecoguard.com"
    echo "   Password: password123"
    echo ""
    echo "👨‍💼 Admin Login Credentials:"
    echo "   Email:    admin@ecoguard.com"
    echo "   Password: password123"
    echo ""
    echo "📋 Service Status:"
    docker-compose -f docker-compose.prod.yml ps
    echo ""
    echo "📝 To view logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo "🛑 To stop:      docker-compose -f docker-compose.prod.yml down"
    echo "🔄 To restart:   docker-compose -f docker-compose.prod.yml restart"
}

# Cleanup function
cleanup() {
    if [ $? -ne 0 ]; then
        error "Deployment failed! Check the logs above for details."
        echo ""
        echo "🔍 Troubleshooting:"
        echo "   - Check Docker logs: docker-compose -f docker-compose.prod.yml logs"
        echo "   - Verify ports are available: netstat -tulpn | grep -E ':(80|3001|5432)'"
        echo "   - Check disk space: df -h"
        echo "   - Verify environment: cat .env"
    fi
}

# Set trap for cleanup
trap cleanup EXIT

# Main deployment process
main() {
    echo "🌍 EcoGuard Pro - Production Deployment"
    echo "========================================"
    echo ""
    
    check_prerequisites
    setup_environment
    generate_ssl
    deploy_services
    wait_for_services
    initialize_database
    show_status
    
    success "Deployment completed successfully! 🎉"
}

# Handle script arguments
case "${1:-}" in
    "status")
        docker-compose -f docker-compose.prod.yml ps
        ;;
    "logs")
        docker-compose -f docker-compose.prod.yml logs -f
        ;;
    "stop")
        docker-compose -f docker-compose.prod.yml down
        ;;
    "restart")
        docker-compose -f docker-compose.prod.yml restart
        ;;
    "clean")
        docker-compose -f docker-compose.prod.yml down -v
        docker system prune -f
        ;;
    *)
        main
        ;;
esac