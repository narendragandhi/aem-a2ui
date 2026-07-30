/**
 * Centralized error handling service
 * Provides user-friendly error messages and recovery suggestions
 */

import { logger } from './logger.js';

export interface AppError {
  code: string;
  message: string;
  userMessage: string;
  suggestion?: string;
  retryable: boolean;
  originalError?: unknown;
}

export type ErrorCode =
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'AUTH_ERROR'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'TIMEOUT'
  | 'AI_ERROR'
  | 'AEM_CONNECTION_ERROR'
  | 'UNKNOWN_ERROR';

const ERROR_MESSAGES: Record<ErrorCode, { userMessage: string; suggestion: string }> = {
  NETWORK_ERROR: {
    userMessage: 'Unable to connect to the server',
    suggestion: 'Check your internet connection and try again',
  },
  SERVER_ERROR: {
    userMessage: 'Something went wrong on our end',
    suggestion: 'Please try again in a few moments',
  },
  AUTH_ERROR: {
    userMessage: 'Authentication failed',
    suggestion: 'Please check your credentials and try again',
  },
  VALIDATION_ERROR: {
    userMessage: 'Invalid input provided',
    suggestion: 'Please check your input and try again',
  },
  NOT_FOUND: {
    userMessage: 'The requested resource was not found',
    suggestion: 'The item may have been moved or deleted',
  },
  TIMEOUT: {
    userMessage: 'The request took too long',
    suggestion: 'Try again or use a simpler prompt',
  },
  AI_ERROR: {
    userMessage: 'AI generation failed',
    suggestion: 'Try a different prompt or check if AI service is running',
  },
  AEM_CONNECTION_ERROR: {
    userMessage: 'Cannot connect to AEM',
    suggestion: 'Ensure AEM SDK is running on localhost:4502',
  },
  UNKNOWN_ERROR: {
    userMessage: 'An unexpected error occurred',
    suggestion: 'Please try again or contact support',
  },
};

class ErrorHandler {
  private errorListeners: Set<(error: AppError) => void> = new Set();

  /**
   * Parse an error into a standardized AppError
   */
  parse(error: unknown, context?: string): AppError {
    // Log the original error
    logger.error('Error occurred', context, error);

    // HTTP Response errors
    if (error instanceof Response) {
      return this.parseHttpError(error);
    }

    // Fetch errors (network issues)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return this.createError('NETWORK_ERROR', error.message, error);
    }

    // Standard Error objects
    if (error instanceof Error) {
      return this.parseErrorObject(error);
    }

    // String errors
    if (typeof error === 'string') {
      return this.createError('UNKNOWN_ERROR', error);
    }

    // Unknown errors
    return this.createError('UNKNOWN_ERROR', 'An unknown error occurred', error);
  }

  private parseHttpError(response: Response): AppError {
    const status = response.status;

    if (status === 401 || status === 403) {
      return this.createError('AUTH_ERROR', `HTTP ${status}`, response);
    }

    if (status === 404) {
      return this.createError('NOT_FOUND', `HTTP ${status}`, response);
    }

    if (status === 422 || status === 400) {
      return this.createError('VALIDATION_ERROR', `HTTP ${status}`, response);
    }

    if (status >= 500) {
      return this.createError('SERVER_ERROR', `HTTP ${status}`, response);
    }

    return this.createError('UNKNOWN_ERROR', `HTTP ${status}`, response);
  }

  private parseErrorObject(error: Error): AppError {
    const message = error.message.toLowerCase();

    if (message.includes('timeout') || message.includes('aborted')) {
      return this.createError('TIMEOUT', error.message, error);
    }

    if (message.includes('network') || message.includes('fetch')) {
      return this.createError('NETWORK_ERROR', error.message, error);
    }

    if (message.includes('ai') || message.includes('llm') || message.includes('ollama')) {
      return this.createError('AI_ERROR', error.message, error);
    }

    if (message.includes('aem') || message.includes('4502')) {
      return this.createError('AEM_CONNECTION_ERROR', error.message, error);
    }

    return this.createError('UNKNOWN_ERROR', error.message, error);
  }

  private createError(code: ErrorCode, message: string, originalError?: unknown): AppError {
    const errorInfo = ERROR_MESSAGES[code];
    return {
      code,
      message,
      userMessage: errorInfo.userMessage,
      suggestion: errorInfo.suggestion,
      retryable: ['NETWORK_ERROR', 'SERVER_ERROR', 'TIMEOUT', 'AI_ERROR'].includes(code),
      originalError,
    };
  }

  /**
   * Subscribe to error events
   */
  onError(callback: (error: AppError) => void): () => void {
    this.errorListeners.add(callback);
    return () => this.errorListeners.delete(callback);
  }

  /**
   * Notify all listeners of an error
   */
  notify(error: AppError): void {
    this.errorListeners.forEach((listener) => listener(error));
  }

  /**
   * Handle and notify error in one call
   */
  handle(error: unknown, context?: string): AppError {
    const appError = this.parse(error, context);
    this.notify(appError);
    return appError;
  }
}

export const errorHandler = new ErrorHandler();

/**
 * Wrapper for async operations with error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: string,
): Promise<{ data?: T; error?: AppError }> {
  try {
    const data = await operation();
    return { data };
  } catch (error) {
    const appError = errorHandler.parse(error, context);
    return { error: appError };
  }
}

/**
 * Retry wrapper for retryable operations
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: { maxRetries?: number; delay?: number; context?: string } = {},
): Promise<T> {
  const { maxRetries = 3, delay = 1000, context } = options;
  let lastError: AppError | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = errorHandler.parse(error, context);

      if (!lastError.retryable || attempt === maxRetries) {
        throw lastError;
      }

      logger.warn(`Retry attempt ${attempt}/${maxRetries}`, context);
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError;
}
