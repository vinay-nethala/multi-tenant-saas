const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { errorResponse } = require('../utils/response');

// 1. Verify Token and Attach User
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user to ensure they still exist and get latest role
      const result = await pool.query(
        'SELECT id, email, full_name, role, tenant_id FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        return errorResponse(res, 'User not found', 401);
      }

      req.user = result.rows[0];
      next();
    } catch (error) {
      return errorResponse(res, 'Not authorized, token failed', 401);
    }
  } else {
    return errorResponse(res, 'Not authorized, no token', 401);
  }
};

// 2. Role Based Access Control (RBAC)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res, 
        `User role ${req.user.role} is not authorized to access this route`, 
        403
      );
    }
    next();
  };
};

module.exports = { protect, authorize };