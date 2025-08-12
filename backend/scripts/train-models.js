const aiEngine = require('../services/aiEngine');
const TrainingDataGenerator = require('./generate-training-data');
const fs = require('fs');
const path = require('path');

class ModelTrainer {
  constructor() {
    this.trainingDataDir = './training-data';
    this.modelsDir = './models';
    this.ensureDirectories();
  }

  ensureDirectories() {
    [this.trainingDataDir, this.modelsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // Create model subdirectories
    ['maintenance', 'anomaly', 'pattern', 'optimization'].forEach(modelType => {
      const modelDir = path.join(this.modelsDir, modelType);
      if (!fs.existsSync(modelDir)) {
        fs.mkdirSync(modelDir, { recursive: true });
      }
    });
  }

  async trainAllModels() {
    console.log('🎓 Starting AI model training...');

    try {
      // Generate training data if it doesn't exist
      await this.ensureTrainingData();

      // Train each model
      await this.trainMaintenanceModel();
      await this.trainAnomalyModel();
      await this.trainPatternModel();
      await this.trainOptimizationModel();

      console.log('✅ All models trained successfully!');
      
      // Save model information
      await this.saveModelInfo();
      
    } catch (error) {
      console.error('❌ Error training models:', error);
      throw error;
    }
  }

  async ensureTrainingData() {
    const requiredFiles = [
      'maintenance_training_data.json',
      'anomaly_training_data.json',
      'pattern_training_data.json',
      'optimization_training_data.json'
    ];

    const missingFiles = requiredFiles.filter(file => 
      !fs.existsSync(path.join(this.trainingDataDir, file))
    );

    if (missingFiles.length > 0) {
      console.log('📊 Generating missing training data...');
      const generator = new TrainingDataGenerator();
      await generator.generateAllTrainingData();
    }
  }

  async trainMaintenanceModel() {
    console.log('🔧 Training maintenance prediction model...');

    const dataPath = path.join(this.trainingDataDir, 'maintenance_training_data.json');
    const trainingData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    if (trainingData.length < 100) {
      console.log('⚠️ Insufficient training data for maintenance model');
      return;
    }

    // Prepare data for TensorFlow
    const preparedData = this.prepareMaintenanceData(trainingData);
    
    try {
      await aiEngine.trainMaintenanceModel(preparedData);
      console.log('✅ Maintenance model trained successfully');
    } catch (error) {
      console.error('❌ Error training maintenance model:', error);
    }
  }

  async trainAnomalyModel() {
    console.log('🚨 Training anomaly detection model...');

    const dataPath = path.join(this.trainingDataDir, 'anomaly_training_data.json');
    const trainingData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    if (trainingData.length < 100) {
      console.log('⚠️ Insufficient training data for anomaly model');
      return;
    }

    // For autoencoder, we only need normal data
    const normalData = trainingData.filter(item => !item.isAnomaly);
    
    try {
      await this.trainAnomalyAutoencoder(normalData);
      console.log('✅ Anomaly model trained successfully');
    } catch (error) {
      console.error('❌ Error training anomaly model:', error);
    }
  }

  async trainPatternModel() {
    console.log('📈 Training pattern recognition model...');

    const dataPath = path.join(this.trainingDataDir, 'pattern_training_data.json');
    const trainingData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    if (trainingData.length < 50) {
      console.log('⚠️ Insufficient training data for pattern model');
      return;
    }

    try {
      await this.trainLSTMModel(trainingData);
      console.log('✅ Pattern model trained successfully');
    } catch (error) {
      console.error('❌ Error training pattern model:', error);
    }
  }

  async trainOptimizationModel() {
    console.log('⚡ Training optimization model...');

    const dataPath = path.join(this.trainingDataDir, 'optimization_training_data.json');
    const trainingData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    if (trainingData.length < 100) {
      console.log('⚠️ Insufficient training data for optimization model');
      return;
    }

    try {
      await this.trainOptimizationNetwork(trainingData);
      console.log('✅ Optimization model trained successfully');
    } catch (error) {
      console.error('❌ Error training optimization model:', error);
    }
  }

  prepareMaintenanceData(trainingData) {
    return trainingData.map(item => ({
      features: item.features,
      needsMaintenance: item.needsMaintenance
    }));
  }

  async trainAnomalyAutoencoder(normalData) {
    const tf = require('@tensorflow/tfjs-node');
    
    // Prepare sequences for autoencoder
    const sequences = normalData.map(item => item.sequence);
    const xs = tf.tensor2d(sequences);

    // Get the anomaly model (autoencoder)
    const model = aiEngine.models.get('anomaly');
    if (!model) {
      throw new Error('Anomaly model not found');
    }

    // Train autoencoder (input = output for reconstruction)
    await model.fit(xs, xs, {
      epochs: 50,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 10 === 0) {
            console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}`);
          }
        }
      }
    });

    // Save model
    await model.save(`file://${this.modelsDir}/anomaly`);
    
    // Cleanup
    xs.dispose();
  }

  async trainLSTMModel(trainingData) {
    const tf = require('@tensorflow/tfjs-node');
    
    // Prepare sequences for LSTM
    const inputSequences = trainingData.map(item => 
      item.inputSequence.map(val => [val])
    );
    const targetSequences = trainingData.map(item => item.targetSequence);

    const xs = tf.tensor3d(inputSequences);
    const ys = tf.tensor2d(targetSequences);

    // Get the pattern model (LSTM)
    const model = aiEngine.models.get('pattern');
    if (!model) {
      throw new Error('Pattern model not found');
    }

    // Train LSTM
    await model.fit(xs, ys, {
      epochs: 100,
      batchSize: 16,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 20 === 0) {
            console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}, mae = ${logs.mae.toFixed(4)}`);
          }
        }
      }
    });

    // Save model
    await model.save(`file://${this.modelsDir}/pattern`);
    
    // Cleanup
    xs.dispose();
    ys.dispose();
  }

  async trainOptimizationNetwork(trainingData) {
    const tf = require('@tensorflow/tfjs-node');
    
    // Prepare data for optimization model
    const features = trainingData.map(item => item.features);
    const targets = trainingData.map(item => item.targets);

    const xs = tf.tensor2d(features);
    const ys = tf.tensor2d(targets);

    // Get the optimization model
    const model = aiEngine.models.get('optimization');
    if (!model) {
      throw new Error('Optimization model not found');
    }

    // Train optimization network
    await model.fit(xs, ys, {
      epochs: 150,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 30 === 0) {
            console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}, mae = ${logs.mae.toFixed(4)}`);
          }
        }
      }
    });

    // Save model
    await model.save(`file://${this.modelsDir}/optimization`);
    
    // Cleanup
    xs.dispose();
    ys.dispose();
  }

  async saveModelInfo() {
    const modelInfo = {
      trainedAt: new Date().toISOString(),
      models: aiEngine.getModelInfo(),
      trainingDataStats: await this.getTrainingDataStats()
    };

    const infoPath = path.join(this.modelsDir, 'model_info.json');
    fs.writeFileSync(infoPath, JSON.stringify(modelInfo, null, 2));
    
    console.log(`💾 Model information saved to: ${infoPath}`);
  }

  async getTrainingDataStats() {
    const stats = {};
    
    const files = [
      'maintenance_training_data.json',
      'anomaly_training_data.json',
      'pattern_training_data.json',
      'optimization_training_data.json'
    ];

    files.forEach(file => {
      const filePath = path.join(this.trainingDataDir, file);
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const modelType = file.replace('_training_data.json', '');
        
        stats[modelType] = {
          samples: data.length,
          fileSize: fs.statSync(filePath).size,
          lastModified: fs.statSync(filePath).mtime
        };
      }
    });

    return stats;
  }

  // Evaluate model performance
  async evaluateModels() {
    console.log('📊 Evaluating model performance...');

    const results = {};

    try {
      // Evaluate maintenance model
      results.maintenance = await this.evaluateMaintenanceModel();
      
      // Evaluate anomaly model
      results.anomaly = await this.evaluateAnomalyModel();
      
      // Save evaluation results
      const resultsPath = path.join(this.modelsDir, 'evaluation_results.json');
      fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
      
      console.log('✅ Model evaluation completed');
      console.log(`📊 Results saved to: ${resultsPath}`);
      
    } catch (error) {
      console.error('❌ Error evaluating models:', error);
    }

    return results;
  }

  async evaluateMaintenanceModel() {
    // Load test data
    const dataPath = path.join(this.trainingDataDir, 'maintenance_training_data.json');
    const allData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // Use last 20% as test data
    const testSize = Math.floor(allData.length * 0.2);
    const testData = allData.slice(-testSize);
    
    let correct = 0;
    let total = testData.length;

    for (const item of testData) {
      try {
        const prediction = await aiEngine.predictMaintenance(item.sensorId, item.features);
        if (prediction.needsMaintenance === item.needsMaintenance) {
          correct++;
        }
      } catch (error) {
        console.error('Error in maintenance prediction:', error);
      }
    }

    const accuracy = correct / total;
    console.log(`🔧 Maintenance model accuracy: ${(accuracy * 100).toFixed(2)}%`);

    return {
      accuracy,
      testSamples: total,
      correctPredictions: correct
    };
  }

  async evaluateAnomalyModel() {
    // Load test data
    const dataPath = path.join(this.trainingDataDir, 'anomaly_training_data.json');
    const allData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // Use last 20% as test data
    const testSize = Math.floor(allData.length * 0.2);
    const testData = allData.slice(-testSize);
    
    let truePositives = 0;
    let falsePositives = 0;
    let trueNegatives = 0;
    let falseNegatives = 0;

    for (const item of testData) {
      try {
        const readings = item.sequence.map((val, idx) => ({
          value: val,
          timestamp: new Date(Date.now() - (24 - idx) * 60 * 60 * 1000)
        }));
        
        const anomalies = await aiEngine.detectAnomalies(item.sensorId, readings);
        const predictedAnomaly = anomalies.length > 0;
        
        if (item.isAnomaly && predictedAnomaly) truePositives++;
        else if (!item.isAnomaly && predictedAnomaly) falsePositives++;
        else if (!item.isAnomaly && !predictedAnomaly) trueNegatives++;
        else if (item.isAnomaly && !predictedAnomaly) falseNegatives++;
        
      } catch (error) {
        console.error('Error in anomaly detection:', error);
      }
    }

    const precision = truePositives / (truePositives + falsePositives) || 0;
    const recall = truePositives / (truePositives + falseNegatives) || 0;
    const f1Score = 2 * (precision * recall) / (precision + recall) || 0;

    console.log(`🚨 Anomaly model - Precision: ${(precision * 100).toFixed(2)}%, Recall: ${(recall * 100).toFixed(2)}%, F1: ${(f1Score * 100).toFixed(2)}%`);

    return {
      precision,
      recall,
      f1Score,
      truePositives,
      falsePositives,
      trueNegatives,
      falseNegatives
    };
  }
}

// Run if called directly
if (require.main === module) {
  const trainer = new ModelTrainer();
  
  const command = process.argv[2] || 'train';
  
  switch (command) {
    case 'train':
      trainer.trainAllModels()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
      
    case 'evaluate':
      trainer.evaluateModels()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
      
    default:
      console.log('Usage: node train-models.js [train|evaluate]');
      process.exit(1);
  }
}

module.exports = ModelTrainer;