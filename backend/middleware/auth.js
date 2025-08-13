const authenticateToken = (req, res, next) => {
  // Demo mode - skip authentication
  req.user = { id: 1, email: 'demo@ecoguard.com' };
  next();
};

module.exports = { authenticateToken };