const express = require('express');
const { body, query, validationResult } = require('express-validator');
const db = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all sensors for the authenticated user
router.get('/', [
  query('type').optional().isIn(['temperature', 'humidity', 'motion', 'occupancy', 'co2', 'voc', 'pm25', 'pm10', 'light', 'sound', 'energy', 'air_pressure', 'wind_speed', 'wind_direction']),
  query('status').optional().isIn(['online', 'offline', 'maintenance']),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 })
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

  const { type, status, limit = 50, offset = 0 } = req.query;
  
  let query = db('sensors')
    .select('*')
    .where({ user_id: req.user.id })
    .orderBy('created_at', 'desc')
    .limit(parseInt(limit))
    .offset(parseInt(offset));

  if (type) {
    query = query.where({ sensor_type: type });
  }

  if (status) {
    query = query.where({ status });
  }

  const sensors = await query;

  // Get total count for pagination
  let countQuery = db('sensors').where({ user_id: req.user.id }).count('* as count');
  if (type) countQuery = countQuery.where({ sensor_type: type });
  if (status) countQuery = countQuery.where({ status });
  
  const [{ count }] = await countQuery;

  res.json({
    success: true,
    data: {
      sensors: sensors.map(sensor => ({
        id: sensor.id,
        deviceId: sensor.device_id,
        name: sensor.name,
        type: sensor.sensor_type,
        connectivity: sensor.connection_type,
        location: {
          lat: parseFloat(sensor.location_lat),
          lng: parseFloat(sensor.location_lng),
          name: sensor.location_name
        },
        status: sensor.status,
        batteryLevel: sensor.battery_level,
        calibrationDate: sensor.calibration_date,
        nextMaintenanceDate: sensor.next_maintenance_date,
        configuration: sensor.configuration,
        metadata: sensor.metadata,
        createdAt: sensor.created_at,
        updatedAt: sensor.updated_at
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

// Get sensor by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const sensor = await db('sensors')
    .where({ id: req.params.id, user_id: req.user.id })
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

  // Get latest reading
  const latestReading = await db('sensor_readings')
    .where({ sensor_id: sensor.id })
    .orderBy('timestamp', 'desc')
    .first();

  res.json({
    success: true,
    data: {
      sensor: {
        id: sensor.id,
        deviceId: sensor.device_id,
        name: sensor.name,
        type: sensor.sensor_type,
        connectivity: sensor.connection_type,
        location: {
          lat: parseFloat(sensor.location_lat),
          lng: parseFloat(sensor.location_lng),
          name: sensor.location_name
        },
        status: sensor.status,
        batteryLevel: sensor.battery_level,
        calibrationDate: sensor.calibration_date,
        nextMaintenanceDate: sensor.next_maintenance_date,
        configuration: sensor.configuration,
        metadata: sensor.metadata,
        lastReading: latestReading ? {
          id: latestReading.id,
          timestamp: latestReading.timestamp,
          value: parseFloat(latestReading.value),
          unit: latestReading.unit,
          quality: latestReading.quality
        } : null,
        createdAt: sensor.created_at,
        updatedAt: sensor.updated_at
      }
    }
  });
}));

// Create new sensor
router.post('/', [
  body('deviceId').notEmpty().trim(),
  body('name').notEmpty().trim(),
  body('type').isIn(['temperature', 'humidity', 'motion', 'occupancy', 'co2', 'voc', 'pm25', 'pm10', 'light', 'sound', 'energy', 'air_pressure', 'wind_speed', 'wind_direction']),
  body('connectivity').isIn(['wifi', 'lorawan', 'bluetooth', 'cellular']),
  body('location.lat').isFloat({ min: -90, max: 90 }),
  body('location.lng').isFloat({ min: -180, max: 180 }),
  body('location.name').notEmpty().trim(),
  body('batteryLevel').optional().isInt({ min: 0, max: 100 })
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

  const {
    deviceId,
    name,
    type,
    connectivity,
    location,
    batteryLevel,
    calibrationDate,
    nextMaintenanceDate,
    configuration,
    metadata
  } = req.body;

  // Check if device ID already exists
  const existingSensor = await db('sensors').where({ device_id: deviceId }).first();
  if (existingSensor) {
    return res.status(409).json({
      success: false,
      error: {
        code: 'DEVICE_EXISTS',
        message: 'Sensor with this device ID already exists'
      }
    });
  }

  const [sensor] = await db('sensors').insert({
    device_id: deviceId,
    name,
    sensor_type: type,
    connection_type: connectivity,
    location_lat: location.lat,
    location_lng: location.lng,
    location_name: location.name,
    status: 'offline',
    battery_level: batteryLevel || null,
    calibration_date: calibrationDate ? new Date(calibrationDate) : null,
    next_maintenance_date: nextMaintenanceDate ? new Date(nextMaintenanceDate) : null,
    configuration: JSON.stringify(configuration || {}),
    metadata: JSON.stringify(metadata || {}),
    user_id: req.user.id
  }).returning('*');

  res.status(201).json({
    success: true,
    data: {
      sensor: {
        id: sensor.id,
        deviceId: sensor.device_id,
        name: sensor.name,
        type: sensor.sensor_type,
        connectivity: sensor.connection_type,
        location: {
          lat: parseFloat(sensor.location_lat),
          lng: parseFloat(sensor.location_lng),
          name: sensor.location_name
        },
        status: sensor.status,
        batteryLevel: sensor.battery_level,
        calibrationDate: sensor.calibration_date,
        nextMaintenanceDate: sensor.next_maintenance_date,
        configuration: sensor.configuration,
        metadata: sensor.metadata,
        createdAt: sensor.created_at,
        updatedAt: sensor.updated_at
      }
    }
  });
}));

// Update sensor
router.put('/:id', [
  body('name').optional().notEmpty().trim(),
  body('location.lat').optional().isFloat({ min: -90, max: 90 }),
  body('location.lng').optional().isFloat({ min: -180, max: 180 }),
  body('location.name').optional().notEmpty().trim(),
  body('status').optional().isIn(['online', 'offline', 'maintenance']),
  body('batteryLevel').optional().isInt({ min: 0, max: 100 })
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

  const sensor = await db('sensors')
    .where({ id: req.params.id, user_id: req.user.id })
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

  const {
    name,
    location,
    status,
    batteryLevel,
    calibrationDate,
    nextMaintenanceDate,
    configuration,
    metadata
  } = req.body;

  const updateData = { updated_at: new Date() };

  if (name !== undefined) updateData.name = name;
  if (location?.lat !== undefined) updateData.location_lat = location.lat;
  if (location?.lng !== undefined) updateData.location_lng = location.lng;
  if (location?.name !== undefined) updateData.location_name = location.name;
  if (status !== undefined) updateData.status = status;
  if (batteryLevel !== undefined) updateData.battery_level = batteryLevel;
  if (calibrationDate !== undefined) updateData.calibration_date = new Date(calibrationDate);
  if (nextMaintenanceDate !== undefined) updateData.next_maintenance_date = new Date(nextMaintenanceDate);
  if (configuration !== undefined) updateData.configuration = JSON.stringify(configuration);
  if (metadata !== undefined) updateData.metadata = JSON.stringify(metadata);

  const [updatedSensor] = await db('sensors')
    .where({ id: req.params.id })
    .update(updateData)
    .returning('*');

  res.json({
    success: true,
    data: {
      sensor: {
        id: updatedSensor.id,
        deviceId: updatedSensor.device_id,
        name: updatedSensor.name,
        type: updatedSensor.sensor_type,
        connectivity: updatedSensor.connection_type,
        location: {
          lat: parseFloat(updatedSensor.location_lat),
          lng: parseFloat(updatedSensor.location_lng),
          name: updatedSensor.location_name
        },
        status: updatedSensor.status,
        batteryLevel: updatedSensor.battery_level,
        calibrationDate: updatedSensor.calibration_date,
        nextMaintenanceDate: updatedSensor.next_maintenance_date,
        configuration: updatedSensor.configuration,
        metadata: updatedSensor.metadata,
        createdAt: updatedSensor.created_at,
        updatedAt: updatedSensor.updated_at
      }
    }
  });
}));

// Delete sensor
router.delete('/:id', asyncHandler(async (req, res) => {
  const sensor = await db('sensors')
    .where({ id: req.params.id, user_id: req.user.id })
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

  await db('sensors').where({ id: req.params.id }).del();

  res.json({
    success: true,
    data: {
      message: 'Sensor deleted successfully'
    }
  });
}));

// Get sensor statistics
router.get('/stats/overview', asyncHandler(async (req, res) => {
  const stats = await db('sensors')
    .where({ user_id: req.user.id })
    .select(
      db.raw('COUNT(*) as total_sensors'),
      db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as online_sensors', ['online']),
      db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as offline_sensors', ['offline']),
      db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as maintenance_sensors', ['maintenance']),
      db.raw('AVG(battery_level) as avg_battery_level')
    )
    .first();

  // Get active alerts count
  const alertsCount = await db('alerts')
    .join('sensors', 'alerts.sensor_id', 'sensors.id')
    .where({ 'sensors.user_id': req.user.id, 'alerts.acknowledged': false })
    .count('* as count')
    .first();

  const totalSensors = parseInt(stats.total_sensors);
  const onlineSensors = parseInt(stats.online_sensors);

  res.json({
    success: true,
    data: {
      totalSensors,
      onlineSensors,
      offlineSensors: parseInt(stats.offline_sensors),
      maintenanceSensors: parseInt(stats.maintenance_sensors),
      activeAlerts: parseInt(alertsCount.count),
      uptime: totalSensors > 0 ? Math.round((onlineSensors / totalSensors) * 100) : 0,
      averageBatteryLevel: stats.avg_battery_level ? Math.round(parseFloat(stats.avg_battery_level)) : null
    }
  });
}));

module.exports = router;