const prometheus = require('prom-client');

// Create a Registry
const register = new prometheus.Registry();

// Add default metrics
prometheus.collectDefaultMetrics({
  app: 'ecoguard-pro-backend',
  timeout: 10000,
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
  register
});

// Custom metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const httpRequestsTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const activeSensors = new prometheus.Gauge({
  name: 'active_sensors_total',
  help: 'Total number of active sensors',
});

const sensorReadingsTotal = new prometheus.Counter({
  name: 'sensor_readings_total',
  help: 'Total number of sensor readings received',
  labelNames: ['sensor_type', 'quality']
});

const alertsTotal = new prometheus.Counter({
  name: 'alerts_total',
  help: 'Total number of alerts generated',
  labelNames: ['severity', 'type']
});

const websocketConnections = new prometheus.Gauge({
  name: 'websocket_connections_active',
  help: 'Number of active WebSocket connections'
});

// Register metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(activeSensors);
register.registerMetric(sensorReadingsTotal);
register.registerMetric(alertsTotal);
register.registerMetric(websocketConnections);

// Middleware to track HTTP requests
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode)
      .observe(duration);
    
    httpRequestsTotal
      .labels(req.method, route, res.statusCode)
      .inc();
  });
  
  next();
};

// Metrics endpoint
const metricsEndpoint = (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
};

// Health check with detailed status
const healthCheck = async (req, res) => {
  const db = require('../config/database');
  
  try {
    // Check database connection
    await db.raw('SELECT 1');
    
    // Get system metrics
    const metrics = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: 'connected',
      environment: process.env.NODE_ENV || 'development'
    };
    
    res.json(metrics);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      database: 'disconnected'
    });
  }
};

// Update sensor metrics
const updateSensorMetrics = async () => {
  try {
    const db = require('../config/database');
    
    // Count active sensors
    const { count: activeCount } = await db('sensors')
      .where({ status: 'online' })
      .count('* as count')
      .first();
    
    activeSensors.set(parseInt(activeCount));
  } catch (error) {
    console.error('Error updating sensor metrics:', error);
  }
};

// Track sensor reading
const trackSensorReading = (sensorType, quality) => {
  sensorReadingsTotal.labels(sensorType, quality).inc();
};

// Track alert
const trackAlert = (severity, type) => {
  alertsTotal.labels(severity, type).inc();
};

// Track WebSocket connections
const trackWebSocketConnection = (delta) => {
  websocketConnections.inc(delta);
};

// Start metrics collection
setInterval(updateSensorMetrics, 30000); // Update every 30 seconds

module.exports = {
  metricsMiddleware,
  metricsEndpoint,
  healthCheck,
  trackSensorReading,
  trackAlert,
  trackWebSocketConnection,
  register
};