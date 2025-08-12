const express = require('express');
const { body, query, validationResult } = require('express-validator');
const db = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Get readings for a specific sensor
router.get('/sensor/:sensorId', [
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
  query('limit').optional().isInt({ min: 1, max: 1000 }),
  query('offset').optional().isInt({ min: 0 }),
  query('quality').optional().isIn(['excellent', 'good', 'moderate', 'poor'])
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

  const { sensorId } = req.params;
  const { from, to, limit = 100, offset = 0, quality } = req.query;

  // Verify sensor belongs to user
  const sensor = await db('sensors')
    .where({ id: sensorId, user_id: req.user.id })
    .first();

  if (!sensor) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'SENSOR_NOT_FOUND',
        message: 'Sensor not found'
      }
    });
  }

  let query = db('sensor_readings')
    .where({ sensor_id: sensorId })
    .orderBy('timestamp', 'desc')
    .limit(parseInt(limit))
    .offset(parseInt(offset));

  if (from) {
    query = query.where('timestamp', '>=', new Date(from));
  }

  if (to) {
    query = query.where('timestamp', '<=', new Date(to));
  }

  if (quality) {
    query = query.where({ quality });
  }

  const readings = await query;

  // Get total count for pagination
  let countQuery = db('sensor_readings').where({ sensor_id: sensorId }).count('* as count');
  if (from) countQuery = countQuery.where('timestamp', '>=', new Date(from));
  if (to) countQuery = countQuery.where('timestamp', '<=', new Date(to));
  if (quality) countQuery = countQuery.where({ quality });

  const [{ count }] = await countQuery;

  res.json({
    success: true,
    data: {
      readings: readings.map(reading => ({
        id: reading.id,
        sensorId: reading.sensor_id,
        timestamp: reading.timestamp,
        value: parseFloat(reading.value),
        unit: reading.unit,
        quality: reading.quality,
        location: {
          lat: reading.location_lat ? parseFloat(reading.location_lat) : null,
          lng: reading.location_lng ? parseFloat(reading.location_lng) : null,
          name: reading.location_name
        },
        metadata: reading.metadata
      })),
      pagination: {
        total: parseInt(count),
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < parseInt(count)
      }
    }
  });
}));

// Add single reading to a sensor
router.post('/sensor/:sensorId', [
  body('timestamp').optional().isISO8601(),
  body('value').isNumeric(),
  body('unit').notEmpty().trim(),
  body('quality').optional().isIn(['excellent', 'good', 'moderate', 'poor']),
  body('location.lat').optional().isFloat({ min: -90, max: 90 }),
  body('location.lng').optional().isFloat({ min: -180, max: 180 }),
  body('location.name').optional().trim()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: errors.array()
      }
    });
  }

  const { sensorId } = req.params;
  const { timestamp, value, unit, quality = 'good', location, metadata } = req.body;

  // Verify sensor belongs to user
  const sensor = await db('sensors')
    .where({ id: sensorId, user_id: req.user.id })
    .first();

  if (!sensor) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'SENSOR_NOT_FOUND',
        message: 'Sensor not found'
      }
    });
  }

  const [reading] = await db('sensor_readings').insert({
    sensor_id: sensorId,
    timestamp: timestamp ? new Date(timestamp) : new Date(),
    value: parseFloat(value),
    unit,
    quality,
    location_lat: location?.lat || sensor.location_lat,
    location_lng: location?.lng || sensor.location_lng,
    location_name: location?.name || sensor.location_name,
    metadata: JSON.stringify(metadata || {})
  }).returning('*');

  // Update sensor status to online if it was offline
  if (sensor.status === 'offline') {
    await db('sensors')
      .where({ id: sensorId })
      .update({ status: 'online', updated_at: new Date() });
  }

  // Check for threshold alerts
  await checkThresholdAlerts(sensorId, reading);

  res.status(201).json({
    success: true,
    data: {
      reading: {
        id: reading.id,
        sensorId: reading.sensor_id,
        timestamp: reading.timestamp,
        value: parseFloat(reading.value),
        unit: reading.unit,
        quality: reading.quality,
        location: {
          lat: reading.location_lat ? parseFloat(reading.location_lat) : null,
          lng: reading.location_lng ? parseFloat(reading.location_lng) : null,
          name: reading.location_name
        },
        metadata: reading.metadata
      }
    }
  });
}));

// Add batch readings
router.post('/batch', [
  body('readings').isArray({ min: 1, max: 100 }),
  body('readings.*.sensorId').notEmpty(),
  body('readings.*.timestamp').optional().isISO8601(),
  body('readings.*.value').isNumeric(),
  body('readings.*.unit').notEmpty().trim(),
  body('readings.*.quality').optional().isIn(['excellent', 'good', 'moderate', 'poor'])
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: errors.array()
      }
    });
  }

  const { readings } = req.body;

  // Verify all sensors belong to user
  const sensorIds = [...new Set(readings.map(r => r.sensorId))];
  const userSensors = await db('sensors')
    .whereIn('id', sensorIds)
    .where({ user_id: req.user.id })
    .select('id', 'location_lat', 'location_lng', 'location_name', 'status');

  const userSensorMap = new Map(userSensors.map(s => [s.id, s]));

  // Filter out readings for sensors that don't belong to user
  const validReadings = readings.filter(reading => userSensorMap.has(reading.sensorId));

  if (validReadings.length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'NO_VALID_READINGS',
        message: 'No valid readings found for user sensors'
      }
    });
  }

  // Prepare readings for insertion
  const readingsToInsert = validReadings.map(reading => {
    const sensor = userSensorMap.get(reading.sensorId);
    return {
      sensor_id: reading.sensorId,
      timestamp: reading.timestamp ? new Date(reading.timestamp) : new Date(),
      value: parseFloat(reading.value),
      unit: reading.unit,
      quality: reading.quality || 'good',
      location_lat: reading.location?.lat || sensor.location_lat,
      location_lng: reading.location?.lng || sensor.location_lng,
      location_name: reading.location?.name || sensor.location_name,
      metadata: JSON.stringify(reading.metadata || {})
    };
  });

  // Insert readings
  const insertedReadings = await db('sensor_readings')
    .insert(readingsToInsert)
    .returning('*');

  // Update sensor statuses to online
  const sensorsToUpdate = [...new Set(validReadings.map(r => r.sensorId))];
  await db('sensors')
    .whereIn('id', sensorsToUpdate)
    .where({ status: 'offline' })
    .update({ status: 'online', updated_at: new Date() });

  // Check for threshold alerts for each reading
  for (const reading of insertedReadings) {
    await checkThresholdAlerts(reading.sensor_id, reading);
  }

  res.status(201).json({
    success: true,
    data: {
      message: `${insertedReadings.length} readings processed successfully`,
      processedCount: insertedReadings.length,
      totalCount: readings.length
    }
  });
}));

// Get aggregated readings (hourly, daily, weekly)
router.get('/sensor/:sensorId/aggregate', [
  query('interval').isIn(['hour', 'day', 'week', 'month']),
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
  query('aggregation').optional().isIn(['avg', 'min', 'max', 'sum', 'count'])
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

  const { sensorId } = req.params;
  const { interval, from, to, aggregation = 'avg' } = req.query;

  // Verify sensor belongs to user
  const sensor = await db('sensors')
    .where({ id: sensorId, user_id: req.user.id })
    .first();

  if (!sensor) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'SENSOR_NOT_FOUND',
        message: 'Sensor not found'
      }
    });
  }

  // Build aggregation query
  let dateFormat;
  switch (interval) {
    case 'hour':
      dateFormat = 'YYYY-MM-DD HH24:00:00';
      break;
    case 'day':
      dateFormat = 'YYYY-MM-DD';
      break;
    case 'week':
      dateFormat = 'YYYY-"W"WW';
      break;
    case 'month':
      dateFormat = 'YYYY-MM';
      break;
  }

  let query = db('sensor_readings')
    .where({ sensor_id: sensorId })
    .select(
      db.raw(`TO_CHAR(timestamp, '${dateFormat}') as period`),
      db.raw(`${aggregation.toUpperCase()}(value) as value`),
      db.raw('COUNT(*) as count')
    )
    .groupBy('period')
    .orderBy('period');

  if (from) {
    query = query.where('timestamp', '>=', new Date(from));
  }

  if (to) {
    query = query.where('timestamp', '<=', new Date(to));
  }

  const results = await query;

  res.json({
    success: true,
    data: {
      aggregation: {
        interval,
        aggregation,
        sensorId,
        unit: sensor.sensor_type === 'temperature' ? '°C' : 
              sensor.sensor_type === 'humidity' ? '%' :
              sensor.sensor_type === 'co2' ? 'ppm' : 'units'
      },
      data: results.map(row => ({
        period: row.period,
        value: parseFloat(row.value),
        count: parseInt(row.count)
      }))
    }
  });
}));

// Helper function to check threshold alerts
async function checkThresholdAlerts(sensorId, reading) {
  const sensor = await db('sensors').where({ id: sensorId }).first();
  if (!sensor) return;

  let shouldAlert = false;
  let alertMessage = '';
  let severity = 'low';

  const value = parseFloat(reading.value);

  // Define thresholds based on sensor type
  switch (sensor.sensor_type) {
    case 'temperature':
      if (value > 30) {
        shouldAlert = true;
        alertMessage = `High temperature detected: ${value}°C`;
        severity = value > 35 ? 'critical' : 'high';
      } else if (value < 10) {
        shouldAlert = true;
        alertMessage = `Low temperature detected: ${value}°C`;
        severity = value < 5 ? 'critical' : 'medium';
      }
      break;

    case 'co2':
      if (value > 800) {
        shouldAlert = true;
        alertMessage = `High CO2 levels detected: ${value} ppm`;
        severity = value > 1000 ? 'critical' : 'high';
      }
      break;

    case 'sound':
      if (value > 70) {
        shouldAlert = true;
        alertMessage = `High noise levels detected: ${value} dB`;
        severity = value > 85 ? 'critical' : 'high';
      }
      break;

    case 'pm25':
      if (value > 35) {
        shouldAlert = true;
        alertMessage = `High PM2.5 levels detected: ${value} μg/m³`;
        severity = value > 55 ? 'critical' : 'high';
      }
      break;
  }

  if (shouldAlert) {
    // Check if similar alert exists in last hour
    const recentAlert = await db('alerts')
      .where({
        sensor_id: sensorId,
        alert_type: 'threshold'
      })
      .where('timestamp', '>', new Date(Date.now() - 60 * 60 * 1000))
      .first();

    if (!recentAlert) {
      await db('alerts').insert({
        sensor_id: sensorId,
        alert_type: 'threshold',
        severity,
        message: alertMessage,
        timestamp: new Date(),
        acknowledged: false
      });
    }
  }
}

module.exports = router;