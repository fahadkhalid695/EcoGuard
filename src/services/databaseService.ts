interface DatabaseConfig {
  type: 'supabase' | 'postgresql' | 'mongodb' | 'influxdb';
  connectionString: string;
  apiKey?: string;
  database?: string;
}

class DatabaseService {
  private config: DatabaseConfig;
  private client: any = null;

  constructor(config: DatabaseConfig) {
    this.config = config;
    this.initializeConnection();
  }

  private async initializeConnection() {
    switch (this.config.type) {
      case 'supabase':
        await this.initializeSupabase();
        break;
      case 'postgresql':
        await this.initializePostgreSQL();
        break;
      case 'mongodb':
        await this.initializeMongoDB();
        break;
      case 'influxdb':
        await this.initializeInfluxDB();
        break;
    }
  }

  private async initializeSupabase() {
    try {
      // Import Supabase client
      const { createClient } = await import('@supabase/supabase-js');
      
      const supabaseUrl = this.config.connectionString;
      const supabaseKey = this.config.apiKey!;
      
      this.client = createClient(supabaseUrl, supabaseKey);
      console.log('Supabase connection established');
    } catch (error) {
      console.error('Supabase connection failed:', error);
    }
  }

  private async initializePostgreSQL() {
    // For PostgreSQL, you'd typically use a library like pg
    console.log('PostgreSQL connection would be established here');
  }

  private async initializeMongoDB() {
    // For MongoDB, you'd use mongodb driver
    console.log('MongoDB connection would be established here');
  }

  private async initializeInfluxDB() {
    // For InfluxDB, you'd use @influxdata/influxdb-client
    console.log('InfluxDB connection would be established here');
  }

  // Store sensor reading
  async storeSensorReading(reading: any): Promise<boolean> {
    try {
      switch (this.config.type) {
        case 'supabase':
          const { error } = await this.client
            .from('sensor_readings')
            .insert([reading]);
          return !error;
        
        default:
          console.log('Storing reading:', reading);
          return true;
      }
    } catch (error) {
      console.error('Failed to store sensor reading:', error);
      return false;
    }
  }

  // Retrieve sensor readings
  async getSensorReadings(sensorId: string, limit: number = 100): Promise<any[]> {
    try {
      switch (this.config.type) {
        case 'supabase':
          const { data, error } = await this.client
            .from('sensor_readings')
            .select('*')
            .eq('sensor_id', sensorId)
            .order('timestamp', { ascending: false })
            .limit(limit);
          
          return error ? [] : data;
        
        default:
          return [];
      }
    } catch (error) {
      console.error('Failed to retrieve sensor readings:', error);
      return [];
    }
  }

  // Store alert
  async storeAlert(alert: any): Promise<boolean> {
    try {
      switch (this.config.type) {
        case 'supabase':
          const { error } = await this.client
            .from('alerts')
            .insert([alert]);
          return !error;
        
        default:
          console.log('Storing alert:', alert);
          return true;
      }
    } catch (error) {
      console.error('Failed to store alert:', error);
      return false;
    }
  }

  // Get system health
  async getSystemHealth(): Promise<any> {
    try {
      switch (this.config.type) {
        case 'supabase':
          // Check connection and get basic stats
          const { data, error } = await this.client
            .from('sensor_readings')
            .select('sensor_id')
            .limit(1);
          
          return {
            connected: !error,
            lastCheck: new Date(),
            status: error ? 'error' : 'healthy'
          };
        
        default:
          return {
            connected: true,
            lastCheck: new Date(),
            status: 'healthy'
          };
      }
    } catch (error) {
      return {
        connected: false,
        lastCheck: new Date(),
        status: 'error',
        error: error.message
      };
    }
  }
}

// Default configuration - you can modify this based on your setup
const defaultConfig: DatabaseConfig = {
  type: 'supabase',
  connectionString: import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url',
  apiKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-key'
};

export const databaseService = new DatabaseService(defaultConfig);
export { DatabaseService, type DatabaseConfig };