#!/bin/bash

# EcoGuard Pro Automated Backup Script
# This script creates automated backups of database, files, and configurations

set -e  # Exit on any error

# Configuration
BACKUP_DIR="/var/backups/ecoguard"
DB_NAME="${DB_NAME:-ecoguard_pro}"
DB_USER="${DB_USER:-ecoguard}"
DB_HOST="${DB_HOST:-localhost}"
RETENTION_DAYS=30
S3_BUCKET="${S3_BACKUP_BUCKET:-}"
SLACK_WEBHOOK="${SLACK_WEBHOOK_URL:-}"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Generate timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_PREFIX="ecoguard_backup_$TIMESTAMP"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$BACKUP_DIR/backup.log"
}

# Notification function
notify() {
    local message="$1"
    local status="$2"
    
    log "$message"
    
    if [ -n "$SLACK_WEBHOOK" ]; then
        local color="good"
        if [ "$status" = "error" ]; then
            color="danger"
        fi
        
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"attachments\":[{\"color\":\"$color\",\"text\":\"EcoGuard Backup: $message\"}]}" \
            "$SLACK_WEBHOOK" 2>/dev/null || true
    fi
}

# Database backup function
backup_database() {
    log "Starting database backup..."
    
    local db_backup_file="$BACKUP_DIR/${BACKUP_PREFIX}_database.sql"
    
    if pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" > "$db_backup_file"; then
        gzip "$db_backup_file"
        log "Database backup completed: ${db_backup_file}.gz"
        return 0
    else
        log "Database backup failed!"
        return 1
    fi
}

# Files backup function
backup_files() {
    log "Starting files backup..."
    
    local files_backup="$BACKUP_DIR/${BACKUP_PREFIX}_files.tar.gz"
    
    # Backup important directories
    tar -czf "$files_backup" \
        --exclude="node_modules" \
        --exclude="*.log" \
        --exclude="dist" \
        --exclude=".git" \
        /app/uploads \
        /app/config \
        /app/ssl \
        /etc/nginx/sites-available \
        /etc/mosquitto/config \
        2>/dev/null || true
    
    if [ -f "$files_backup" ]; then
        log "Files backup completed: $files_backup"
        return 0
    else
        log "Files backup failed!"
        return 1
    fi
}

# Docker volumes backup
backup_docker_volumes() {
    log "Starting Docker volumes backup..."
    
    local volumes_backup="$BACKUP_DIR/${BACKUP_PREFIX}_volumes.tar.gz"
    
    # Stop containers temporarily for consistent backup
    docker-compose stop backend frontend 2>/dev/null || true
    
    # Backup Docker volumes
    docker run --rm \
        -v ecoguard_postgres_data:/data \
        -v "$BACKUP_DIR:/backup" \
        alpine tar czf "/backup/${BACKUP_PREFIX}_postgres_volume.tar.gz" /data
    
    docker run --rm \
        -v ecoguard_redis_data:/data \
        -v "$BACKUP_DIR:/backup" \
        alpine tar czf "/backup/${BACKUP_PREFIX}_redis_volume.tar.gz" /data
    
    # Restart containers
    docker-compose start backend frontend 2>/dev/null || true
    
    log "Docker volumes backup completed"
}

# Configuration backup
backup_configuration() {
    log "Starting configuration backup..."
    
    local config_backup="$BACKUP_DIR/${BACKUP_PREFIX}_config.tar.gz"
    
    tar -czf "$config_backup" \
        docker-compose.yml \
        .env \
        nginx/nginx.conf \
        mqtt/config/ \
        backend/.env \
        2>/dev/null || true
    
    if [ -f "$config_backup" ]; then
        log "Configuration backup completed: $config_backup"
        return 0
    else
        log "Configuration backup failed!"
        return 1
    fi
}

# Upload to S3 (if configured)
upload_to_s3() {
    if [ -z "$S3_BUCKET" ]; then
        log "S3 backup not configured, skipping upload"
        return 0
    fi
    
    log "Uploading backups to S3..."
    
    for file in "$BACKUP_DIR"/${BACKUP_PREFIX}_*; do
        if [ -f "$file" ]; then
            aws s3 cp "$file" "s3://$S3_BUCKET/backups/$(basename "$file")" || {
                log "Failed to upload $(basename "$file") to S3"
                return 1
            }
        fi
    done
    
    log "S3 upload completed"
}

# Clean old backups
cleanup_old_backups() {
    log "Cleaning up old backups (older than $RETENTION_DAYS days)..."
    
    find "$BACKUP_DIR" -name "ecoguard_backup_*" -type f -mtime +$RETENTION_DAYS -delete
    
    # Clean S3 backups if configured
    if [ -n "$S3_BUCKET" ]; then
        aws s3 ls "s3://$S3_BUCKET/backups/" | while read -r line; do
            createDate=$(echo "$line" | awk '{print $1" "$2}')
            createDate=$(date -d "$createDate" +%s)
            olderThan=$(date -d "$RETENTION_DAYS days ago" +%s)
            
            if [[ $createDate -lt $olderThan ]]; then
                fileName=$(echo "$line" | awk '{print $4}')
                if [[ $fileName != "" ]]; then
                    aws s3 rm "s3://$S3_BUCKET/backups/$fileName"
                fi
            fi
        done
    fi
    
    log "Cleanup completed"
}

# Verify backup integrity
verify_backups() {
    log "Verifying backup integrity..."
    
    local errors=0
    
    # Check database backup
    if [ -f "$BACKUP_DIR/${BACKUP_PREFIX}_database.sql.gz" ]; then
        if ! gzip -t "$BACKUP_DIR/${BACKUP_PREFIX}_database.sql.gz"; then
            log "Database backup is corrupted!"
            errors=$((errors + 1))
        fi
    fi
    
    # Check other backups
    for file in "$BACKUP_DIR"/${BACKUP_PREFIX}_*.tar.gz; do
        if [ -f "$file" ] && ! tar -tzf "$file" >/dev/null 2>&1; then
            log "Backup file $file is corrupted!"
            errors=$((errors + 1))
        fi
    done
    
    if [ $errors -eq 0 ]; then
        log "All backups verified successfully"
        return 0
    else
        log "$errors backup files are corrupted!"
        return 1
    fi
}

# Main backup function
main() {
    local start_time=$(date +%s)
    
    notify "Starting automated backup process" "info"
    
    # Perform backups
    local backup_errors=0
    
    backup_database || backup_errors=$((backup_errors + 1))
    backup_files || backup_errors=$((backup_errors + 1))
    backup_docker_volumes || backup_errors=$((backup_errors + 1))
    backup_configuration || backup_errors=$((backup_errors + 1))
    
    # Verify backups
    verify_backups || backup_errors=$((backup_errors + 1))
    
    # Upload to S3
    upload_to_s3 || backup_errors=$((backup_errors + 1))
    
    # Cleanup old backups
    cleanup_old_backups
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    if [ $backup_errors -eq 0 ]; then
        notify "Backup completed successfully in ${duration}s" "success"
        exit 0
    else
        notify "Backup completed with $backup_errors errors in ${duration}s" "error"
        exit 1
    fi
}

# Handle script arguments
case "${1:-}" in
    "database")
        backup_database
        ;;
    "files")
        backup_files
        ;;
    "config")
        backup_configuration
        ;;
    "verify")
        verify_backups
        ;;
    "cleanup")
        cleanup_old_backups
        ;;
    *)
        main
        ;;
esac