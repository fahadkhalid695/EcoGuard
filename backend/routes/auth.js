const express = require('express');
const router = express.Router();

// Demo auth endpoints
router.post('/login', (req, res) => {
  res.json({
    success: true,
    token: 'demo-token-123',
    user: { id: 1, email: 'demo@ecoguard.com', name: 'Demo User' }
  });
});

router.post('/logout', (req, res) => {
  res.json({ success: true });
});

router.get('/me', (req, res) => {
  res.json({
    success: true,
    user: { id: 1, email: 'demo@ecoguard.com', name: 'Demo User' }
  });
});

module.exports = router;