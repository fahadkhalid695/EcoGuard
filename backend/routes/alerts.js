const express = require('express');
const { body, query, validationResult } = require('express-validator');
const db = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Get alerts for user's sensors
router.get('/', [
  query('acknowledged').optional().isBoolean(),
  query('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
  query('type').optional().isIn(['threshold', 'anomaly', 'maintenance', 'connectivity']),
  query('sensorId').optional().isUUID(),
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

  const { acknowledged, severity, type, sensorId, limit = 50, offset = 0 } = req.query;

  let query = db('alerts')
    .join('sensors', 'alerts.sensor_id', 'sensors.id')
    .where({ 'sensors.user_id': req.user.id })
    .select(
      'alerts.*',
      'sensors.name as sensor_name',
      'sensors.sensor_type',
      'sensors.location_name'
    )
    .orderBy('alerts.timestamp', 'desc')
    .limit(parseInt(limit))
    .offset(parseInt(offset));

  if (acknowledged !== undefined) {
    query = query.where({ 'alerts.acknowledged': acknowledged === 'true' });
  }

  if (severity) {
    query = query.where({ 'alerts.severity': severity });
  }

  if (type) {
    query = query.where({ 'alerts.alert_type': type });
  }

  if (sensorId) {
    query = query.where({ 'alerts.sensor_id': sensorId });
  }

  const alerts = await query;

  // Get total count for pagination
  let countQuery = db('alerts')
    .join('sensors', 'alerts.sensor_id', 'sensors.id')
    .where({ 'sensors.user_id': req.user.id })
    .count('* as count');

  if (acknowledged !== undefined) {
    countQuery = countQuery.where({ 'alerts.acknowledged': acknowledged === 'true' });
  }
  if (severity) countQuery = countQuery.where({ 'alerts.severity': severity });
  if (type) countQuery = countQuery.where({ 'alerts.alert_type': type });
  if (sensorId) countQuery = countQuery.where({ 'alerts.sensor_id': sensorId });

  const [{ count }] = await countQuery;

  res.json({
    success: true,
    data: {
      alerts: alerts.map(alert => ({
        id: alert.id,
        sensorId: alert.sensor_id,
        sensorName: alert.sensor_name,
        sensorType: alert.sensor_type,
        locationName: alert.location_name,
        type: alert.alert_type,
        severity: alert.severity,
        message: alert.message,
        timestamp: alert.timestamp,
        acknowledged: alert.acknowledged,
        acknowledgedBy: alert.acknowledged_by,
        acknowledgedAt: alert.acknowledged_at,
        resolvedAt: alert.resolved_at,
        metadata: alert.metadata,
        createdAt: alert.created_at,
        updatedAt: alert.updated_at
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

// Get alert by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const alert = await db('alerts')
    .join('sensors', 'alerts.sensor_id', 'sensors.id')
    .where({ 
      'alerts.id': req.params.id,
      'sensors.user_id': req.user.id 
    })
    .select(
      'alerts.*',
      'sensors.name as sensor_name',
      'sensors.sensor_type',
      'sensors.location_name'
    )
    .first();

  if (!alert) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'ALERT_NOT_FOUND',
        message: 'Alert not found'
      }
    });
  }

  res.json({
    success: true,
    data: {
      alert: {
        id: alert.id,
        sensorId: alert.sensor_id,
        sensorName: alert.sensor_name,
        sensorType: alert.sensor_type,
        locationName: alert.location_name,
        type: alert.alert_type,
        severity: alert.severity,
        message: alert.message,
        timestamp: alert.timestamp,
        acknowledged: alert.acknowledged,
        acknowledgedBy: alert.acknowledged_by,
        acknowledgedAt: alert.acknowledged_at,
        resolvedAt: alert.resolved_at,
        metadata: alert.metadata,
        createdAt: alert.created_at,
        updatedAt: alert.updated_at
      }
    }
  });
}));

// Create new alert
router.post('/', [
  body('sensorId').isUUID(),
  body('type').isIn(['threshold', 'anomaly', 'maintenance', 'connectivity']),
  body('severity').isIn(['low', 'medium', 'high', 'critical']),
  body('message').notEmpty().trim(),
  body('timestamp').optional().isISO8601()
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

  const { sensorId, type, severity, message, timestamp, metadata } = req.body;

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

  const [alert] = await db('alerts').insert({
    sensor_id: sensorId,
    alert_type: type,
    severity,
    message,
    timestamp: timestamp ? new Date(timestamp) : new Date(),
    acknowledged: false,
    metadata: JSON.stringify(metadata || {})
  }).returning('*');

  res.status(201).json({
    success: true,
    data: {
      alert: {
        id: alert.id,
        sensorId: alert.sensor_id,
        type: alert.alert_type,
        severity: alert.severity,
        message: alert.message,
        timestamp: alert.timestamp,
        acknowledged: alert.acknowledged,
        metadata: alert.metadata,
        createdAt: alert.created_at,
        updatedAt: alert.updated_at
      }
    }
  });
}));

// Acknowledge alert
router.put('/:id/acknowledge', asyncHandler(async (req, res) => {
  const alert = await db('alerts')
    .join('sensors', 'alerts.sensor_id', 'sensors.id')
    .where({ 
      'alerts.id': req.params.id,
      'sensors.user_id': req.user.id 
    })
    .select('alerts.*')
    .first();

  if (!alert) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'ALERT_NOT_FOUND',
        message: 'Alert not found'
      }
    });
  }

  if (alert.acknowledged) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'ALREADY_ACKNOWLEDGED',
        message: 'Alert is already acknowledged'
      }
    });
  }

  const [updatedAlert] = await db('alerts')
    .where({ id: req.params.id })
    .update({
      acknowledged: true,
      acknowledged_by: req.user.id,
      acknowledged_at: new Date(),
      updated_at: new Date()
    })
    .returning('*');

  res.json({
    success: true,
    data: {
      alert: {
        id: updatedAlert.id,
        sensorId: updatedAlert.sensor_id,
        type: updatedAlert.alert_type,
        severity: updatedAlert.severity,
        message: updatedAlert.message,
        timestamp: updatedAlert.timestamp,
        acknowledged: updatedAlert.acknowledged,
        acknowledgedBy: updatedAlert.acknowledged_by,
        acknowledgedAt: updatedAlert.acknowledged_at,
        resolvedAt: updatedAlert.resolved_at,
        metadata: updatedAlert.metadata,
        createdAt: updatedAlert.created_at,
        updatedAt: updatedAlert.updated_at
      }
    }
  });
}));

// Resolve alert
router.put('/:id/resolve', asyncHandler(async (req, res) => {
  const alert = await db('alerts')
    .join('sensors', 'alerts.sensor_id', 'sensors.id')
    .where({ 
      'alerts.id': req.params.id,
      'sensors.user_id': req.user.id 
    })
    .select('alerts.*')
    .first();

  if (!alert) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'ALERT_NOT_FOUND',
        message: 'Alert not found'
      }
    });
  }

  if (alert.resolved_at) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'ALREADY_RESOLVED',
        message: 'Alert is already resolved'
      }
    });
  }

  const updateData = {
    resolved_at: new Date(),
    updated_at: new Date()
  };

  // Auto-acknowledge if not already acknowledged
  if (!alert.acknowledged) {
    updateData.acknowledged = true;
    updateData.acknowledged_by = req.user.id;
    updateData.acknowledged_at = new Date();
  }

  const [updatedAlert] = await db('alerts')
    .where({ id: req.params.id })
    .update(updateData)
    .returning('*');

  res.json({
    success: true,
    data: {
      alert: {
        id: updatedAlert.id,
        sensorId: updatedAlert.sensor_id,
        type: updatedAlert.alert_type,
        severity: updatedAlert.severity,
        message: updatedAlert.message,
        timestamp: updatedAlert.timestamp,
        acknowledged: updatedAlert.acknowledged,
        acknowledgedBy: updatedAlert.acknowledged_by,
        acknowledgedAt: updatedAlert.acknowledged_at,
        resolvedAt: updatedAlert.resolved_at,
        metadata: updatedAlert.metadata,
        createdAt: updatedAlert.created_at,
        updatedAt: updatedAlert.updated_at
      }
    }
  });
}));

// Delete alert
router.delete('/:id', asyncHandler(async (req, res) => {
  const alert = await db('alerts')
    .join('sensors', 'alerts.sensor_id', 'sensors.id')
    .where({ 
      'alerts.id': req.params.id,
      'sensors.user_id': req.user.id 
    })
    .select('alerts.*')
    .first();

  if (!alert) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'ALERT_NOT_FOUND',
        message: 'Alert not found'
      }
    });
  }

  await db('alerts').where({ id: req.params.id }).del();

  res.json({
    success: true,
    data: {
      message: 'Alert deleted successfully'
    }
  });
}));

// Get alert statistics
router.get('/stats/overview', asyncHandler(async (req, res) => {
  const stats = await db('alerts')
    .join('sensors', 'alerts.sensor_id', 'sensors.id')
    .where({ 'sensors.user_id': req.user.id })
    .select(
      db.raw('COUNT(*) as total_alerts'),
      db.raw('COUNT(CASE WHEN acknowledged = false THEN 1 END) as unacknowledged_alerts'),
      db.raw('COUNT(CASE WHEN severity = ? THEN 1 END) as critical_alerts', ['critical']),
      db.raw('COUNT(CASE WHEN severity = ? THEN 1 END) as high_alerts', ['high']),
      db.raw('COUNT(CASE WHEN severity = ? THEN 1 END) as medium_alerts', ['medium']),
      db.raw('COUNT(CASE WHEN severity = ? THEN 1 END) as low_alerts', ['low'])
    )
    .first();

  // Get alerts by type
  const alertsByType = await db('alerts')
    .join('sensors', 'alerts.sensor_id', 'sensors.id')
    .where({ 'sensors.user_id': req.user.id })
    .select('alert_type')
    .count('* as count')
    .groupBy('alert_type');

  // Get recent alerts (last 24 hours)
  const recentAlerts = await db('alerts')
    .join('sensors', 'alerts.sensor_id', 'sensors.id')
    .where({ 'sensors.user_id': req.user.id })
    .where('alerts.timestamp', '>', new Date(Date.now() - 24 * 60 * 60 * 1000))
    .count('* as count')
    .first();

  res.json({
    success: true,
    data: {
      totalAlerts: parseInt(stats.total_alerts),
      unacknowledgedAlerts: parseInt(stats.unacknowledged_alerts),
      criticalAlerts: parseInt(stats.critical_alerts),
      highAlerts: parseInt(stats.high_alerts),
      mediumAlerts: parseInt(stats.medium_alerts),
      lowAlerts: parseInt(stats.low_alerts),
      recentAlerts: parseInt(recentAlerts.count),
      alertsByType: alertsByType.reduce((acc, item) => {
        acc[item.alert_type] = parseInt(item.count);
        return acc;
      }, {})
    }
  });
}));

module.exports = router;