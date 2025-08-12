const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const crypto = require('crypto');

// Advanced rate limiting
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: { code: 'RATE_LIMIT_EXCEEDED', message } },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests, please try again later'
        }
      });
    }
  });
};

// Speed limiter for repeated requests
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 2, // Allow 2 requests per windowMs without delay
  delayMs: 500, // Add 500ms delay per request after delayAfter
  maxDelayMs: 20000, // Maximum delay of 20 seconds
});

// API key validation
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: { code: 'API_KEY_REQUIRED', message: 'API key is required' }
    });
  }

  // Validate API key format and existence
  if (!isValidApiKey(apiKey)) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_API_KEY', message: 'Invalid API key' }
    });
  }

  next();
};

// Request signature validation for IoT devices
const validateSignature = (req, res, next) => {
  const signature = req.headers['x-signature'];
  const timestamp = req.headers['x-timestamp'];
  const deviceId = req.headers['x-device-id'];

  if (!signature || !timestamp || !deviceId) {
    return res.status(401).json({
      success: false,
      error: { code: 'MISSING_SIGNATURE', message: 'Request signature required' }
    });
  }

  // Check timestamp to prevent replay attacks
  const now = Date.now();
  const requestTime = parseInt(timestamp);
  const timeDiff = Math.abs(now - requestTime);

  if (timeDiff > 300000) { // 5 minutes
    return res.status(401).json({
      success: false,
      error: { code: 'REQUEST_EXPIRED', message: 'Request timestamp expired' }
    });
  }

  // Validate signature
  const expectedSignature = generateSignature(req.body, timestamp, deviceId);
  if (signature !== expectedSignature) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_SIGNATURE', message: 'Invalid request signature' }
    });
  }

  next();
};

// Input sanitization
const sanitizeInput = (req, res, next) => {
  // Remove potentially dangerous characters
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '');
    }
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        obj[key] = sanitize(obj[key]);
      }
    }
    return obj;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);

  next();
};

// CSRF protection
const csrfProtection = (req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const token = req.headers['x-csrf-token'] || req.body._csrf;
    const sessionToken = req.session?.csrfToken;

    if (!token || !sessionToken || token !== sessionToken) {
      return res.status(403).json({
        success: false,
        error: { code: 'CSRF_TOKEN_INVALID', message: 'Invalid CSRF token' }
      });
    }
  }

  next();
};

// IP whitelist for admin endpoints
const ipWhitelist = (allowedIPs) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (!allowedIPs.includes(clientIP)) {
      return res.status(403).json({
        success: false,
        error: { code: 'IP_NOT_ALLOWED', message: 'IP address not allowed' }
      });
    }

    next();
  };
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
};

// Utility functions
function isValidApiKey(apiKey) {
  // Implement your API key validation logic
  return apiKey && apiKey.length >= 32;
}

function generateSignature(body, timestamp, deviceId) {
  const secret = process.env.DEVICE_SECRET || 'default-secret';
  const payload = JSON.stringify(body) + timestamp + deviceId;
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

// Rate limiters for different endpoints
const rateLimiters = {
  general: createRateLimiter(15 * 60 * 1000, 100, 'Too many requests'),
  auth: createRateLimiter(15 * 60 * 1000, 5, 'Too many authentication attempts'),
  api: createRateLimiter(15 * 60 * 1000, 1000, 'API rate limit exceeded'),
  sensor: createRateLimiter(60 * 1000, 60, 'Too many sensor readings')
};

module.exports = {
  rateLimiters,
  speedLimiter,
  validateApiKey,
  validateSignature,
  sanitizeInput,
  csrfProtection,
  ipWhitelist,
  securityHeaders
};