import { SensorReading, Sensor, Prediction, AIModel } from '../types/sensor';
import { apiService } from './apiService';

interface MLModelConfig {
  windowSize: number;
  threshold: number;
  minDataPoints: number;
  features: string[];
}

interface AnomalyResult {
  isAnomaly: boolean;
  score: number;
  expectedValue: number;
  actualValue: number;
  confidence: number;
}

interface MaintenancePrediction {
  needsMaintenance: boolean;
  estimatedDays: number;
  confidence: number;
  reasons: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface PatternAnalysis {
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonality: boolean;
  cyclePeriod?: number;
  forecast: number[];
  confidence: number;
}

interface OptimizationRecommendation {
  type: 'energy' | 'maintenance' | 'performance';
  description: string;
  impact: number;
  effort: 'low' | 'medium' | 'high';
  savings: number;
}

class AIService {
  private models: Map<string, AIModel> = new Map();
  private predictions: Prediction[] = [];
  private modelConfigs: Map<string, MLModelConfig> = new Map();
  private trainingData: Map<string, SensorReading[]> = new Map();

  constructor() {
    this.initializeModels();
    this.initializeModelConfigs();
  }

  private initializeModels() {
    const models: AIModel[] = [
      {
        id: 'predictive-maintenance-v1',
        name: 'Predictive Maintenance Model',
        type: 'predictive_maintenance',
        accuracy: 0.92,
        lastTraining: new Date('2024-01-01'),
        status: 'active'
      },
      {
        id: 'anomaly-detection-v1',
        name: 'Anomaly Detection Model',
        type: 'anomaly_detection',
        accuracy: 0.88,
        lastTraining: new Date('2024-01-05'),
        status: 'active'
      },
      {
        id: 'pattern-recognition-v1',
        name: 'Pattern Recognition Model',
        type: 'pattern_recognition',
        accuracy: 0.85,
        lastTraining: new Date('2024-01-10'),
        status: 'active'
      },
      {
        id: 'optimization-v1',
        name: 'Energy Optimization Model',
        type: 'optimization',
        accuracy: 0.90,
        lastTraining: new Date('2024-01-15'),
        status: 'active'
      }
    ];

    models.forEach(model => {
      this.models.set(model.id, model);
    });
  }

  private initializeModelConfigs() {
    this.modelConfigs.set('predictive-maintenance-v1', {
      windowSize: 168, // 7 days of hourly data
      threshold: 0.7,
      minDataPoints: 50,
      features: ['value', 'quality', 'batteryLevel', 'readingFrequency']
    });

    this.modelConfigs.set('anomaly-detection-v1', {
      windowSize: 24, // 24 hours
      threshold: 0.8,
      minDataPoints: 20,
      features: ['value', 'timestamp', 'quality']
    });

    this.modelConfigs.set('pattern-recognition-v1', {
      windowSize: 720, // 30 days of hourly data
      threshold: 0.6,
      minDataPoints: 100,
      features: ['value', 'timestamp', 'seasonality']
    });

    this.modelConfigs.set('optimization-v1', {
      windowSize: 168, // 7 days
      threshold: 0.75,
      minDataPoints: 50,
      features: ['value', 'efficiency', 'usage_pattern']
    });
  }

  // 🔧 PREDICTIVE MAINTENANCE
  public async predictMaintenance(sensor: Sensor, readings: SensorReading[]): Promise<MaintenancePrediction> {
    if (readings.length < 10) {
      return {
        needsMaintenance: false,
        estimatedDays: 365,
        confidence: 0.1,
        reasons: ['Insufficient data for prediction'],
        priority: 'low'
      };
    }

    const features = this.extractMaintenanceFeatures(sensor, readings);
    const prediction = this.runMaintenanceModel(features);

    return prediction;
  }

  private extractMaintenanceFeatures(sensor: Sensor, readings: SensorReading[]) {
    const recentReadings = readings.slice(-168); // Last 7 days
    
    // Calculate feature metrics
    const readingFrequency = this.calculateReadingFrequency(recentReadings);
    const qualityTrend = this.calculateQualityTrend(recentReadings);
    const valueDrift = this.calculateValueDrift(recentReadings);
    const batteryDecline = this.calculateBatteryDecline(sensor, recentReadings);

    return {
      readingFrequency,
      qualityTrend,
      valueDrift,
      batteryDecline,
      sensorAge: this.calculateSensorAge(sensor),
      lastCalibration: this.daysSinceCalibration(sensor)
    };
  }

  private runMaintenanceModel(features: any): MaintenancePrediction {
    // Simplified ML model - in production, use TensorFlow.js or similar
    let riskScore = 0;
    const reasons: string[] = [];

    // Battery risk
    if (features.batteryDecline > 0.1) {
      riskScore += 0.3;
      reasons.push(`Battery declining at ${(features.batteryDecline * 100).toFixed(1)}% per day`);
    }

    // Quality degradation
    if (features.qualityTrend < -0.2) {
      riskScore += 0.25;
      reasons.push('Sensor quality degrading over time');
    }

    // Reading frequency issues
    if (features.readingFrequency < 0.8) {
      riskScore += 0.2;
      reasons.push('Irregular reading frequency detected');
    }

    // Calibration overdue
    if (features.lastCalibration > 90) {
      riskScore += 0.15;
      reasons.push(`Calibration overdue by ${features.lastCalibration - 90} days`);
    }

    // Sensor age factor
    if (features.sensorAge > 365) {
      riskScore += 0.1;
      reasons.push('Sensor approaching end of recommended lifespan');
    }

    const needsMaintenance = riskScore > 0.6;
    const estimatedDays = Math.max(1, Math.floor(30 * (1 - riskScore)));
    const confidence = Math.min(0.95, 0.5 + (riskScore * 0.5));

    let priority: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (riskScore > 0.9) priority = 'critical';
    else if (riskScore > 0.75) priority = 'high';
    else if (riskScore > 0.6) priority = 'medium';

    return {
      needsMaintenance,
      estimatedDays,
      confidence,
      reasons,
      priority
    };
  }

  // 🚨 ANOMALY DETECTION
  public async detectAnomalies(sensorId: string, readings: SensorReading[]): Promise<AnomalyResult[]> {
    if (readings.length < 20) {
      return [];
    }

    const anomalies: AnomalyResult[] = [];
    const windowSize = 24; // 24-hour window

    for (let i = windowSize; i < readings.length; i++) {
      const window = readings.slice(i - windowSize, i);
      const currentReading = readings[i];
      
      const anomaly = this.detectSingleAnomaly(window, currentReading);
      if (anomaly.isAnomaly) {
        anomalies.push(anomaly);
      }
    }

    return anomalies;
  }

  private detectSingleAnomaly(historicalData: SensorReading[], currentReading: SensorReading): AnomalyResult {
    // Statistical anomaly detection using Z-score and IQR methods
    const values = historicalData.map(r => r.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length);
    
    // Z-score method
    const zScore = Math.abs((currentReading.value - mean) / stdDev);
    const zThreshold = 2.5; // 2.5 standard deviations
    
    // IQR method
    const sortedValues = [...values].sort((a, b) => a - b);
    const q1 = sortedValues[Math.floor(sortedValues.length * 0.25)];
    const q3 = sortedValues[Math.floor(sortedValues.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    const isOutlierIQR = currentReading.value < lowerBound || currentReading.value > upperBound;
    const isOutlierZ = zScore > zThreshold;
    
    const isAnomaly = isOutlierIQR && isOutlierZ;
    const score = Math.min(1, zScore / 4); // Normalize to 0-1
    const confidence = isAnomaly ? Math.min(0.95, score) : 0;

    return {
      isAnomaly,
      score,
      expectedValue: mean,
      actualValue: currentReading.value,
      confidence
    };
  }

  // 📈 PATTERN RECOGNITION
  public async analyzePatterns(sensorId: string, readings: SensorReading[]): Promise<PatternAnalysis> {
    if (readings.length < 100) {
      return {
        trend: 'stable',
        seasonality: false,
        forecast: [],
        confidence: 0.1
      };
    }

    const values = readings.map(r => r.value);
    const timestamps = readings.map(r => new Date(r.timestamp).getTime());

    // Trend analysis using linear regression
    const trend = this.calculateTrend(values, timestamps);
    
    // Seasonality detection
    const seasonality = this.detectSeasonality(values);
    
    // Simple forecasting using moving average and trend
    const forecast = this.generateForecast(values, trend, 24); // 24-hour forecast

    return {
      trend: trend.direction,
      seasonality: seasonality.hasSeasonality,
      cyclePeriod: seasonality.period,
      forecast,
      confidence: Math.min(0.9, 0.5 + (readings.length / 1000))
    };
  }

  private calculateTrend(values: number[], timestamps: number[]) {
    // Linear regression to find trend
    const n = values.length;
    const sumX = timestamps.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = timestamps.reduce((sum, x, i) => sum + x * values[i], 0);
    const sumXX = timestamps.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    let direction: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (Math.abs(slope) > 0.001) {
      direction = slope > 0 ? 'increasing' : 'decreasing';
    }

    return { slope, direction };
  }

  private detectSeasonality(values: number[]) {
    // Simple autocorrelation for common periods (hourly, daily, weekly)
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

  private calculateAutocorrelation(values: number[], lag: number): number {
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

  private generateForecast(values: number[], trend: any, periods: number): number[] {
    const forecast: number[] = [];
    const recentValues = values.slice(-24); // Last 24 values
    const movingAverage = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;

    for (let i = 1; i <= periods; i++) {
      // Simple forecast: moving average + trend
      const trendComponent = trend.slope * i * 3600000; // Hourly trend
      const forecastValue = movingAverage + trendComponent;
      forecast.push(Math.max(0, forecastValue));
    }

    return forecast;
  }

  // ⚡ ENERGY OPTIMIZATION
  public async generateOptimizationRecommendations(
    sensors: Sensor[], 
    readings: SensorReading[]
  ): Promise<OptimizationRecommendation[]> {
    const recommendations: OptimizationRecommendation[] = [];

    // Energy consumption analysis
    const energySensors = sensors.filter(s => s.type === 'energy');
    for (const sensor of energySensors) {
      const sensorReadings = readings.filter(r => r.sensorId === sensor.id);
      const energyRecs = this.analyzeEnergyUsage(sensor, sensorReadings);
      recommendations.push(...energyRecs);
    }

    // Environmental optimization
    const tempSensors = sensors.filter(s => s.type === 'temperature');
    for (const sensor of tempSensors) {
      const sensorReadings = readings.filter(r => r.sensorId === sensor.id);
      const tempRecs = this.analyzeTemperatureEfficiency(sensor, sensorReadings);
      recommendations.push(...tempRecs);
    }

    return recommendations.sort((a, b) => b.impact - a.impact);
  }

  private analyzeEnergyUsage(sensor: Sensor, readings: SensorReading[]): OptimizationRecommendation[] {
    if (readings.length < 24) return [];

    const recommendations: OptimizationRecommendation[] = [];
    const hourlyUsage = this.groupReadingsByHour(readings);
    
    // Peak usage analysis
    const peakHours = this.findPeakUsageHours(hourlyUsage);
    if (peakHours.length > 0) {
      recommendations.push({
        type: 'energy',
        description: `High energy usage detected during ${peakHours.join(', ')}. Consider load shifting to off-peak hours.`,
        impact: 0.8,
        effort: 'medium',
        savings: this.calculatePotentialSavings(hourlyUsage, peakHours)
      });
    }

    // Baseline consumption
    const baselineUsage = this.calculateBaselineUsage(readings);
    const currentAverage = readings.reduce((sum, r) => sum + r.value, 0) / readings.length;
    
    if (currentAverage > baselineUsage * 1.2) {
      recommendations.push({
        type: 'energy',
        description: 'Energy consumption is 20% above baseline. Check for inefficient equipment or processes.',
        impact: 0.9,
        effort: 'high',
        savings: (currentAverage - baselineUsage) * 24 * 30 // Monthly savings
      });
    }

    return recommendations;
  }

  private analyzeTemperatureEfficiency(sensor: Sensor, readings: SensorReading[]): OptimizationRecommendation[] {
    if (readings.length < 24) return [];

    const recommendations: OptimizationRecommendation[] = [];
    const avgTemp = readings.reduce((sum, r) => sum + r.value, 0) / readings.length;
    
    // HVAC optimization
    if (avgTemp > 24) {
      recommendations.push({
        type: 'energy',
        description: `Average temperature is ${avgTemp.toFixed(1)}°C. Reducing by 1°C could save 6-8% on cooling costs.`,
        impact: 0.7,
        effort: 'low',
        savings: 0.07 * 1000 // Estimated monthly savings
      });
    }

    // Temperature stability
    const tempVariance = this.calculateVariance(readings.map(r => r.value));
    if (tempVariance > 4) {
      recommendations.push({
        type: 'performance',
        description: 'High temperature variance detected. Improve insulation or HVAC control for better efficiency.',
        impact: 0.6,
        effort: 'medium',
        savings: 0.05 * 1000
      });
    }

    return recommendations;
  }

  // 🛠️ UTILITY FUNCTIONS
  private calculateReadingFrequency(readings: SensorReading[]): number {
    if (readings.length < 2) return 0;
    
    const intervals = [];
    for (let i = 1; i < readings.length; i++) {
      const interval = new Date(readings[i].timestamp).getTime() - new Date(readings[i-1].timestamp).getTime();
      intervals.push(interval);
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const expectedInterval = 5 * 60 * 1000; // 5 minutes
    
    return Math.min(1, expectedInterval / avgInterval);
  }

  private calculateQualityTrend(readings: SensorReading[]): number {
    const qualityScores = readings.map(r => {
      switch (r.quality) {
        case 'excellent': return 4;
        case 'good': return 3;
        case 'moderate': return 2;
        case 'poor': return 1;
        default: return 3;
      }
    });

    if (qualityScores.length < 2) return 0;

    // Simple linear trend
    const firstHalf = qualityScores.slice(0, Math.floor(qualityScores.length / 2));
    const secondHalf = qualityScores.slice(Math.floor(qualityScores.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    return (secondAvg - firstAvg) / firstAvg;
  }

  private calculateValueDrift(readings: SensorReading[]): number {
    if (readings.length < 10) return 0;
    
    const values = readings.map(r => r.value);
    const firstQuarter = values.slice(0, Math.floor(values.length / 4));
    const lastQuarter = values.slice(-Math.floor(values.length / 4));
    
    const firstAvg = firstQuarter.reduce((a, b) => a + b, 0) / firstQuarter.length;
    const lastAvg = lastQuarter.reduce((a, b) => a + b, 0) / lastQuarter.length;
    
    return Math.abs(lastAvg - firstAvg) / firstAvg;
  }

  private calculateBatteryDecline(sensor: Sensor, readings: SensorReading[]): number {
    // This would typically come from sensor metadata
    // For now, simulate based on sensor age and reading frequency
    const sensorAge = this.calculateSensorAge(sensor);
    const readingFreq = this.calculateReadingFrequency(readings);
    
    return Math.max(0, (sensorAge / 365) * 0.1 + (1 - readingFreq) * 0.05);
  }

  private calculateSensorAge(sensor: Sensor): number {
    const now = new Date();
    const created = new Date(sensor.calibrationDate);
    return Math.floor((now.getTime() - created.getTime()) / (24 * 60 * 60 * 1000));
  }

  private daysSinceCalibration(sensor: Sensor): number {
    const now = new Date();
    const calibration = new Date(sensor.calibrationDate);
    return Math.floor((now.getTime() - calibration.getTime()) / (24 * 60 * 60 * 1000));
  }

  private groupReadingsByHour(readings: SensorReading[]): Map<number, number[]> {
    const hourlyData = new Map<number, number[]>();
    
    readings.forEach(reading => {
      const hour = new Date(reading.timestamp).getHours();
      if (!hourlyData.has(hour)) {
        hourlyData.set(hour, []);
      }
      hourlyData.get(hour)!.push(reading.value);
    });
    
    return hourlyData;
  }

  private findPeakUsageHours(hourlyUsage: Map<number, number[]>): string[] {
    const hourlyAverages = new Map<number, number>();
    
    hourlyUsage.forEach((values, hour) => {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      hourlyAverages.set(hour, avg);
    });
    
    const sortedHours = Array.from(hourlyAverages.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => `${hour}:00`);
    
    return sortedHours;
  }

  private calculateBaselineUsage(readings: SensorReading[]): number {
    // Use 10th percentile as baseline
    const sortedValues = readings.map(r => r.value).sort((a, b) => a - b);
    const index = Math.floor(sortedValues.length * 0.1);
    return sortedValues[index];
  }

  private calculatePotentialSavings(hourlyUsage: Map<number, number[]>, peakHours: string[]): number {
    // Simplified savings calculation
    return peakHours.length * 50; // $50 per peak hour optimized
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  // 📊 PUBLIC API METHODS
  public async runAllPredictions(sensors: Sensor[]): Promise<Prediction[]> {
    const predictions: Prediction[] = [];

    for (const sensor of sensors) {
      try {
        // Get recent readings for this sensor
        const readings = await this.getRecentReadings(sensor.id);
        
        if (readings.length > 0) {
          // Run maintenance prediction
          const maintenance = await this.predictMaintenance(sensor, readings);
          if (maintenance.needsMaintenance) {
            predictions.push({
              id: `maintenance-${sensor.id}-${Date.now()}`,
              modelId: 'predictive-maintenance-v1',
              sensorId: sensor.id,
              type: 'maintenance',
              prediction: maintenance,
              confidence: maintenance.confidence,
              timestamp: new Date(),
              validUntil: new Date(Date.now() + maintenance.estimatedDays * 24 * 60 * 60 * 1000)
            });
          }

          // Run anomaly detection
          const anomalies = await this.detectAnomalies(sensor.id, readings);
          anomalies.forEach(anomaly => {
            if (anomaly.isAnomaly) {
              predictions.push({
                id: `anomaly-${sensor.id}-${Date.now()}`,
                modelId: 'anomaly-detection-v1',
                sensorId: sensor.id,
                type: 'anomaly',
                prediction: anomaly,
                confidence: anomaly.confidence,
                timestamp: new Date(),
                validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
              });
            }
          });

          // Run pattern analysis
          const patterns = await this.analyzePatterns(sensor.id, readings);
          if (patterns.confidence > 0.5) {
            predictions.push({
              id: `pattern-${sensor.id}-${Date.now()}`,
              modelId: 'pattern-recognition-v1',
              sensorId: sensor.id,
              type: 'pattern',
              prediction: patterns,
              confidence: patterns.confidence,
              timestamp: new Date(),
              validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
            });
          }
        }
      } catch (error) {
        console.error(`Error running predictions for sensor ${sensor.id}:`, error);
      }
    }

    // Run optimization recommendations
    try {
      const allReadings = await this.getAllRecentReadings();
      const optimizations = await this.generateOptimizationRecommendations(sensors, allReadings);
      
      optimizations.forEach(opt => {
        predictions.push({
          id: `optimization-${Date.now()}-${Math.random()}`,
          modelId: 'optimization-v1',
          sensorId: 'system',
          type: 'optimization',
          prediction: opt,
          confidence: opt.impact,
          timestamp: new Date(),
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        });
      });
    } catch (error) {
      console.error('Error generating optimization recommendations:', error);
    }

    this.predictions = predictions;
    return predictions;
  }

  private async getRecentReadings(sensorId: string): Promise<SensorReading[]> {
    try {
      const response = await apiService.getSensorReadings(sensorId, {
        limit: 168, // 7 days of hourly data
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      });
      return response.readings || [];
    } catch (error) {
      console.error(`Error fetching readings for sensor ${sensorId}:`, error);
      return [];
    }
  }

  private async getAllRecentReadings(): Promise<SensorReading[]> {
    try {
      // This would need to be implemented in the API
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Error fetching all recent readings:', error);
      return [];
    }
  }

  public getModels(): AIModel[] {
    return Array.from(this.models.values());
  }

  public getPredictions(): Prediction[] {
    return this.predictions;
  }

  public getModelStatistics() {
    const models = this.getModels();
    return {
      totalModels: models.length,
      activeModels: models.filter(m => m.status === 'active').length,
      averageAccuracy: models.reduce((sum, m) => sum + m.accuracy, 0) / models.length,
      lastTraining: Math.max(...models.map(m => m.lastTraining.getTime()))
    };
  }
}

export const aiService = new AIService();