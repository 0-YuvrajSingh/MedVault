import React from 'react';
import errorLogger from '../../utils/errorLogger';
import { logger } from '../../utils/logger';

/**
 * Error Boundary Component with custom fallback support
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
    
    // Log error to error logging service
    errorLogger.logBoundaryError(error, errorInfo, errorInfo?.componentStack);
    
    // Optional: Send error to custom handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback({ 
            error: this.state.error, 
            resetErrorBoundary: this.resetErrorBoundary 
          });
        }
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-error/10 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Oops! Something went wrong
            </h1>

            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              We're sorry for the inconvenience. Please try refreshing the page.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mb-6 p-4 bg-neutral-100 dark:bg-neutral-900 rounded-xl">
                <summary className="cursor-pointer font-medium text-sm text-neutral-700 dark:text-neutral-300 mb-2">
                  Error Details
                </summary>
                <p className="text-xs text-error font-mono mb-2">
                  {this.state.error.toString()}
                </p>
                <pre className="text-xs text-neutral-600 dark:text-neutral-400 overflow-auto">
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <button
              onClick={this.resetErrorBoundary}
              className="w-full px-4 py-2.5 bg-error text-white rounded-2xl font-medium hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>

            <button
              onClick={() => window.location.href = '/'}
              className="w-full mt-3 px-4 py-2.5 border-2 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-2xl font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

