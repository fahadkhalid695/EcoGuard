const tf = require('@tensorflow/tfjs-node');
const db = require('../config/database');

class AIEngine {
  constructor() {
    this.models = new Map();
    this.isInitialized = false;
    this.initialize();
  }

  async initialize() {
    console.log('🤖 Initializing AI Engine...');
    
    try {
      // Load or create models
      await this.loadModels();
      this.isInitialized = true;
      console.log('✅ AI Engine initialized successfully');
    } catch (error) {
      console.error('❌ AI Engine initialization failed:', error);
    }
  }

  async loadModels() {
    // Load pre-trained models or create new ones
    await this.loadMaintenanceModel();
    await this.loadAnomalyModel();
    await this.loadPatternModel();
    await this.loadOptimizationModel();
  }

  // 🔧 PREDICTIVE MAINTENANCE MODEL
  async loadMaintenanceModel() {
    try {
      // Try to load existing model
      const model = await tf.loadLayersModel('file://./models/maintenance/model.json').catch(() => null);
      
      if (model) {
        this.models.set('maintenance', model);
        console.log('📊 Loaded existing maintenance model');
      } else {
        // Create new model
        const newModel = this.createMaintenanceModel();
        this.models.set('maintenance', newModel);
        console.log('🆕 Created new maintenance model');
      }
    } catch (error) {
      console.error('Error loading maintenance model:', error);
    }
  }

  createMaintenanceModel() {
    // Neural network for maintenance prediction
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [6], // 6 features: battery, quality, frequency, age, calibration, drift
          units: 32,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 16,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.1 }),
        tf.layers.dense({
          units: 8,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 1,
          activation: 'sigmoid' // Output: probability of needing maintenance
        })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  async predictMaintenance(sensorId, features) {
    const model = this.models.get('maintenance');
    if (!model) {
      throw new Error('Maintenance model not loaded');
    }

    // Normalize features
    const normalizedFeatures = this.normalizeMaintenanceFeatures(features);
    
    // Make prediction
    const input = tf.tensor2d([normalizedFeatures]);
    const prediction = model.predict(input);
    const probability = await prediction.data();
    
    // Cleanup tensors
    input.dispose();
    prediction.dispose();

    const riskScore = probability[0];
    const needsMaintenance = riskScore > 0.6;
    const estimatedDays = Math.max(1, Math.floor(30 * (1 - riskScore)));
    const confidence = Math.min(0.95, 0.5 + (riskScore * 0.5));

    return {
      needsMaintenance,
      estimatedDays,
      confidence,
      riskScore,
      reasons: this.generateMaintenanceReasons(features, riskScore)
    };
  }

  normalizeMaintenanceFeatures(features) {
    return [
      Math.min(1, features.batteryDecline * 10), // 0-1
      Math.min(1, Math.abs(features.qualityTrend)), // 0-1
      features.readingFrequency, // already 0-1
      Math.min(1, features.sensorAge / 730), // normalize to 2 years
      Math.min(1, features.lastCalibration / 365), // normalize to 1 year
      Math.min(1, features.valueDrift) // 0-1
    ];
  }

  generateMaintenanceReasons(features, riskScore) {
    const reasons = [];
    
    if (features.batteryDecline > 0.1) {
      reasons.push(`Battery declining at ${(features.batteryDecline * 100).toFixed(1)}% per day`);
    }
    if (features.qualityTrend < -0.2) {
      reasons.push('Sensor quality degrading over time');
    }
    if (features.readingFrequency < 0.8) {
      reasons.push('Irregular reading frequency detected');
    }
    if (features.lastCalibration > 90) {
      reasons.push(`Calibration overdue by ${features.lastCalibration - 90} days`);
    }
    if (features.sensorAge > 365) {
      reasons.push('Sensor approaching end of recommended lifespan');
    }
    if (features.valueDrift > 0.3) {
      reasons.push('Significant sensor drift detected');
    }

    return reasons;
  }

  // 🚨 ANOMALY DETECTION MODEL
  async loadAnomalyModel() {
    try {
      const model = await tf.loadLayersModel('file://./models/anomaly/model.json').catch(() => null);
      
      if (model) {
        this.models.set('anomaly', model);
        console.log('📊 Loaded existing anomaly model');
      } else {
        const newModel = this.createAnomalyModel();
        this.models.set('anomaly', newModel);
        console.log('🆕 Created new anomaly model');
      }
    } catch (error) {
      console.error('Error loading anomaly model:', error);
    }
  }

  createAnomalyModel() {
    // Autoencoder for anomaly detection
    const encoder = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [24], // 24-hour window
          units: 16,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 8,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 4,
          activation: 'relu'
        })
      ]
    });

    const decoder = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [4],
          units: 8,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 16,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 24,
          activation: 'linear'
        })
      ]
    });

    const autoencoder = tf.sequential();
    autoencoder.add(encoder);
    autoencoder.add(decoder);

    autoencoder.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError'
    });

    return autoencoder;
  }

  async detectAnomalies(sensorId, readings) {
    const model = this.models.get('anomaly');
    if (!model || readings.length < 24) {
      return [];
    }

    const anomalies = [];
    const windowSize = 24;

    for (let i = windowSize; i < readings.length; i++) {
      const window = readings.slice(i - windowSize, i).map(r => r.value);
      const normalizedWindow = this.normalizeWindow(window);
      
      // Predict reconstruction
      const input = tf.tensor2d([normalizedWindow]);
      const reconstruction = model.predict(input);
      const reconstructionData = await reconstruction.data();
      
      // Calculate reconstruction error
      const error = this.calculateReconstructionError(normalizedWindow, Array.from(reconstructionData));
      const threshold = 0.1; // Adjust based on your data
      
      if (error > threshold) {
        anomalies.push({
          timestamp: readings[i].timestamp,
          value: readings[i].value,
          error,
          severity: error > 0.2 ? 'high' : 'medium'
        });
      }

      // Cleanup
      input.dispose();
      reconstruction.dispose();
    }

    return anomalies;
  }

  normalizeWindow(window) {
    const min = Math.min(...window);
    const max = Math.max(...window);
    const range = max - min;
    
    if (range === 0) return window.map(() => 0);
    
    return window.map(val => (val - min) / range);
  }

  calculateReconstructionError(original, reconstructed) {
    let sumSquaredError = 0;
    for (let i = 0; i < original.length; i++) {
      sumSquaredError += Math.pow(original[i] - reconstructed[i], 2);
    }
    return Math.sqrt(sumSquaredError / original.length);
  }

  // 📈 PATTERN RECOGNITION MODEL
  async loadPatternModel() {
    try {
      const model = await tf.loadLayersModel('file://./models/pattern/model.json').catch(() => null);
      
      if (model) {
        this.models.set('pattern', model);
        console.log('📊 Loaded existing pattern model');
      } else {
        const newModel = this.createPatternModel();
        this.models.set('pattern', newModel);
        console.log('🆕 Created new pattern model');
      }
    } catch (error) {
      console.error('Error loading pattern model:', error);
    }
  }

  createPatternModel() {
    // LSTM for time series pattern recognition
    const model = tf.sequential({
      layers: [
        tf.layers.lstm({
          inputShape: [168, 1], // 7 days of hourly data
          units: 50,
          returnSequences: true
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.lstm({
          units: 50,
          returnSequences: false
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 25,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 24, // Predict next 24 hours
          activation: 'linear'
        })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    return model;
  }

  async analyzePatterns(sensorId, readings) {
    const model = this.models.get('pattern');
    if (!model || readings.length < 168) {
      return {
        trend: 'stable',
        seasonality: false,
        forecast: [],
        confidence: 0.1
      };
    }

    // Prepare data for LSTM
    const values = readings.map(r => r.value);
    const normalizedValues = this.normalizeTimeSeries(values);
    
    // Create sequences for LSTM
    const sequences = this.createSequences(normalizedValues, 168);
    if (sequences.length === 0) return { trend: 'stable', seasonality: false, forecast: [], confidence: 0.1 };

    // Use the last sequence to predict
    const lastSequence = sequences[sequences.length - 1];
    const input = tf.tensor3d([lastSequence]);
    
    const prediction = model.predict(input);
    const forecastData = await prediction.data();
    
    // Denormalize forecast
    const forecast = this.denormalizeForecast(Array.from(forecastData), values);
    
    // Analyze trend
    const trend = this.analyzeTrend(values);
    
    // Detect seasonality
    const seasonality = this.detectSeasonality(values);

    // Cleanup
    input.dispose();
    prediction.dispose();

    return {
      trend: trend.direction,
      seasonality: seasonality.hasSeasonality,
      cyclePeriod: seasonality.period,
      forecast,
      confidence: Math.min(0.9, 0.5 + (readings.length / 1000))
    };
  }

  normalizeTimeSeries(values) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    
    if (range === 0) return values.map(() => 0);
    
    return values.map(val => (val - min) / range);
  }

  createSequences(data, sequenceLength) {
    const sequences = [];
    for (let i = 0; i <= data.length - sequenceLength; i++) {
      sequences.push(data.slice(i, i + sequenceLength).map(val => [val]));
    }
    return sequences;
  }

  denormalizeForecast(normalizedForecast, originalValues) {
    const min = Math.min(...originalValues);
    const max = Math.max(...originalValues);
    const range = max - min;
    
    if (range === 0) return normalizedForecast;
    
    return normalizedForecast.map(val => val * range + min);
  }

  analyzeTrend(values) {
    // Simple linear regression
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    let direction = 'stable';
    if (Math.abs(slope) > 0.01) {
      direction = slope > 0 ? 'increasing' : 'decreasing';
    }

    return { slope, direction };
  }

  detectSeasonality(values) {
    // Autocorrelation for common periods
    const periods = [24, 168]; // 24 hours, 7 days
    let maxCorrelation = 0;
    let bestPeriod = 0;

    for (const period of periods) {
      if (values.length > period * 2) {
        const correlation = this.calculateAutocorrelation(values, period);
        if (correlation > maxCorrelation) {
          maxCorrelation = correlation;
          bestPeriod = period;
        }
      }
    }

    return {
      hasSeasonality: maxCorrelation > 0.3,
      period: bestPeriod,
      strength: maxCorrelation
    };
  }

  calculateAutocorrelation(values, lag) {
    if (values.length <= lag) return 0;

    const n = values.length - lag;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      numerator += (values[i] - mean) * (values[i + lag] - mean);
    }

    for (let i = 0; i < values.length; i++) {
      denominator += Math.pow(values[i] - mean, 2);
    }

    return denominator === 0 ? 0 : numerator / denominator;
  }

  // ⚡ OPTIMIZATION MODEL
  async loadOptimizationModel() {
    try {
      const model = await tf.loadLayersModel('file://./models/optimization/model.json').catch(() => null);
      
      if (model) {
        this.models.set('optimization', model);
        console.log('📊 Loaded existing optimization model');
      } else {
        const newModel = this.createOptimizationModel();
        this.models.set('optimization', newModel);
        console.log('🆕 Created new optimization model');
      }
    } catch (error) {
      console.error('Error loading optimization model:', error);
    }
  }

  createOptimizationModel() {
    // Multi-output model for optimization recommendations
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [10], // Multiple sensor inputs
          units: 64,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({
          units: 32,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 16,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 3, // Energy, maintenance, performance scores
          activation: 'sigmoid'
        })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    return model;
  }

  async generateOptimizations(sensorsData) {
    const model = this.models.get('optimization');
    if (!model) {
      return [];
    }

    const features = this.extractOptimizationFeatures(sensorsData);
    const input = tf.tensor2d([features]);
    
    const prediction = model.predict(input);
    const scores = await prediction.data();
    
    // Cleanup
    input.dispose();
    prediction.dispose();

    return this.interpretOptimizationScores(scores, sensorsData);
  }

  extractOptimizationFeatures(sensorsData) {
    // Extract relevant features from sensor data
    const features = new Array(10).fill(0);
    
    // Energy consumption features
    const energySensors = sensorsData.filter(s => s.type === 'energy');
    if (energySensors.length > 0) {
      features[0] = energySensors.reduce((sum, s) => sum + s.avgValue, 0) / energySensors.length;
      features[1] = energySensors.reduce((sum, s) => sum + s.variance, 0) / energySensors.length;
    }

    // Temperature features
    const tempSensors = sensorsData.filter(s => s.type === 'temperature');
    if (tempSensors.length > 0) {
      features[2] = tempSensors.reduce((sum, s) => sum + s.avgValue, 0) / tempSensors.length;
      features[3] = tempSensors.reduce((sum, s) => sum + s.variance, 0) / tempSensors.length;
    }

    // Other environmental factors
    const humiditySensors = sensorsData.filter(s => s.type === 'humidity');
    if (humiditySensors.length > 0) {
      features[4] = humiditySensors.reduce((sum, s) => sum + s.avgValue, 0) / humiditySensors.length;
    }

    // System health indicators
    features[5] = sensorsData.filter(s => s.status === 'online').length / sensorsData.length;
    features[6] = sensorsData.reduce((sum, s) => sum + (s.batteryLevel || 100), 0) / sensorsData.length / 100;
    features[7] = sensorsData.filter(s => s.qualityScore > 0.8).length / sensorsData.length;

    // Usage patterns
    features[8] = this.calculateUsageVariability(sensorsData);
    features[9] = this.calculateSystemEfficiency(sensorsData);

    return features;
  }

  calculateUsageVariability(sensorsData) {
    // Calculate how variable the usage patterns are
    const energySensors = sensorsData.filter(s => s.type === 'energy');
    if (energySensors.length === 0) return 0;

    const variances = energySensors.map(s => s.variance || 0);
    return variances.reduce((sum, v) => sum + v, 0) / variances.length;
  }

  calculateSystemEfficiency(sensorsData) {
    // Simple efficiency metric based on sensor performance
    const onlineSensors = sensorsData.filter(s => s.status === 'online').length;
    const totalSensors = sensorsData.length;
    const avgQuality = sensorsData.reduce((sum, s) => sum + (s.qualityScore || 0.5), 0) / totalSensors;
    
    return (onlineSensors / totalSensors) * avgQuality;
  }

  interpretOptimizationScores(scores, sensorsData) {
    const recommendations = [];
    const [energyScore, maintenanceScore, performanceScore] = scores;

    if (energyScore > 0.7) {
      recommendations.push({
        type: 'energy',
        description: 'High energy optimization potential detected. Consider implementing load balancing and peak shaving strategies.',
        impact: energyScore,
        effort: 'medium',
        savings: energyScore * 1000 // Estimated monthly savings
      });
    }

    if (maintenanceScore > 0.6) {
      recommendations.push({
        type: 'maintenance',
        description: 'Preventive maintenance opportunities identified. Schedule maintenance for optimal performance.',
        impact: maintenanceScore,
        effort: 'high',
        savings: maintenanceScore * 500
      });
    }

    if (performanceScore > 0.5) {
      recommendations.push({
        type: 'performance',
        description: 'System performance can be improved through sensor recalibration and network optimization.',
        impact: performanceScore,
        effort: 'low',
        savings: performanceScore * 300
      });
    }

    return recommendations.sort((a, b) => b.impact - a.impact);
  }

  // 🎯 TRAINING METHODS
  async trainMaintenanceModel(trainingData) {
    const model = this.models.get('maintenance');
    if (!model) return;

    console.log('🎓 Training maintenance model...');

    const { features, labels } = this.prepareMaintenanceTrainingData(trainingData);
    
    const xs = tf.tensor2d(features);
    const ys = tf.tensor2d(labels);

    await model.fit(xs, ys, {
      epochs: 100,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 10 === 0) {
            console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`);
          }
        }
      }
    });

    // Save model
    await model.save('file://./models/maintenance');
    
    // Cleanup
    xs.dispose();
    ys.dispose();

    console.log('✅ Maintenance model training completed');
  }

  prepareMaintenanceTrainingData(data) {
    const features = [];
    const labels = [];

    data.forEach(item => {
      features.push(this.normalizeMaintenanceFeatures(item.features));
      labels.push([item.needsMaintenance ? 1 : 0]);
    });

    return { features, labels };
  }

  // 📊 MODEL MANAGEMENT
  async saveModel(modelName) {
    const model = this.models.get(modelName);
    if (model) {
      await model.save(`file://./models/${modelName}`);
      console.log(`💾 Saved ${modelName} model`);
    }
  }

  async saveAllModels() {
    for (const [name, model] of this.models) {
      try {
        await this.saveModel(name);
      } catch (error) {
        console.error(`Error saving ${name} model:`, error);
      }
    }
  }

  getModelInfo() {
    const info = {};
    for (const [name, model] of this.models) {
      info[name] = {
        inputShape: model.inputShape,
        outputShape: model.outputShape,
        trainableParams: model.countParams()
      };
    }
    return info;
  }

  // 🧹 CLEANUP
  dispose() {
    for (const [name, model] of this.models) {
      model.dispose();
      console.log(`🧹 Disposed ${name} model`);
    }
    this.models.clear();
  }
}

module.exports = new AIEngine();