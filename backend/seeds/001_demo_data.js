const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  // Clear existing entries
  await knex('predictions').del();
  await knex('ai_models').del();
  await knex('alerts').del();
  await knex('sensor_readings').del();
  await knex('sensors').del();
  await knex('users').del();

  // Create demo users
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const users = await knex('users').insert([
    {
      email: 'admin@ecoguard.com',
      password_hash: hashedPassword,
      first_name: 'Admin',
      last_name: 'User',
      organization: 'EcoGuard Pro',
      role: 'super_admin',
      is_active: true,
      email_verified: true
    },
    {
      email: 'demo@ecoguard.com',
      password_hash: hashedPassword,
      first_name: 'Demo',
      last_name: 'User',
      organization: 'Demo Organization',
      role: 'user',
      is_active: true,
      email_verified: true
    },
    {
      email: 'manager@ecoguard.com',
      password_hash: hashedPassword,
      first_name: 'Manager',
      last_name: 'User',
      organization: 'EcoGuard Pro',
      role: 'admin',
      is_active: true,
      email_verified: true
    }
  ]).returning('*');

  const demoUser = users.find(u => u.email === 'demo@ecoguard.com');

  // Create demo sensors
  const sensors = await knex('sensors').insert([
    {
      device_id: 'TEMP-001',
      name: 'Office Temperature Sensor',
      sensor_type: 'temperature',
      connection_type: 'wifi',
      location_lat: 40.7128,
      location_lng: -74.0060,
      location_name: 'Office Building A - Floor 1',
      status: 'online',
      battery_level: 85,
      calibration_date: new Date('2024-01-01'),
      next_maintenance_date: new Date('2024-06-01'),
      user_id: demoUser.id
    },
    {
      device_id: 'HUM-001',
      name: 'Office Humidity Sensor',
      sensor_type: 'humidity',
      connection_type: 'wifi',
      location_lat: 40.7128,
      location_lng: -74.0060,
      location_name: 'Office Building A - Floor 1',
      status: 'online',
      battery_level: 92,
      calibration_date: new Date('2024-01-01'),
      next_maintenance_date: new Date('2024-06-01'),
      user_id: demoUser.id
    },
    {
      device_id: 'CO2-001',
      name: 'Conference Room CO2 Monitor',
      sensor_type: 'co2',
      connection_type: 'wifi',
      location_lat: 40.7125,
      location_lng: -74.0062,
      location_name: 'Conference Room B',
      status: 'online',
      battery_level: 95,
      calibration_date: new Date('2024-01-10'),
      next_maintenance_date: new Date('2024-04-10'),
      user_id: demoUser.id
    },
    {
      device_id: 'SOUND-001',
      name: 'Cafeteria Sound Monitor',
      sensor_type: 'sound',
      connection_type: 'wifi',
      location_lat: 40.7129,
      location_lng: -74.0059,
      location_name: 'Employee Cafeteria',
      status: 'online',
      battery_level: 83,
      calibration_date: new Date('2024-01-12'),
      next_maintenance_date: new Date('2024-05-12'),
      user_id: demoUser.id
    },
    {
      device_id: 'LIGHT-001',
      name: 'Office Light Sensor',
      sensor_type: 'light',
      connection_type: 'wifi',
      location_lat: 40.7127,
      location_lng: -74.0061,
      location_name: 'Open Office Area',
      status: 'online',
      battery_level: 91,
      calibration_date: new Date('2024-01-20'),
      next_maintenance_date: new Date('2024-07-20'),
      user_id: demoUser.id
    },
    {
      device_id: 'OUTDOOR-001',
      name: 'Outdoor Environmental Station',
      sensor_type: 'temperature',
      connection_type: 'lorawan',
      location_lat: 40.7130,
      location_lng: -74.0055,
      location_name: 'Outdoor Weather Station',
      status: 'online',
      battery_level: 78,
      calibration_date: new Date('2024-01-15'),
      next_maintenance_date: new Date('2024-07-15'),
      user_id: demoUser.id
    }
  ]).returning('*');

  // Generate demo sensor readings (last 7 days)
  const readings = [];
  const now = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    
    for (let hour = 0; hour < 24; hour += 2) { // Every 2 hours
      const timestamp = new Date(date);
      timestamp.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
      
      sensors.forEach(sensor => {
        let value, unit, quality;
        
        switch (sensor.sensor_type) {
          case 'temperature':
            value = 20 + Math.random() * 8 + Math.sin(hour / 24 * 2 * Math.PI) * 3;
            unit = '°C';
            quality = value > 26 ? 'moderate' : 'good';
            break;
          case 'humidity':
            value = 45 + Math.random() * 20 + Math.sin(hour / 24 * 2 * Math.PI) * 10;
            unit = '%';
            quality = value > 65 ? 'moderate' : 'good';
            break;
          case 'co2':
            value = 400 + Math.random() * 400 + (hour > 8 && hour < 18 ? 200 : 0);
            unit = 'ppm';
            quality = value > 800 ? 'poor' : value > 600 ? 'moderate' : 'good';
            break;
          case 'sound':
            value = 35 + Math.random() * 25 + (hour > 8 && hour < 18 ? 15 : 0);
            unit = 'dB';
            quality = value > 65 ? 'poor' : value > 55 ? 'moderate' : 'good';
            break;
          case 'light':
            value = hour > 6 && hour < 20 ? 200 + Math.random() * 600 : Math.random() * 50;
            unit = 'lux';
            quality = 'good';
            break;
        }
        
        readings.push({
          sensor_id: sensor.id,
          timestamp,
          value: Math.round(value * 100) / 100,
          unit,
          quality,
          location_lat: sensor.location_lat,
          location_lng: sensor.location_lng,
          location_name: sensor.location_name
        });
      });
    }
  }

  await knex('sensor_readings').insert(readings);

  // Create demo alerts
  const alerts = await knex('alerts').insert([
    {
      sensor_id: sensors.find(s => s.sensor_type === 'temperature').id,
      alert_type: 'threshold',
      severity: 'medium',
      message: 'Temperature slightly above normal range: 27.5°C',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      acknowledged: false
    },
    {
      sensor_id: sensors.find(s => s.sensor_type === 'co2').id,
      alert_type: 'threshold',
      severity: 'high',
      message: 'High CO2 levels detected: 850 ppm',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      acknowledged: true,
      acknowledged_by: demoUser.id,
      acknowledged_at: new Date(Date.now() - 3 * 60 * 60 * 1000)
    },
    {
      sensor_id: sensors.find(s => s.sensor_type === 'sound').id,
      alert_type: 'threshold',
      severity: 'medium',
      message: 'Noise levels elevated: 68 dB',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      acknowledged: true,
      acknowledged_by: demoUser.id,
      acknowledged_at: new Date(Date.now() - 5 * 60 * 60 * 1000),
      resolved_at: new Date(Date.now() - 4 * 60 * 60 * 1000)
    }
  ]).returning('*');

  // Create demo AI models
  const aiModels = await knex('ai_models').insert([
    {
      name: 'Predictive Maintenance Model',
      type: 'predictive_maintenance',
      accuracy: 0.92,
      last_training: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: 'active',
      description: 'Predicts sensor maintenance needs based on performance metrics'
    },
    {
      name: 'Anomaly Detection Model',
      type: 'anomaly_detection',
      accuracy: 0.88,
      last_training: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'active',
      description: 'Detects unusual patterns in sensor readings'
    },
    {
      name: 'Energy Optimization Model',
      type: 'optimization',
      accuracy: 0.85,
      last_training: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      status: 'active',
      description: 'Provides recommendations for energy efficiency improvements'
    }
  ]).returning('*');

  // Create demo predictions
  await knex('predictions').insert([
    {
      model_id: aiModels.find(m => m.type === 'predictive_maintenance').id,
      sensor_id: sensors.find(s => s.battery_level === 78).id,
      prediction_type: 'battery_replacement',
      prediction_data: JSON.stringify({
        estimatedDays: 14,
        confidence: 0.92,
        reason: 'Battery level declining faster than normal'
      }),
      confidence: 0.92,
      timestamp: new Date(),
      valid_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    },
    {
      model_id: aiModels.find(m => m.type === 'anomaly_detection').id,
      sensor_id: sensors.find(s => s.sensor_type === 'temperature').id,
      prediction_type: 'anomaly_detected',
      prediction_data: JSON.stringify({
        anomalyType: 'temperature_spike',
        expectedValue: 22.5,
        actualValue: 27.5,
        deviation: 5.0
      }),
      confidence: 0.88,
      timestamp: new Date(),
      valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  ]);

  console.log('✅ Demo data seeded successfully');
  console.log('📧 Demo login credentials:');
  console.log('   Email: demo@ecoguard.com');
  console.log('   Password: password123');
  console.log('📧 Admin login credentials:');
  console.log('   Email: admin@ecoguard.com');
  console.log('   Password: password123');
};