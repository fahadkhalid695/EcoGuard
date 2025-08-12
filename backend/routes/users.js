const express = require('express');
const { body, query, validationResult } = require('express-validator');
const db = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// Get user profile (already in auth routes, but included here for completeness)
router.get('/profile', asyncHandler(async (req, res) => {
  const user = await db('users')
    .select('id', 'email', 'first_name', 'last_name', 'organization', 'role', 'preferences', 'last_login', 'created_at')
    .where({ id: req.user.id })
    .first();

  if (!user) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'User not found'
      }
    });
  }

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        organization: user.organization,
        role: user.role,
        preferences: user.preferences,
        lastLogin: user.last_login,
        createdAt: user.created_at
      }
    }
  });
}));

// Update user preferences
router.put('/preferences', [
  body('theme').optional().isIn(['light', 'dark', 'auto']),
  body('notifications').optional().isObject(),
  body('dashboard').optional().isObject(),
  body('units').optional().isObject()
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

  const { theme, notifications, dashboard, units } = req.body;

  // Get current preferences
  const user = await db('users')
    .select('preferences')
    .where({ id: req.user.id })
    .first();

  const currentPreferences = user.preferences || {};
  const newPreferences = { ...currentPreferences };

  if (theme !== undefined) newPreferences.theme = theme;
  if (notifications !== undefined) newPreferences.notifications = notifications;
  if (dashboard !== undefined) newPreferences.dashboard = dashboard;
  if (units !== undefined) newPreferences.units = units;

  const [updatedUser] = await db('users')
    .where({ id: req.user.id })
    .update({
      preferences: JSON.stringify(newPreferences),
      updated_at: new Date()
    })
    .returning(['id', 'preferences']);

  res.json({
    success: true,
    data: {
      preferences: updatedUser.preferences
    }
  });
}));

// Get user activity log
router.get('/activity', [
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  query('type').optional().isIn(['login', 'sensor_created', 'alert_acknowledged', 'settings_updated'])
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

  const { limit = 50, offset = 0, type } = req.query;

  // For now, return mock activity data
  // In a real implementation, you'd have an activity_logs table
  const mockActivities = [
    {
      id: '1',
      type: 'login',
      description: 'User logged in',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      metadata: { ip: '192.168.1.1', userAgent: 'Mozilla/5.0...' }
    },
    {
      id: '2',
      type: 'sensor_created',
      description: 'Created new temperature sensor',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      metadata: { sensorId: 'temp-001', sensorName: 'Office Temperature' }
    },
    {
      id: '3',
      type: 'alert_acknowledged',
      description: 'Acknowledged high temperature alert',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      metadata: { alertId: 'alert-123', sensorName: 'Office Temperature' }
    }
  ];

  let filteredActivities = mockActivities;
  if (type) {
    filteredActivities = mockActivities.filter(activity => activity.type === type);
  }

  const paginatedActivities = filteredActivities.slice(offset, offset + limit);

  res.json({
    success: true,
    data: {
      activities: paginatedActivities,
      pagination: {
        total: filteredActivities.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: offset + limit < filteredActivities.length
      }
    }
  });
}));

// Get user statistics
router.get('/stats', asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get user's sensor statistics
  const sensorStats = await db('sensors')
    .where({ user_id: userId })
    .select(
      db.raw('COUNT(*) as total_sensors'),
      db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as online_sensors', ['online']),
      db.raw('MIN(created_at) as first_sensor_date')
    )
    .first();

  // Get readings count
  const readingsCount = await db('sensor_readings')
    .join('sensors', 'sensor_readings.sensor_id', 'sensors.id')
    .where({ 'sensors.user_id': userId })
    .count('* as count')
    .first();

  // Get alerts count
  const alertsCount = await db('alerts')
    .join('sensors', 'alerts.sensor_id', 'sensors.id')
    .where({ 'sensors.user_id': userId })
    .select(
      db.raw('COUNT(*) as total_alerts'),
      db.raw('COUNT(CASE WHEN acknowledged = true THEN 1 END) as acknowledged_alerts')
    )
    .first();

  // Get account age
  const user = await db('users')
    .select('created_at')
    .where({ id: userId })
    .first();

  const accountAgeDays = Math.floor((new Date() - new Date(user.created_at)) / (24 * 60 * 60 * 1000));

  res.json({
    success: true,
    data: {
      accountAge: {
        days: accountAgeDays,
        createdAt: user.created_at
      },
      sensors: {
        total: parseInt(sensorStats.total_sensors),
        online: parseInt(sensorStats.online_sensors),
        firstSensorDate: sensorStats.first_sensor_date
      },
      readings: {
        total: parseInt(readingsCount.count)
      },
      alerts: {
        total: parseInt(alertsCount.total_alerts),
        acknowledged: parseInt(alertsCount.acknowledged_alerts),
        acknowledgmentRate: alertsCount.total_alerts > 0 ? 
          Math.round((alertsCount.acknowledged_alerts / alertsCount.total_alerts) * 100) : 0
      }
    }
  });
}));

// Admin routes (require admin role)

// Get all users (admin only)
router.get('/', requireRole(['admin', 'super_admin']), [
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  query('role').optional().isIn(['user', 'admin', 'super_admin']),
  query('active').optional().isBoolean()
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

  const { limit = 50, offset = 0, role, active } = req.query;

  let query = db('users')
    .select('id', 'email', 'first_name', 'last_name', 'organization', 'role', 'is_active', 'last_login', 'created_at')
    .orderBy('created_at', 'desc')
    .limit(parseInt(limit))
    .offset(parseInt(offset));

  if (role) {
    query = query.where({ role });
  }

  if (active !== undefined) {
    query = query.where({ is_active: active === 'true' });
  }

  const users = await query;

  // Get total count for pagination
  let countQuery = db('users').count('* as count');
  if (role) countQuery = countQuery.where({ role });
  if (active !== undefined) countQuery = countQuery.where({ is_active: active === 'true' });

  const [{ count }] = await countQuery;

  res.json({
    success: true,
    data: {
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        organization: user.organization,
        role: user.role,
        isActive: user.is_active,
        lastLogin: user.last_login,
        createdAt: user.created_at
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

// Update user role (admin only)
router.put('/:userId/role', requireRole(['admin', 'super_admin']), [
  body('role').isIn(['user', 'admin', 'super_admin'])
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

  const { userId } = req.params;
  const { role } = req.body;

  // Prevent users from modifying their own role
  if (userId === req.user.id) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'CANNOT_MODIFY_OWN_ROLE',
        message: 'Cannot modify your own role'
      }
    });
  }

  // Only super_admin can create other admins
  if (role === 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'INSUFFICIENT_PERMISSIONS',
        message: 'Only super administrators can assign admin roles'
      }
    });
  }

  const user = await db('users').where({ id: userId }).first();
  if (!user) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'User not found'
      }
    });
  }

  const [updatedUser] = await db('users')
    .where({ id: userId })
    .update({
      role,
      updated_at: new Date()
    })
    .returning(['id', 'email', 'first_name', 'last_name', 'role']);

  res.json({
    success: true,
    data: {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        role: updatedUser.role
      }
    }
  });
}));

// Deactivate user (admin only)
router.put('/:userId/deactivate', requireRole(['admin', 'super_admin']), asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Prevent users from deactivating themselves
  if (userId === req.user.id) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'CANNOT_DEACTIVATE_SELF',
        message: 'Cannot deactivate your own account'
      }
    });
  }

  const user = await db('users').where({ id: userId }).first();
  if (!user) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'User not found'
      }
    });
  }

  await db('users')
    .where({ id: userId })
    .update({
      is_active: false,
      updated_at: new Date()
    });

  res.json({
    success: true,
    data: {
      message: 'User deactivated successfully'
    }
  });
}));

// Reactivate user (admin only)
router.put('/:userId/activate', requireRole(['admin', 'super_admin']), asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await db('users').where({ id: userId }).first();
  if (!user) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'User not found'
      }
    });
  }

  await db('users')
    .where({ id: userId })
    .update({
      is_active: true,
      updated_at: new Date()
    });

  res.json({
    success: true,
    data: {
      message: 'User activated successfully'
    }
  });
}));

module.exports = router;