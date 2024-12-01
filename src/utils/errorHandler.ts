import toast from 'react-hot-toast';

// Error types
export enum ErrorType {
  AUTH = 'auth',
  NETWORK = 'network',
  DATABASE = 'database',
  VALIDATION = 'validation',
  UNKNOWN = 'unknown'
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

interface ErrorDetails {
  type: ErrorType;
  severity: ErrorSeverity;
  context?: Record<string, any>;
  displayMessage?: string;
}

export class AppError extends Error {
  type: ErrorType;
  severity: ErrorSeverity;
  context?: Record<string, any>;
  displayMessage: string;

  constructor(message: string, details: ErrorDetails) {
    super(message);
    this.name = 'AppError';
    this.type = details.type;
    this.severity = details.severity;
    this.context = details.context;
    this.displayMessage = details.displayMessage || message;
  }
}

export function handleError(error: unknown, context?: Record<string, any>): void {
  // Determine if it's our custom error or something else
  const appError = error instanceof AppError ? error : normalizeError(error);
  
  // Log the error with context
  logError(appError, context);
  
  // Show user-friendly message for non-low severity errors
  if (appError.severity !== ErrorSeverity.LOW) {
    showErrorToast(appError);
  }
  
  // Additional handling based on severity
  handleBySeverity(appError);
}

function normalizeError(error: unknown): AppError {
  if (error instanceof Error) {
    // Check for specific error types
    if (error.name === 'NetworkError' || error.message.includes('network')) {
      return new AppError(error.message, {
        type: ErrorType.NETWORK,
        severity: ErrorSeverity.HIGH,
        displayMessage: 'Connection error. Please check your internet connection.'
      });
    }
    
    if (error.name === 'AuthError' || error.message.includes('auth')) {
      return new AppError(error.message, {
        type: ErrorType.AUTH,
        severity: ErrorSeverity.HIGH,
        displayMessage: 'Authentication error. Please try signing in again.'
      });
    }

    // Handle database errors
    if (error.message.includes('database') || error.message.includes('supabase')) {
      return new AppError(error.message, {
        type: ErrorType.DATABASE,
        severity: ErrorSeverity.HIGH,
        displayMessage: 'Database error. Please try again later.'
      });
    }
    
    // Default error transformation
    return new AppError(error.message, {
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      displayMessage: 'An unexpected error occurred. Please try again.'
    });
  }
  
  // Handle non-Error objects
  return new AppError('Unknown error occurred', {
    type: ErrorType.UNKNOWN,
    severity: ErrorSeverity.LOW,
    displayMessage: 'Something went wrong. Please try again.'
  });
}

function logError(error: AppError, context?: Record<string, any>): void {
  const errorLog = {
    timestamp: new Date().toISOString(),
    type: error.type,
    severity: error.severity,
    message: error.message,
    displayMessage: error.displayMessage,
    context: {
      ...error.context,
      ...context
    },
    stack: error.stack
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    const color = error.severity === ErrorSeverity.CRITICAL ? '🔴' :
                 error.severity === ErrorSeverity.HIGH ? '🟠' :
                 error.severity === ErrorSeverity.MEDIUM ? '🟡' : '⚪️';
    console.error(`${color} [${error.type.toUpperCase()}]:`, errorLog);
  }

  // In production, you might want to send this to a logging service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to logging service
    // Example: sendToLoggingService(errorLog);
  }
}

function showErrorToast(error: AppError): void {
  toast.error(error.displayMessage, {
    duration: error.severity === ErrorSeverity.HIGH ? 6000 : 4000,
    position: 'bottom-right'
  });
}

function handleBySeverity(error: AppError): void {
  switch (error.severity) {
    case ErrorSeverity.CRITICAL:
      // Might want to show a modal or redirect to an error page
      // window.location.href = '/error';
      break;
      
    case ErrorSeverity.HIGH:
      // Might want to retry the operation
      // retryOperation();
      break;
      
    case ErrorSeverity.MEDIUM:
      // Standard toast notification is enough
      break;
      
    case ErrorSeverity.LOW:
      // Maybe just log it
      break;
  }
}