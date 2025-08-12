const db = require('../config/database');
const fs = require('fs');
const path = require('path');

class TrainingDataGenerator {
  constructor() {
    this.outputDir = './training-data';
    this.ensureOutputDir();
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  // Generate training data for maintenance prediction
  async generateMaintenanceData() {
    console.log('📊 Generating maintenance training data...');

    const sensors = await db('sensors').select('*');
    const trainingData = [];

    for (const sensor of sensors) {
      // Get historical readings
      const readings = await db('sensor_readings')
        .where({ sensor_id: sensor.id })
        .orderBy('timestamp', 'asc');

      if (readings.length < 50) continue;

      // Generate features for different time windows
      for (let i = 50; i < readings.length; i += 10) {
        const windowReadings = readings.slice(i - 50, i);
        const features = this.extractMaintenanceFeatures(sensor, windowReadings);
        
        // Simulate maintenance labels based on realistic criteria
        const needsMaintenance = this.simulateMaintenanceLabel(sensor, features, readings[i]);
        
        trainingData.push({
          sensorId: sensor.id,
          sensorType: sensor.sensor_type,
          features,
          needsMaintenance,
          timestamp: readings[i].timestamp
        });
      }
    }

    // Save training data
    const filePath = path.join(this.outputDir, 'maintenance_training_data.json');
    fs.writeFileSync(filePath, JSON.stringify(trainingData, null, 2));
    
    console.log(`✅ Generated ${trainingData.length} maintenance training samples`);
    console.log(`💾 Saved to: ${filePath}`);

    return trainingData;
  }

  // Generate training data for anomaly detection
  async generateAnomalyData() {
    console.log('📊 Generating anomaly training data...');

    const sensors = await db('sensors').select('*');
    const trainingData = [];

    for (const sensor of sensors) {
      const readings = await db('sensor_readings')
        .where({ sensor_id: sensor.id })
        .orderBy('timestamp', 'asc');

      if (readings.length < 100) continue;

      // Generate normal and anomalous sequences
      for (let i = 24; i < readings.length; i++) {
        const window = readings.slice(i - 24, i);
        const values = window.map(r => r.value);
        
        // Normalize values
        const normalizedValues = this.normalizeValues(values);
        
        // Label as anomaly based on statistical criteria
        const isAnomaly = this.simulateAnomalyLabel(values, readings[i].value);
        
        trainingData.push({
          sensorId: sensor.id,
          sensorType: sensor.sensor_type,
          sequence: normalizedValues,
          isAnomaly,
          timestamp: readings[i].timestamp
        });
      }
    }

    const filePath = path.join(this.outputDir, 'anomaly_training_data.json');
    fs.writeFileSync(filePath, JSON.stringify(trainingData, null, 2));
    
    console.log(`✅ Generated ${trainingData.length} anomaly training samples`);
    console.log(`💾 Saved to: ${filePath}`);

    return trainingData;
  }

  // Generate training data for pattern recognition
  async generatePatternData() {
    console.log('📊 Generating pattern training data...');

    const sensors = await db('sensors').select('*');
    const trainingData = [];

    for (const sensor of sensors) {
      const readings = await db('sensor_readings')
        .where({ sensor_id: sensor.id })
        .orderBy('timestamp', 'asc');

      if (readings.length < 200) continue;

      // Generate sequences for time series prediction
      const sequenceLength = 168; // 7 days
      const predictionLength = 24; // 1 day

      for (let i = sequenceLength; i < readings.length - predictionLength; i += 24) {
        const inputSequence = readings.slice(i - sequenceLength, i);
        const targetSequence = readings.slice(i, i + predictionLength);
        
        const inputValues = inputSequence.map(r => r.value);
        const targetValues = targetSequence.map(r => r.value);
        
        // Normalize sequences
        const normalizedInput = this.normalizeValues(inputValues);
        const normalizedTarget = this.normalizeValues(targetValues);
        
        trainingData.push({
          sensorId: sensor.id,
          sensorType: sensor.sensor_type,
          inputSequence: normalizedInput,
          targetSequence: normalizedTarget,
          timestamp: readings[i].timestamp
        });
      }
    }

    const filePath = path.join(this.outputDir, 'pattern_training_data.json');
    fs.writeFileSync(filePath, JSON.stringify(trainingData, null, 2));
    
    console.log(`✅ Generated ${trainingData.length} pattern training samples`);
    console.log(`💾 Saved to: ${filePath}`);

    return trainingData;
  }

  // Generate training data for optimization
  async generateOptimizationData() {
    console.log('📊 Generating optimization training data...');

    const trainingData = [];
    
    // Get system-wide data snapshots
    const timeWindows = await this.getSystemSnapshots();
    
    for (const snapshot of timeWindows) {
      const features = this.extractSystemFeatures(snapshot);
      const targets = this.simulateOptimizationTargets(snapshot);
      
      trainingData.push({
        timestamp: snapshot.timestamp,
        features,
        targets
      });
    }

    const filePath = path.join(this.outputDir, 'optimization_training_data.json');
    fs.writeFileSync(filePath, JSON.stringify(trainingData, null, 2));
    
    console.log(`✅ Generated ${trainingData.length} optimization training samples`);
    console.log(`💾 Saved to: ${filePath}`);

    return trainingData;
  }

  // Helper methods
  extractMaintenanceFeatures(sensor, readings) {
    const values = readings.map(r => r.value);
    const qualities = readings.map(r => r.quality);
    
    // Reading frequency
    const intervals = [];
    for (let i = 1; i < readings.length; i++) {
      const interval = new Date(readings[i-1].timestamp).getTime() - new Date(readings[i].timestamp).getTime();
      intervals.push(interval);
    }
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const readingFrequency = Math.min(1, (5 * 60 * 1000) / avgInterval);

    // Quality trend
    const qualityScores = qualities.map(q => {
      switch (q) {
        case 'excellent': return 4;
        case 'good': return 3;
        case 'moderate': return 2;
        case 'poor': return 1;
        default: return 3;
      }
    });
    
    const firstHalf = qualityScores.slice(0, Math.floor(qualityScores.length / 2));
    const secondHalf = qualityScores.slice(Math.floor(qualityScores.length / 2));
    const qualityTrend = (secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length) - 
                        (firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length);

    // Value drift
    const firstQuarter = values.slice(0, Math.floor(values.length / 4));
    const lastQuarter = values.slice(-Math.floor(values.length / 4));
    const valueDrift = Math.abs(
      (lastQuarter.reduce((a, b) => a + b, 0) / lastQuarter.length) -
      (firstQuarter.reduce((a, b) => a + b, 0) / firstQuarter.length)
    );

    // Sensor age
    const sensorAge = Math.floor((new Date() - new Date(sensor.created_at)) / (24 * 60 * 60 * 1000));
    
    // Days since calibration
    const lastCalibration = Math.floor((new Date() - new Date(sensor.calibration_date)) / (24 * 60 * 60 * 1000));

    // Battery decline simulation
    const batteryDecline = Math.max(0, (sensorAge / 365) * 0.1 + (1 - readingFrequency) * 0.05);

    return {
      readingFrequency,
      qualityTrend,
      valueDrift,
      batteryDecline,
      sensorAge,
      lastCalibration
    };
  }

  simulateMaintenanceLabel(sensor, features, currentReading) {
    let riskScore = 0;

    // Battery risk
    if (features.batteryDecline > 0.1) riskScore += 0.3;
    
    // Quality degradation
    if (features.qualityTrend < -0.5) riskScore += 0.25;
    
    // Reading frequency issues
    if (features.readingFrequency < 0.7) riskScore += 0.2;
    
    // Calibration overdue
    if (features.lastCalibration > 120) riskScore += 0.15;
    
    // Sensor age
    if (features.sensorAge > 400) riskScore += 0.1;

    // Add some randomness for realistic data
    riskScore += (Math.random() - 0.5) * 0.2;

    return riskScore > 0.6;
  }

  simulateAnomalyLabel(values, currentValue) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length);
    
    const zScore = Math.abs((currentValue - mean) / stdDev);
    
    // Consider it an anomaly if z-score > 2.5
    return zScore > 2.5;
  }

  normalizeValues(values) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    
    if (range === 0) return values.map(() => 0);
    
    return values.map(val => (val - min) / range);
  }

  async getSystemSnapshots() {
    // Get hourly snapshots of system state
    const snapshots = [];
    const hoursBack = 24 * 30; // 30 days
    
    for (let h = 0; h < hoursBack; h++) {
      const timestamp = new Date(Date.now() - h * 60 * 60 * 1000);
      const startTime = new Date(timestamp.getTime() - 30 * 60 * 1000);
      const endTime = new Date(timestamp.getTime() + 30 * 60 * 1000);
      
      const readings = await db('sensor_readings')
        .join('sensors', 'sensor_readings.sensor_id', 'sensors.id')
        .where('sensor_readings.timestamp', '>=', startTime)
        .where('sensor_readings.timestamp', '<=', endTime)
        .select('sensors.*', 'sensor_readings.*');
      
      if (readings.length > 0) {
        snapshots.push({
          timestamp,
          readings
        });
      }
    }
    
    return snapshots;
  }

  extractSystemFeatures(snapshot) {
    const readings = snapshot.readings;
    const sensorTypes = ['temperature', 'humidity', 'energy', 'co2', 'sound'];
    const features = [];
    
    sensorTypes.forEach(type => {
      const typeReadings = readings.filter(r => r.sensor_type === type);
      if (typeReadings.length > 0) {
        const values = typeReadings.map(r => r.value);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
        
        features.push(avg, variance);
      } else {
        features.push(0, 0);
      }
    });
    
    return features;
  }

  simulateOptimizationTargets(snapshot) {
    const readings = snapshot.readings;
    
    // Energy optimization score
    const energyReadings = readings.filter(r => r.sensor_type === 'energy');
    const energyScore = energyReadings.length > 0 ? 
      Math.min(1, energyReadings.reduce((sum, r) => sum + r.value, 0) / (energyReadings.length * 100)) : 0;
    
    // Maintenance score
    const oldSensors = readings.filter(r => {
      const age = (new Date() - new Date(r.created_at)) / (365 * 24 * 60 * 60 * 1000);
      return age > 1;
    });
    const maintenanceScore = oldSensors.length / readings.length;
    
    // Performance score
    const goodQualityReadings = readings.filter(r => ['excellent', 'good'].includes(r.quality));
    const performanceScore = goodQualityReadings.length / readings.length;
    
    return [energyScore, maintenanceScore, performanceScore];
  }

  // Generate all training data
  async generateAllTrainingData() {
    console.log('🚀 Starting training data generation...');
    
    try {
      await this.generateMaintenanceData();
      await this.generateAnomalyData();
      await this.generatePatternData();
      await this.generateOptimizationData();
      
      console.log('✅ All training data generated successfully!');
      console.log(`📁 Data saved in: ${this.outputDir}`);
      
    } catch (error) {
      console.error('❌ Error generating training data:', error);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const generator = new TrainingDataGenerator();
  generator.generateAllTrainingData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = TrainingDataGenerator;