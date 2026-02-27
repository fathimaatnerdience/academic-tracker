import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  let token;

  // Check if token exists in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Get token from header
    token = req.headers.authorization.split(' ')[1];

    // 🔧 DEMO MODE: Accept mock tokens for testing
    if (token.startsWith('mock-token-')) {
      // Find an existing admin user or first user in the database for demo purposes
      const adminUser = await User.findOne({ where: { role: 'admin' } });
      
      if (adminUser) {
        req.user = adminUser;
      } else {
        // Try to get any user as fallback
        const anyUser = await User.findOne();
        if (anyUser) {
          req.user = anyUser;
        } else {
          // No users in database - return error
          return res.status(401).json({
            success: false,
            message: 'No users found in database. Please register a user first.'
          });
        }
      }
      
      req.isMockToken = true; // Flag to indicate this is a mock token
      
      console.log('🔧 Demo mode: Mock token accepted, using user:', req.user.id);
      return next();
    }

    // Real JWT token verification
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Your account has been deactivated'
        });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      
      // Handle specific JWT errors
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired - please login again',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token',
          code: 'INVALID_TOKEN'
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Not authorized - token failed',
        code: 'TOKEN_ERROR'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

// Role-based access control
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

// Optional authentication - adds user to request if token exists, but doesn't require it
export const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
    } catch (error) {
      // Token invalid but don't block the request
      req.user = null;
    }
  }

  next();
};

export default { protect, authorize, optionalAuth };
