const express = require('express');
const { query, validationResult } = require('express-validator');
const db = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Get dashboard overview analytics
router.get('/overview', asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get sensor statistics
  const sensorStats = await db('sensors')
    .where({ user_id: userId })
    .select(
      db.raw('COUNT(*) as total_sensors'),
      db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as online_sensors', ['online']),
      db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as offline_sensors', ['offline']),
      db.raw('AVG(battery_level) as avg_battery_level')
    )
    .first();

  // Get recent readings count (last 24 hours)
  const recentReadings = await db('sensor_readings')
    .join('sensors', 'sensor_readings.sensor_id', 'sensors.id')
    .where({ 'sensors.user_id': userId })
    .where('sensor_readings.timestamp', '>', new Date(Date.now() - 24 * 60 * 60 * 1000))
    .count('* as count')
    .first();

  // Get active alerts
  const activeAlerts = await db('alerts')
    .join('sensors', 'alerts.sensor_id', 'sensors.id')
    .where({ 'sensors.user_id': userId, 'alerts.acknowledged': false })
    .count('* as count')
    .first();

  // Get readings by sensor type (last 7 days)
  const readingsByType = await db('sensor_readings')
    .join('sensors', 'sensor_readings.sensor_id', 'sensors.id')
    .where({ 'sensors.user_id': userId })
    .where('sensor_readings.timestamp', '>', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    .select('sensors.sensor_type')
    .count('* as count')
    .groupBy('sensors.sensor_type');

  // Get daily readings trend (last 30 days)
  const dailyTrend = await db('sensor_readings')
    .join('sensors', 'sensor_readings.sensor_id', 'sensors.id')
    .where({ 'sensors.user_id': userId })
    .where('sensor_readings.timestamp', '>', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    .select(
      db.raw('DATE(sensor_readings.timestamp) as date'),
      db.raw('COUNT(*) as readings_count'),
      db.raw('COUNT(DISTINCT sensor_readings.sensor_id) as active_sensors')
    )
    .groupBy('date')
    .orderBy('date');

  const totalSensors = parseInt(sensorStats.total_sensors);
  const onlineSensors = parseInt(sensorStats.online_sensors);

  res.json({
    success: true,
    data: {
      overview: {
        totalSensors,
        onlineSensors,
        offlineSensors: parseInt(sensorStats.offline_sensors),
        uptime: totalSensors > 0 ? Math.round((onlineSensors / totalSensors) * 100) : 0,
        averageBatteryLevel: sensorStats.avg_battery_level ? Math.round(parseFloat(sensorStats.avg_battery_level)) : null,
        recentReadings: parseInt(recentReadings.count),
        activeAlerts: parseInt(activeAlerts.count)
      },
      readingsByType: readingsByType.reduce((acc, item) => {
        acc[item.sensor_type] = parseInt(item.count);
        return acc;
      }, {}),
      dailyTrend: dailyTrend.map(item => ({
        date: item.date,
        readingsCount: parseInt(item.readings_count),
        activeSensors: parseInt(item.active_sensors)
      }))
    }
  });
}));

// Get sensor performance analytics
router.get('/sensors/performance', [
  query('period').optional().isIn(['24h', '7d', '30d', '90d']),
  query('sensorId').optional().isUUID()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid query parameters',
        details: errors.array()
      }
    });
  }

  const { period = '7d', sensorId } = req.query;
  const userId = req.user.id;

  // Calculate time range
  const periodHours = {
    '24h': 24,
    '7d': 24 * 7,
    '30d': 24 * 30,
    '90d': 24 * 90
  };

  const fromDate = new Date(Date.now() - periodHours[period] * 60 * 60 * 1000);

  let query = db('sensor_readings')
    .join('sensors', 'sensor_readings.sensor_id', 'sensors.id')
    .where({ 'sensors.user_id': userId })
    .where('sensor_readings.timestamp', '>', fromDate);

  if (sensorId) {
    query = query.where({ 'sensor_readings.sensor_id': sensorId });
  }

  // Get reading statistics by sensor
  const sensorPerformance = await query
    .select(
      'sensors.id',
      'sensors.name',
      'sensors.sensor_type',
      'sensors.status',
      db.raw('COUNT(sensor_readings.id) as total_readings'),
      db.raw('AVG(sensor_readings.value) as avg_value'),
      db.raw('MIN(sensor_readings.value) as min_value'),
      db.raw('MAX(sensor_readings.value) as max_value'),
      db.raw('COUNT(CASE WHEN sensor_readings.quality = ? THEN 1 END) as excellent_readings', ['excellent']),
      db.raw('COUNT(CASE WHEN sensor_readings.quality = ? THEN 1 END) as good_readings', ['good']),
      db.raw('COUNT(CASE WHEN sensor_readings.quality = ? THEN 1 END) as moderate_readings', ['moderate']),
      db.raw('COUNT(CASE WHEN sensor_readings.quality = ? THEN 1 END) as poor_readings', ['poor']),
      db.raw('MAX(sensor_readings.timestamp) as last_reading')
    )
    .groupBy('sensors.id', 'sensors.name', 'sensors.sensor_type', 'sensors.status');

  // Calculate uptime for each sensor
  const sensorUptime = await db('sensors')
    .where({ user_id: userId })
    .select('id', 'name', 'created_at');

  const uptimeData = await Promise.all(
    sensorUptime.map(async (sensor) => {
      const totalTime = Date.now() - new Date(sensor.created_at).getTime();
      const offlineTime = await db('sensor_readings')
        .where({ sensor_id: sensor.id })
        .where('timestamp', '>', fromDate)
        .select('timestamp')
        .orderBy('timestamp');

      // Simple uptime calculation based on reading frequency
      const expectedReadings = Math.floor(totalTime / (5 * 60 * 1000)); // Assuming 5-minute intervals
      const actualReadings = offlineTime.length;
      const uptime = expectedReadings > 0 ? Math.min(100, (actualReadings / expectedReadings) * 100) : 0;

      return {
        sensorId: sensor.id,
        uptime: Math.round(uptime)
      };
    })
  );

  const uptimeMap = new Map(uptimeData.map(item => [item.sensorId, item.uptime]));

  res.json({
    success: true,
    data: {
      period,
      sensors: sensorPerformance.map(sensor => ({
        id: sensor.id,
        name: sensor.name,
        type: sensor.sensor_type,
        status: sensor.status,
        totalReadings: parseInt(sensor.total_readings),
        averageValue: sensor.avg_value ? parseFloat(sensor.avg_value).toFixed(2) : null,
        minValue: sensor.min_value ? parseFloat(sensor.min_value) : null,
        maxValue: sensor.max_value ? parseFloat(sensor.max_value) : null,
        qualityDistribution: {
          excellent: parseInt(sensor.excellent_readings),
          good: parseInt(sensor.good_readings),
          moderate: parseInt(sensor.moderate_readings),
          poor: parseInt(sensor.poor_readings)
        },
        uptime: uptimeMap.get(sensor.id) || 0,
        lastReading: sensor.last_reading
      }))
    }
  });
}));

// Get environmental trends
router.get('/trends', [
  query('sensorType').optional().isIn(['temperature', 'humidity', 'co2', 'voc', 'pm25', 'pm10', 'light', 'sound']),
  query('period').optional().isIn(['24h', '7d', '30d']),
  query('aggregation').optional().isIn(['hour', 'day'])
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid query parameters',
        details: errors.array()
      }
    });
  }

  const { sensorType, period = '7d', aggregation = 'day' } = req.query;
  const userId = req.user.id;

  const periodHours = {
    '24h': 24,
    '7d': 24 * 7,
    '30d': 24 * 30
  };

  const fromDate = new Date(Date.now() - periodHours[period] * 60 * 60 * 1000);

  // Build date format for aggregation
  const dateFormat = aggregation === 'hour' ? 'YYYY-MM-DD HH24:00:00' : 'YYYY-MM-DD';

  let query = db('sensor_readings')
    .join('sensors', 'sensor_readings.sensor_id', 'sensors.id')
    .where({ 'sensors.user_id': userId })
    .where('sensor_readings.timestamp', '>', fromDate);

  if (sensorType) {
    query = query.where({ 'sensors.sensor_type': sensorType });
  }

  const trends = await query
    .select(
      db.raw(`TO_CHAR(sensor_readings.timestamp, '${dateFormat}') as period`),
      'sensors.sensor_type',
      db.raw('AVG(sensor_readings.value) as avg_value'),
      db.raw('MIN(sensor_readings.value) as min_value'),
      db.raw('MAX(sensor_readings.value) as max_value'),
      db.raw('COUNT(*) as reading_count')
    )
    .groupBy('period', 'sensors.sensor_type')
    .orderBy('period');

  // Group by sensor type
  const trendsBySensorType = trends.reduce((acc, item) => {
    if (!acc[item.sensor_type]) {
      acc[item.sensor_type] = [];
    }
    
    acc[item.sensor_type].push({
      period: item.period,
      avgValue: parseFloat(item.avg_value).toFixed(2),
      minValue: parseFloat(item.min_value),
      maxValue: parseFloat(item.max_value),
      readingCount: parseInt(item.reading_count)
    });
    
    return acc;
  }, {});

  res.json({
    success: true,
    data: {
      period,
      aggregation,
      sensorType: sensorType || 'all',
      trends: trendsBySensorType
    }
  });
}));

// Get alert analytics
router.get('/alerts', [
  query('period').optional().isIn(['24h', '7d', '30d']),
  query('groupBy').optional().isIn(['severity', 'type', 'sensor'])
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid query parameters',
        details: errors.array()
      }
    });
  }

  const { period = '7d', groupBy = 'severity' } = req.query;
  const userId = req.user.id;

  const periodHours = {
    '24h': 24,
    '7d': 24 * 7,
    '30d': 24 * 30
  };

  const fromDate = new Date(Date.now() - periodHours[period] * 60 * 60 * 1000);

  let query = db('alerts')
    .join('sensors', 'alerts.sensor_id', 'sensors.id')
    .where({ 'sensors.user_id': userId })
    .where('alerts.timestamp', '>', fromDate);

  let groupByField;
  switch (groupBy) {
    case 'severity':
      groupByField = 'alerts.severity';
      break;
    case 'type':
      groupByField = 'alerts.alert_type';
      break;
    case 'sensor':
      groupByField = 'sensors.name';
      break;
  }

  const alertStats = await query
    .select(
      groupByField + ' as group_key',
      db.raw('COUNT(*) as alert_count'),
      db.raw('COUNT(CASE WHEN alerts.acknowledged = true THEN 1 END) as acknowledged_count'),
      db.raw('COUNT(CASE WHEN alerts.resolved_at IS NOT NULL THEN 1 END) as resolved_count')
    )
    .groupBy('group_key')
    .orderBy('alert_count', 'desc');

  // Get daily alert trend
  const dailyTrend = await db('alerts')
    .join('sensors', 'alerts.sensor_id', 'sensors.id')
    .where({ 'sensors.user_id': userId })
    .where('alerts.timestamp', '>', fromDate)
    .select(
      db.raw('DATE(alerts.timestamp) as date'),
      db.raw('COUNT(*) as alert_count'),
      db.raw('COUNT(CASE WHEN alerts.severity = ? THEN 1 END) as critical_count', ['critical']),
      db.raw('COUNT(CASE WHEN alerts.severity = ? THEN 1 END) as high_count', ['high'])
    )
    .groupBy('date')
    .orderBy('date');

  res.json({
    success: true,
    data: {
      period,
      groupBy,
      distribution: alertStats.map(item => ({
        key: item.group_key,
        totalAlerts: parseInt(item.alert_count),
        acknowledgedAlerts: parseInt(item.acknowledged_count),
        resolvedAlerts: parseInt(item.resolved_count),
        acknowledgmentRate: item.alert_count > 0 ? 
          Math.round((item.acknowledged_count / item.alert_count) * 100) : 0
      })),
      dailyTrend: dailyTrend.map(item => ({
        date: item.date,
        totalAlerts: parseInt(item.alert_count),
        criticalAlerts: parseInt(item.critical_count),
        highAlerts: parseInt(item.high_count)
      }))
    }
  });
}));

// Get AI predictions using real ML models
router.get('/predictions', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const aiEngine = require('../services/aiEngine');

  // Get sensors for predictions
  const sensors = await db('sensors')
    .where({ user_id: userId, status: 'online' })
    .select('*');

  const predictions = [];

  for (const sensor of sensors) {
    try {
      // Get recent readings for this sensor
      const readings = await db('sensor_readings')
        .where({ sensor_id: sensor.id })
        .where('timestamp', '>', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .orderBy('timestamp', 'desc')
        .limit(168); // 7 days of hourly data

      if (readings.length > 10) {
        // Extract features for ML models
        const features = extractSensorFeatures(sensor, readings);

        // Run maintenance prediction
        const maintenancePrediction = await aiEngine.predictMaintenance(sensor.id, features);
        if (maintenancePrediction.needsMaintenance) {
          predictions.push({
            sensorId: sensor.id,
            sensorName: sensor.name,
            sensorType: sensor.sensor_type,
            type: 'maintenance',
            prediction: maintenancePrediction,
            confidence: maintenancePrediction.confidence,
            priority: maintenancePrediction.priority || 'medium',
            estimatedDate: new Date(Date.now() + maintenancePrediction.estimatedDays * 24 * 60 * 60 * 1000)
          });
        }

        // Run anomaly detection
        const anomalies = await aiEngine.detectAnomalies(sensor.id, readings);
        anomalies.forEach(anomaly => {
          if (anomaly.severity === 'high') {
            predictions.push({
              sensorId: sensor.id,
              sensorName: sensor.name,
              sensorType: sensor.sensor_type,
              type: 'anomaly',
              prediction: {
                message: `Anomaly detected: ${anomaly.value} (expected: ${anomaly.expectedValue})`,
                severity: anomaly.severity,
                error: anomaly.error
              },
              confidence: 0.85,
              priority: 'high',
              estimatedDate: new Date(anomaly.timestamp)
            });
          }
        });

        // Run pattern analysis
        const patterns = await aiEngine.analyzePatterns(sensor.id, readings);
        if (patterns.confidence > 0.7) {
          predictions.push({
            sensorId: sensor.id,
            sensorName: sensor.name,
            sensorType: sensor.sensor_type,
            type: 'pattern',
            prediction: {
              message: `${patterns.trend} trend detected with ${patterns.seasonality ? 'seasonal' : 'no seasonal'} patterns`,
              trend: patterns.trend,
              seasonality: patterns.seasonality,
              forecast: patterns.forecast.slice(0, 6) // Next 6 hours
            },
            confidence: patterns.confidence,
            priority: 'low',
            estimatedDate: new Date(Date.now() + 6 * 60 * 60 * 1000)
          });
        }
      }
    } catch (error) {
      console.error(`Error generating predictions for sensor ${sensor.id}:`, error);
    }
  }

  // Generate system-wide optimization recommendations
  try {
    const sensorsData = sensors.map(sensor => ({
      id: sensor.id,
      type: sensor.sensor_type,
      status: sensor.status,
      batteryLevel: sensor.battery_level,
      avgValue: 0, // Would be calculated from recent readings
      variance: 0, // Would be calculated from recent readings
      qualityScore: 0.8 // Would be calculated from recent readings
    }));

    const optimizations = await aiEngine.generateOptimizations(sensorsData);
    optimizations.forEach(opt => {
      predictions.push({
        sensorId: 'system',
        sensorName: 'System Wide',
        sensorType: 'optimization',
        type: 'optimization',
        prediction: opt,
        confidence: opt.impact,
        priority: opt.impact > 0.8 ? 'high' : opt.impact > 0.6 ? 'medium' : 'low',
        estimatedDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
    });
  } catch (error) {
    console.error('Error generating optimization recommendations:', error);
  }

  // Calculate summary statistics
  const summary = {
    totalPredictions: predictions.length,
    highPriority: predictions.filter(p => p.priority === 'high').length,
    mediumPriority: predictions.filter(p => p.priority === 'medium').length,
    lowPriority: predictions.filter(p => p.priority === 'low').length,
    byType: {
      maintenance: predictions.filter(p => p.type === 'maintenance').length,
      anomaly: predictions.filter(p => p.type === 'anomaly').length,
      pattern: predictions.filter(p => p.type === 'pattern').length,
      optimization: predictions.filter(p => p.type === 'optimization').length
    }
  };

  res.json({
    success: true,
    data: {
      predictions,
      summary
    }
  });
}));

// Helper function to extract features from sensor data
function extractSensorFeatures(sensor, readings) {
  const values = readings.map(r => r.value);
  const qualities = readings.map(r => r.quality);
  
  // Calculate reading frequency
  const intervals = [];
  for (let i = 1; i < readings.length; i++) {
    const interval = new Date(readings[i-1].timestamp).getTime() - new Date(readings[i].timestamp).getTime();
    intervals.push(interval);
  }
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const expectedInterval = 5 * 60 * 1000; // 5 minutes
  const readingFrequency = Math.min(1, expectedInterval / avgInterval);

  // Calculate quality trend
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
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const qualityTrend = (secondAvg - firstAvg) / firstAvg;

  // Calculate value drift
  const firstQuarter = values.slice(0, Math.floor(values.length / 4));
  const lastQuarter = values.slice(-Math.floor(values.length / 4));
  const firstAvgValue = firstQuarter.reduce((a, b) => a + b, 0) / firstQuarter.length;
  const lastAvgValue = lastQuarter.reduce((a, b) => a + b, 0) / lastQuarter.length;
  const valueDrift = Math.abs(lastAvgValue - firstAvgValue) / firstAvgValue;

  // Calculate sensor age and calibration info
  const sensorAge = Math.floor((new Date() - new Date(sensor.created_at)) / (24 * 60 * 60 * 1000));
  const lastCalibration = Math.floor((new Date() - new Date(sensor.calibration_date)) / (24 * 60 * 60 * 1000));

  // Simulate battery decline (would come from actual sensor data)
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

module.exports = router;