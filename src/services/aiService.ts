import { SensorReading, Sensor, Prediction, AIModel } from '../types/sensor';

class AIService {
  private models: Map<string, AIModel> = new Map();
  private predictions: Prediction[] = [];

  constructor() {
    this.initializeModels();
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

  // Predictive Maintenance
  public predictMaintenanceNeeds(sensor: Sensor, readings: SensorReading[]): Prediction {
    const model = this.models.get('predictive-maintenance-v1')!;
    
    // Simulate AI analysis
    const recentReadings = readings.slice(-20);
    const avgValue = recentReadings.reduce((sum, r) => sum + r.value, 0) / recentReadings.length;
    const variance = this.calculateVariance(recentReadings.map(r => r.value));
    
    // Simple heuristic for demonstration
    let maintenanceRisk = 0;
    let daysUntilMaintenance = 30;
    
    if (sensor.batteryLevel && sensor.batteryLevel < 20) {
      maintenanceRisk += 0.4;
      daysUntilMaintenance = Math.min(daysUntilMaintenance, 7);
    }
    
    if (variance > avgValue * 0.3) {
      maintenanceRisk += 0.3;
      daysUntilMaintenance = Math.min(daysUntilMaintenance, 14);
    }
    
    const daysSinceCalibration = Math.floor(
      (Date.now() - sensor.calibrationDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceCalibration > 90) {
      maintenanceRisk += 0.2;
      daysUntilMaintenance = Math.min(daysUntilMaintenance, 21);
    }

    const prediction: Prediction = {
      id: `pred-${Date.now()}`,
      modelId: model.id,
      sensorId: sensor.id,
      type: 'maintenance',
      prediction: {
        risk: Math.min(maintenanceRisk, 1),
        estimatedDays: daysUntilMaintenance,
        reasons: this.getMaintenanceReasons(sensor, variance, avgValue)
      },
      confidence: model.accuracy,
      timestamp: new Date(),
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };

    this.predictions.push(prediction);
    return prediction;
  }

  // Anomaly Detection
  public detectAnomalies(readings: SensorReading[]): Prediction[] {
    const model = this.models.get('anomaly-detection-v1')!;
    const anomalies: Prediction[] = [];
    
    if (readings.length < 10) return anomalies;

    const recentReadings = readings.slice(-20);
    const mean = recentReadings.reduce((sum, r) => sum + r.value, 0) / recentReadings.length;
    const stdDev = Math.sqrt(this.calculateVariance(recentReadings.map(r => r.value)));
    
    // Check for outliers (values beyond 2 standard deviations)
    const latestReading = readings[readings.length - 1];
    const zScore = Math.abs((latestReading.value - mean) / stdDev);
    
    if (zScore > 2) {
      const anomaly: Prediction = {
        id: `anomaly-${Date.now()}`,
        modelId: model.id,
        sensorId: latestReading.sensorId,
        type: 'anomaly',
        prediction: {
          type: 'statistical_outlier',
          severity: zScore > 3 ? 'high' : 'medium',
          value: latestReading.value,
          expectedRange: [mean - 2 * stdDev, mean + 2 * stdDev],
          zScore: zScore
        },
        confidence: model.accuracy,
        timestamp: new Date(),
        validUntil: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      };
      
      anomalies.push(anomaly);
      this.predictions.push(anomaly);
    }

    return anomalies;
  }

  // Pattern Recognition
  public recognizePatterns(readings: SensorReading[]): Prediction {
    const model = this.models.get('pattern-recognition-v1')!;
    
    if (readings.length < 24) {
      return this.createEmptyPrediction(model.id, readings[0]?.sensorId || '', 'pattern');
    }

    const hourlyAverages = this.calculateHourlyAverages(readings);
    const patterns = this.identifyPatterns(hourlyAverages);

    const prediction: Prediction = {
      id: `pattern-${Date.now()}`,
      modelId: model.id,
      sensorId: readings[0].sensorId,
      type: 'pattern',
      prediction: {
        patterns: patterns,
        peakHours: this.findPeakHours(hourlyAverages),
        trends: this.analyzeTrends(readings),
        seasonality: this.detectSeasonality(readings)
      },
      confidence: model.accuracy,
      timestamp: new Date(),
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };

    this.predictions.push(prediction);
    return prediction;
  }

  // Energy Optimization
  public optimizeEnergyUsage(energyReadings: SensorReading[], occupancyReadings: SensorReading[]): Prediction {
    const model = this.models.get('optimization-v1')!;
    
    const energyPattern = this.calculateHourlyAverages(energyReadings);
    const occupancyPattern = this.calculateHourlyAverages(occupancyReadings);
    
    const optimizations = this.calculateOptimizations(energyPattern, occupancyPattern);

    const prediction: Prediction = {
      id: `optimization-${Date.now()}`,
      modelId: model.id,
      sensorId: energyReadings[0]?.sensorId || '',
      type: 'optimization',
      prediction: {
        currentUsage: energyReadings[energyReadings.length - 1]?.value || 0,
        optimizedUsage: optimizations.optimizedUsage,
        potentialSavings: optimizations.potentialSavings,
        recommendations: optimizations.recommendations
      },
      confidence: model.accuracy,
      timestamp: new Date(),
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };

    this.predictions.push(prediction);
    return prediction;
  }

  // Behavioral Analysis
  public analyzeBehavior(occupancyReadings: SensorReading[], timeWindow: number = 7): any {
    if (occupancyReadings.length === 0) return null;

    const dailyPatterns = this.groupReadingsByDay(occupancyReadings);
    const weeklyPattern = this.calculateWeeklyPattern(dailyPatterns);
    
    return {
      averageOccupancyHours: this.calculateAverageOccupancyHours(dailyPatterns),
      peakOccupancyTimes: this.findPeakOccupancyTimes(weeklyPattern),
      occupancyTrends: this.analyzeOccupancyTrends(dailyPatterns),
      weekendVsWeekday: this.compareWeekendVsWeekday(dailyPatterns)
    };
  }

  // Helper methods
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }

  private getMaintenanceReasons(sensor: Sensor, variance: number, avgValue: number): string[] {
    const reasons: string[] = [];
    
    if (sensor.batteryLevel && sensor.batteryLevel < 20) {
      reasons.push('Low battery level');
    }
    
    if (variance > avgValue * 0.3) {
      reasons.push('High reading variance detected');
    }
    
    const daysSinceCalibration = Math.floor(
      (Date.now() - sensor.calibrationDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceCalibration > 90) {
      reasons.push('Calibration overdue');
    }
    
    return reasons;
  }

  private calculateHourlyAverages(readings: SensorReading[]): { [hour: number]: number } {
    const hourlyData: { [hour: number]: number[] } = {};
    
    readings.forEach(reading => {
      const hour = reading.timestamp.getHours();
      if (!hourlyData[hour]) {
        hourlyData[hour] = [];
      }
      hourlyData[hour].push(reading.value);
    });

    const hourlyAverages: { [hour: number]: number } = {};
    Object.keys(hourlyData).forEach(hour => {
      const hourNum = parseInt(hour);
      const values = hourlyData[hourNum];
      hourlyAverages[hourNum] = values.reduce((sum, val) => sum + val, 0) / values.length;
    });

    return hourlyAverages;
  }

  private identifyPatterns(hourlyAverages: { [hour: number]: number }): string[] {
    const patterns: string[] = [];
    const hours = Object.keys(hourlyAverages).map(h => parseInt(h)).sort((a, b) => a - b);
    
    // Check for morning peak
    const morningHours = hours.filter(h => h >= 6 && h <= 10);
    const morningAvg = morningHours.reduce((sum, h) => sum + hourlyAverages[h], 0) / morningHours.length;
    
    // Check for evening peak
    const eveningHours = hours.filter(h => h >= 17 && h <= 21);
    const eveningAvg = eveningHours.reduce((sum, h) => sum + hourlyAverages[h], 0) / eveningHours.length;
    
    const overallAvg = hours.reduce((sum, h) => sum + hourlyAverages[h], 0) / hours.length;
    
    if (morningAvg > overallAvg * 1.2) {
      patterns.push('Morning peak detected');
    }
    
    if (eveningAvg > overallAvg * 1.2) {
      patterns.push('Evening peak detected');
    }
    
    return patterns;
  }

  private findPeakHours(hourlyAverages: { [hour: number]: number }): number[] {
    const hours = Object.keys(hourlyAverages).map(h => parseInt(h));
    const maxValue = Math.max(...hours.map(h => hourlyAverages[h]));
    return hours.filter(h => hourlyAverages[h] >= maxValue * 0.9);
  }

  private analyzeTrends(readings: SensorReading[]): string {
    if (readings.length < 10) return 'Insufficient data';
    
    const recentReadings = readings.slice(-10);
    const firstHalf = recentReadings.slice(0, 5);
    const secondHalf = recentReadings.slice(5);
    
    const firstAvg = firstHalf.reduce((sum, r) => sum + r.value, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, r) => sum + r.value, 0) / secondHalf.length;
    
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (Math.abs(change) < 5) return 'Stable';
    return change > 0 ? 'Increasing' : 'Decreasing';
  }

  private detectSeasonality(readings: SensorReading[]): string {
    // Simplified seasonality detection
    const dayOfYear = new Date().getDay();
    return dayOfYear < 3 ? 'Early week pattern' : 'Late week pattern';
  }

  private calculateOptimizations(energyPattern: any, occupancyPattern: any): any {
    const currentUsage = Object.values(energyPattern).reduce((sum: number, val: any) => sum + val, 0);
    const optimizedUsage = currentUsage * 0.85; // Assume 15% optimization potential
    
    return {
      optimizedUsage,
      potentialSavings: currentUsage - optimizedUsage,
      recommendations: [
        'Reduce lighting during low occupancy hours',
        'Optimize HVAC scheduling based on occupancy patterns',
        'Implement smart power management for equipment'
      ]
    };
  }

  private groupReadingsByDay(readings: SensorReading[]): any {
    const dailyData: any = {};
    
    readings.forEach(reading => {
      const day = reading.timestamp.toDateString();
      if (!dailyData[day]) {
        dailyData[day] = [];
      }
      dailyData[day].push(reading);
    });
    
    return dailyData;
  }

  private calculateWeeklyPattern(dailyPatterns: any): any {
    // Simplified weekly pattern calculation
    return Object.keys(dailyPatterns).reduce((pattern, day) => {
      const dayOfWeek = new Date(day).getDay();
      if (!pattern[dayOfWeek]) {
        pattern[dayOfWeek] = [];
      }
      pattern[dayOfWeek].push(...dailyPatterns[day]);
      return pattern;
    }, {});
  }

  private calculateAverageOccupancyHours(dailyPatterns: any): number {
    const days = Object.keys(dailyPatterns);
    if (days.length === 0) return 0;
    
    const totalHours = days.reduce((sum, day) => {
      const occupiedReadings = dailyPatterns[day].filter((r: SensorReading) => r.value > 0);
      return sum + occupiedReadings.length;
    }, 0);
    
    return totalHours / days.length;
  }

  private findPeakOccupancyTimes(weeklyPattern: any): number[] {
    // Simplified peak time detection
    return [9, 14, 16]; // 9 AM, 2 PM, 4 PM
  }

  private analyzeOccupancyTrends(dailyPatterns: any): string {
    const days = Object.keys(dailyPatterns).sort();
    if (days.length < 3) return 'Insufficient data';
    
    const recentDays = days.slice(-3);
    const occupancyRates = recentDays.map(day => {
      const readings = dailyPatterns[day];
      const occupiedReadings = readings.filter((r: SensorReading) => r.value > 0);
      return occupiedReadings.length / readings.length;
    });
    
    const trend = occupancyRates[2] - occupancyRates[0];
    return trend > 0.1 ? 'Increasing' : trend < -0.1 ? 'Decreasing' : 'Stable';
  }

  private compareWeekendVsWeekday(dailyPatterns: any): any {
    const weekdays: any[] = [];
    const weekends: any[] = [];
    
    Object.keys(dailyPatterns).forEach(day => {
      const dayOfWeek = new Date(day).getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekends.push(...dailyPatterns[day]);
      } else {
        weekdays.push(...dailyPatterns[day]);
      }
    });
    
    const weekdayOccupancy = weekdays.filter(r => r.value > 0).length / weekdays.length;
    const weekendOccupancy = weekends.filter(r => r.value > 0).length / weekends.length;
    
    return {
      weekdayOccupancy: weekdayOccupancy * 100,
      weekendOccupancy: weekendOccupancy * 100,
      difference: (weekdayOccupancy - weekendOccupancy) * 100
    };
  }

  private createEmptyPrediction(modelId: string, sensorId: string, type: string): Prediction {
    return {
      id: `empty-${Date.now()}`,
      modelId,
      sensorId,
      type,
      prediction: { message: 'Insufficient data for analysis' },
      confidence: 0,
      timestamp: new Date(),
      validUntil: new Date(Date.now() + 60 * 60 * 1000)
    };
  }

  // Public API methods
  public getAllModels(): AIModel[] {
    return Array.from(this.models.values());
  }

  public getModelById(id: string): AIModel | undefined {
    return this.models.get(id);
  }

  public getPredictions(sensorId?: string, type?: string): Prediction[] {
    let filteredPredictions = this.predictions;
    
    if (sensorId) {
      filteredPredictions = filteredPredictions.filter(p => p.sensorId === sensorId);
    }
    
    if (type) {
      filteredPredictions = filteredPredictions.filter(p => p.type === type);
    }
    
    return filteredPredictions
      .filter(p => p.validUntil > new Date())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  public getModelStatistics() {
    const models = this.getAllModels();
    const activeModels = models.filter(m => m.status === 'active').length;
    const averageAccuracy = models.reduce((sum, m) => sum + m.accuracy, 0) / models.length;
    const totalPredictions = this.predictions.length;
    const validPredictions = this.predictions.filter(p => p.validUntil > new Date()).length;

    return {
      totalModels: models.length,
      activeModels,
      averageAccuracy: Math.round(averageAccuracy * 100),
      totalPredictions,
      validPredictions
    };
  }
}

export const aiService = new AIService();