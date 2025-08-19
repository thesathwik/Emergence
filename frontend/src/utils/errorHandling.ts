// Error handling utilities for consistent API error management

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export interface ErrorState {
  error: string | null;
  isLoading: boolean;
  retry?: () => void;
}

/**
 * Extract user-friendly error message from various error types
 */
export const getErrorMessage = (error: any): string => {
  // Handle Axios errors
  if (error?.response) {
    const { status, data } = error.response;
    
    // Handle specific HTTP status codes
    switch (status) {
      case 400:
        return data?.message || 'Invalid request. Please check your input and try again.';
      case 401:
        return 'You are not authorized to perform this action. Please log in and try again.';
      case 403:
        return 'Access denied. You don\'t have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return data?.message || 'This resource already exists.';
      case 422:
        return data?.message || 'Validation failed. Please check your input.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
        return 'Service temporarily unavailable. Please try again later.';
      case 503:
        return 'Service is currently down for maintenance. Please try again later.';
      default:
        return data?.message || `An error occurred (${status}). Please try again.`;
    }
  }
  
  // Handle network errors
  if (error?.request) {
    return 'Network error. Please check your internet connection and try again.';
  }
  
  // Handle timeout errors
  if (error?.code === 'ECONNABORTED') {
    return 'Request timed out. Please try again.';
  }
  
  // Handle generic errors
  if (error?.message) {
    return error.message;
  }
  
  // Fallback error message
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Get error severity level for UI styling
 */
export const getErrorSeverity = (error: any): 'low' | 'medium' | 'high' => {
  if (error?.response) {
    const { status } = error.response;
    
    // High severity errors
    if (status >= 500) return 'high';
    
    // Medium severity errors
    if (status >= 400 && status < 500) return 'medium';
    
    // Low severity errors
    return 'low';
  }
  
  // Network errors are high severity
  if (error?.request) return 'high';
  
  // Default to medium
  return 'medium';
};

/**
 * Get error icon name based on severity
 */
export const getErrorIconName = (severity: 'low' | 'medium' | 'high'): string => {
  switch (severity) {
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'info';
  }
};

/**
 * Get error styling classes based on severity
 */
export const getErrorStyling = (severity: 'low' | 'medium' | 'high') => {
  switch (severity) {
    case 'high':
      return {
        container: 'bg-red-50 border-red-200',
        icon: 'text-red-600',
        title: 'text-red-800',
        message: 'text-red-700',
        button: 'text-red-600 hover:text-red-800'
      };
    case 'medium':
      return {
        container: 'bg-yellow-50 border-yellow-200',
        icon: 'text-yellow-600',
        title: 'text-yellow-800',
        message: 'text-yellow-700',
        button: 'text-yellow-600 hover:text-yellow-800'
      };
    case 'low':
      return {
        container: 'bg-blue-50 border-blue-200',
        icon: 'text-blue-600',
        title: 'text-blue-800',
        message: 'text-blue-700',
        button: 'text-blue-600 hover:text-blue-800'
      };
  }
};

/**
 * Check if error is retryable
 */
export const isRetryableError = (error: any): boolean => {
  if (error?.response) {
    const { status } = error.response;
    
    // Retry on server errors and rate limiting
    return status >= 500 || status === 429;
  }
  
  // Retry on network errors
  return !!error?.request;
};

/**
 * Get retry delay based on error type
 */
export const getRetryDelay = (error: any, attempt: number = 1): number => {
  if (error?.response?.status === 429) {
    // Exponential backoff for rate limiting
    return Math.min(1000 * Math.pow(2, attempt - 1), 30000);
  }
  
  // Default retry delay
  return 2000;
};

/**
 * Create a standardized error state
 */
export const createErrorState = (error: any, retry?: () => void): ErrorState => {
  return {
    error: getErrorMessage(error),
    isLoading: false,
    retry: isRetryableError(error) ? retry : undefined
  };
};

/**
 * Log error for debugging (in development)
 */
export const logError = (error: any, context?: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`Error${context ? ` in ${context}` : ''}`);
    console.error('Error details:', error);
    console.error('Error message:', getErrorMessage(error));
    console.error('Error severity:', getErrorSeverity(error));
    console.error('Is retryable:', isRetryableError(error));
    console.groupEnd();
  }
  
  // In production, you would send this to an error reporting service
  // Example: Sentry.captureException(error, { extra: { context } });
};

/**
 * Common error messages for specific scenarios
 */
export const ErrorMessages = {
  NETWORK: 'Network error. Please check your internet connection and try again.',
  TIMEOUT: 'Request timed out. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action. Please log in and try again.',
  FORBIDDEN: 'Access denied. You don\'t have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  MAINTENANCE: 'Service is currently down for maintenance. Please try again later.',
  RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
  UNKNOWN: 'An unexpected error occurred. Please try again.'
} as const;


