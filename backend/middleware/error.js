// ============================================
// FIXED BACKEND ERROR HANDLER
// File: backend/middleware/error.js - REPLACE ENTIRE FILE
// ============================================

// User-friendly error messages mapping
const ERROR_MESSAGES = {
  // Sequelize errors
  'SequelizeConnectionError': 'Unable to connect to database. Please try again later.',
  'SequelizeValidationError': 'Invalid data provided. Please check your input.',
  'SequelizeUniqueConstraintError': 'This record already exists.',
  'SequelizeForeignKeyConstraintError': 'Cannot delete this record as it is referenced by other records.',
  'SequelizeDatabaseError': 'Database error occurred. Please try again.',
  
  // JWT errors
  'JsonWebTokenError': 'Authentication failed. Please login again.',
  'TokenExpiredError': 'Your session has expired. Please login again.',
  
  // General errors
  'CastError': 'Invalid ID format.',
  'ValidationError': 'Validation failed. Please check your input.'
};

// Get user-friendly message
const getUserFriendlyMessage = (error) => {
  // Check if we have a mapped message for this error type
  if (error.name && ERROR_MESSAGES[error.name]) {
    return ERROR_MESSAGES[error.name];
  }
  
  // Handle Sequelize validation errors with field details
  if (error.name === 'SequelizeValidationError' && error.errors) {
    const fieldErrors = error.errors.map(err => err.message);
    return fieldErrors.length > 0 ? fieldErrors.join(', ') : ERROR_MESSAGES['SequelizeValidationError'];
  }
  
  // Handle Sequelize unique constraint with field name
  if (error.name === 'SequelizeUniqueConstraintError' && error.errors) {
    const field = error.errors[0]?.path || 'field';
    return `A record with this ${field} already exists.`;
  }
  
  // Default user-friendly message
  return 'An error occurred. Please try again or contact support.';
};

// Custom error class
export class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Not found error handler
export const notFound = (req, res, next) => {
  const error = new ErrorResponse(`Route not found - ${req.originalUrl}`, 404);
  next(error);
};

// Global error handler
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  
  // Log error details for developers (CONSOLE ONLY - NOT SENT TO FRONTEND)
  console.error('❌ Error Details:', {
    name: err.name,
    message: err.message,
    statusCode: statusCode,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    // Only show stack in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });

  // Determine appropriate status code based on error type
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
  } else if (err.name === 'CastError') {
    statusCode = 400;
  }

  // Get user-friendly message (NEVER send technical errors to frontend)
  const userMessage = getUserFriendlyMessage(err);

  // Send clean response (NO stack traces, NO technical details)
  res.status(statusCode).json({
    success: false,
    message: userMessage,
    // Only in development, add minimal debug info (NO stack traces to frontend)
    ...(process.env.NODE_ENV === 'development' && {
      devInfo: {
        errorType: err.name,
        path: req.path
      }
    })
  });
};

export default { ErrorResponse, notFound, errorHandler };
