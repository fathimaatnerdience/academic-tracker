let lastToastTime = 0;
const TOAST_COOLDOWN = 2000; // 2 seconds

/**
 * Show error toast with global deduplication
 * @param {string} message - User-friendly error message
 */
export const showErrorToast = (message) => {
  const now = Date.now();
  
  // Prevent duplicate toasts
  if (now - lastToastTime < TOAST_COOLDOWN) {
    return false; // Skip this toast
  }
  
  lastToastTime = now;
  
  // Show the toast
  import('react-toastify').then(({ toast }) => {
    toast.error(message);
  }).catch(() => {});
  
  return true; // Toast was shown
};

/**
 * Show success toast
 * @param {string} message - Success message
 */
export const showSuccessToast = (message) => {
  import('react-toastify').then(({ toast }) => {
    toast.success(message);
  }).catch(() => {});
};

/**
 * Process error and extract user-friendly message
 * @param {Error} error - The error object
 * @param {string} defaultMessage - Fallback message
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error, defaultMessage = 'Something went wrong. Please try again.') => {
  // Log for developers only
  if (process.env.NODE_ENV === 'development') {
    console.error('[Dev Error]:', error);
  }
  
  // Check for HTTP status code first (attached by API interceptor)
  const status = error.status || error.response?.status;
  
  // Handle HTTP status codes with user-friendly messages
  if (status) {
    switch (status) {
      case 400:
        return error.message || 'Invalid request. Please check your input.';
      case 401:
        return 'Invalid email or password. Please try again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        // Don't expose raw 404 messages - use default
        return defaultMessage;
      case 409:
        return error.message || 'This record already exists.';
      case 422:
        return error.message || 'Validation error. Please check your input.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service is temporarily unavailable. Please try again later.';
      default:
        // For other errors, continue to check message
        break;
    }
  }
  
  // Error already processed (from API interceptor)
  if (error && error.message) {
    // Check if it's a technical error we shouldn't show
    const technicalKeywords = [
      'Cannot read property',
      'undefined is not',
      'null is not',
      'Unexpected token',
      'SyntaxError',
      'TypeError',
      'ReferenceError',
      'at Object',
      'at Module',
      'not found',
      'requested page',
      'resource was not found'
    ];
    
    const isTechnical = technicalKeywords.some(keyword => 
      error.message.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (isTechnical) {
      return defaultMessage; // Use default instead of technical error
    }
    
    return error.message; // Use the error message (already user-friendly from backend)
  }
  
  // Fallback
  return defaultMessage;
};

/**
 * Handle error with automatic toast
 * @param {Error} error - The error object
 * @param {string} defaultMessage - Fallback message
 */
export const handleError = (error, defaultMessage) => {
  const message = getErrorMessage(error, defaultMessage);
  showErrorToast(message);
  return message;
};

/**
 * Debounce function for search
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export default {
  showErrorToast,
  showSuccessToast,
  getErrorMessage,
  handleError,
  debounce
};
