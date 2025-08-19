import React from 'react';
import { getErrorMessage, getErrorSeverity, getErrorIconName, getErrorStyling, isRetryableError } from '../utils/errorHandling';

interface ErrorDisplayProps {
  error: any;
  title?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  showDetails?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  title = 'An error occurred',
  onRetry,
  onDismiss,
  className = '',
  showDetails = false
}) => {
  const severity = getErrorSeverity(error);
  const styling = getErrorStyling(severity);
  const message = getErrorMessage(error);
  const canRetry = isRetryableError(error) && onRetry;

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${styling.container} ${className}`}>
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${styling.icon}`}>
          {renderIcon(getErrorIconName(severity))}
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-medium ${styling.title}`}>
              {title}
            </h3>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className={`text-sm ${styling.button} hover:opacity-75`}
                aria-label="Dismiss error"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <p className={`mt-1 text-sm ${styling.message}`}>
            {message}
          </p>
          
          {/* Error Details (Development Only) */}
          {showDetails && process.env.NODE_ENV === 'development' && error && (
            <details className="mt-3">
              <summary className={`cursor-pointer text-sm ${styling.button} hover:opacity-75`}>
                Error Details
              </summary>
              <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-32">
                <pre>{JSON.stringify(error, null, 2)}</pre>
              </div>
            </details>
          )}
          
          {/* Action Buttons */}
          <div className="mt-3 flex items-center space-x-3">
            {canRetry && (
              <button
                onClick={onRetry}
                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded ${styling.button} bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
            )}
            {severity === 'high' && (
              <a
                href="mailto:support@emergence.com"
                className={`text-xs ${styling.button} hover:opacity-75 underline`}
              >
                Contact Support
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
