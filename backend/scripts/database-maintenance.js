const db = require('../config/database');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class DatabaseMaintenance {
  constructor() {
    this.backupDir = process.env.BACKUP_DIR || './backups';
    this.retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS) || 30;
  }

  // Create database backup
  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(this.backupDir, `ecoguard_backup_${timestamp}.sql`);

    // Ensure backup directory exists
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    const command = `pg_dump ${process.env.DATABASE_URL || this.getDatabaseUrl()} > ${backupFile}`;

    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error('Backup failed:', error);
          reject(error);
        } else {
          console.log(`Backup created: ${backupFile}`);
          resolve(backupFile);
        }
      });
    });
  }

  // Clean old sensor readings (keep last 90 days)
  async cleanOldReadings() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);

    try {
      const result = await db('sensor_readings')
        .where('timestamp', '<', cutoffDate)
        .del();

      console.log(`Cleaned ${result} old sensor readings`);
      return result;
    } catch (error) {
      console.error('Error cleaning old readings:', error);
      throw error;
    }
  }

  // Archive old alerts (move to archive table)
  async archiveOldAlerts() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 365); // Archive after 1 year

    try {
      // Create archive table if it doesn't exist
      await db.schema.hasTable('alerts_archive').then(exists => {
        if (!exists) {
          return db.schema.createTable('alerts_archive', table => {
            table.uuid('id').primary();
            table.uuid('sensor_id');
            table.string('alert_type');
            table.string('severity');
            table.text('message');
            table.timestamp('timestamp');
            table.boolean('acknowledged');
            table.uuid('acknowledged_by');
            table.timestamp('acknowledged_at');
            table.timestamp('resolved_at');
            table.json('metadata');
            table.timestamp('archived_at').defaultTo(db.fn.now());
          });
        }
      });

      // Move old alerts to archive
      const oldAlerts = await db('alerts')
        .where('timestamp', '<', cutoffDate)
        .where('resolved_at', 'is not', null);

      if (oldAlerts.length > 0) {
        await db('alerts_archive').insert(oldAlerts);
        await db('alerts')
          .where('timestamp', '<', cutoffDate)
          .where('resolved_at', 'is not', null)
          .del();

        console.log(`Archived ${oldAlerts.length} old alerts`);
      }

      return oldAlerts.length;
    } catch (error) {
      console.error('Error archiving old alerts:', error);
      throw error;
    }
  }

  // Optimize database (VACUUM and ANALYZE)
  async optimizeDatabase() {
    try {
      await db.raw('VACUUM ANALYZE');
      console.log('Database optimization completed');
    } catch (error) {
      console.error('Error optimizing database:', error);
      throw error;
    }
  }

  // Update table statistics
  async updateStatistics() {
    const tables = ['sensors', 'sensor_readings', 'alerts', 'users'];
    
    for (const table of tables) {
      try {
        const stats = await db(table).count('* as count').first();
        console.log(`${table}: ${stats.count} records`);
      } catch (error) {
        console.error(`Error getting stats for ${table}:`, error);
      }
    }
  }

  // Clean old backup files
  async cleanOldBackups() {
    if (!fs.existsSync(this.backupDir)) return;

    const files = fs.readdirSync(this.backupDir);
    const cutoffTime = Date.now() - (this.retentionDays * 24 * 60 * 60 * 1000);

    let deletedCount = 0;
    for (const file of files) {
      if (file.startsWith('ecoguard_backup_') && file.endsWith('.sql')) {
        const filePath = path.join(this.backupDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime.getTime() < cutoffTime) {
          fs.unlinkSync(filePath);
          deletedCount++;
          console.log(`Deleted old backup: ${file}`);
        }
      }
    }

    console.log(`Cleaned ${deletedCount} old backup files`);
    return deletedCount;
  }

  // Run full maintenance
  async runMaintenance() {
    console.log('Starting database maintenance...');
    
    try {
      // Create backup first
      await this.createBackup();
      
      // Clean old data
      await this.cleanOldReadings();
      await this.archiveOldAlerts();
      
      // Optimize database
      await this.optimizeDatabase();
      
      // Update statistics
      await this.updateStatistics();
      
      // Clean old backups
      await this.cleanOldBackups();
      
      console.log('Database maintenance completed successfully');
    } catch (error) {
      console.error('Database maintenance failed:', error);
      throw error;
    }
  }

  getDatabaseUrl() {
    const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;
    return `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
  }
}

// Run maintenance if called directly
if (require.main === module) {
  const maintenance = new DatabaseMaintenance();
  maintenance.runMaintenance()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = DatabaseMaintenance;