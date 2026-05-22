const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    let user;

    if (decoded.role === 'admin') {
      user = await Admin.findById(decoded.userId).select('-password');
    } else {
      user = await User.findById(decoded.userId).select('-password');
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    if (user.isActive === false) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    req.userRole = decoded.role || user.role;
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const role = req.userRole || req.user?.role;

    if (!role || !roles.includes(role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

const requireAdmin = requireRole(['admin']);
const requireDoctor = requireRole(['doctor']);
const requireUser = requireRole(['user', 'doctor']);

module.exports = {
  auth,
  requireRole,
  requireAdmin,
  requireDoctor,
  requireUser
};
