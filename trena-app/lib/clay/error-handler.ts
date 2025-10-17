import { ClayApiError, ClayApiErrorType, ClayApiResponse } from './types';

/**
 * Clay.com API Error Handler
 * Provides comprehensive error handling and classification
 */
export class ClayErrorHandler {
  /**
   * Handle API errors with appropriate fallbacks
   */
  handleError(error: unknown, context: string): ClayApiResponse<never> {
    console.error(`Clay.com API Error in ${context}:`, error);

    if (error instanceof ClayApiError) {
      return this.handleApiError(error, context);
    } else if (error instanceof Error) {
      return this.handleGenericError(error, context);
    } else {
      return this.handleUnknownError(error, context);
    }
  }

  /**
   * Handle known Clay.com API errors
   */
  private handleApiError(error: ClayApiError, context: string): ClayApiResponse<never> {
    switch (error.type) {
      case 'RATE_LIMIT':
        return {
          success: false,
          error: `Rate limit exceeded. Please wait before retrying. (${context})`,
        };

      case 'AUTHENTICATION':
        return {
          success: false,
          error: 'Authentication failed. Please check your Clay.com API key.',
        };

      case 'INVALID_REQUEST':
        return {
          success: false,
          error: `Invalid request: ${error.message}`,
        };

      case 'QUOTA_EXCEEDED':
        return {
          success: false,
          error: 'API quota exceeded. Please upgrade your Clay.com plan or try again later.',
        };

      default:
        return {
          success: false,
          error: `API error: ${error.message}`,
        };
    }
  }

  /**
   * Handle generic JavaScript errors
   */
  private handleGenericError(error: Error, context: string): ClayApiResponse<never> {
    console.error(`Generic error in ${context}:`, error);

    // Check for common network errors
    if (error.message.includes('fetch')) {
      return {
        success: false,
        error: 'Network error. Please check your internet connection and try again.',
      };
    }

    if (error.message.includes('timeout')) {
      return {
        success: false,
        error: 'Request timeout. Please try again.',
      };
    }

    return {
      success: false,
      error: `An error occurred: ${error.message}`,
    };
  }

  /**
   * Handle unknown error types
   */
  private handleUnknownError(error: unknown, context: string): ClayApiResponse<never> {
    console.error(`Unknown error in ${context}:`, error);

    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }

  /**
   * Create a ClayApiError from HTTP response
   */
  static createFromResponse(status: number, responseText: string): ClayApiError {
    let type: ClayApiErrorType = 'UNKNOWN';
    let message = 'Unknown error occurred';

    // Parse error response if possible
    try {
      const errorData = JSON.parse(responseText);
      message = errorData.message || errorData.error || message;
    } catch {
      message = responseText || message;
    }

    // Classify error based on HTTP status
    switch (status) {
      case 401:
      case 403:
        type = 'AUTHENTICATION';
        message = 'Authentication failed. Please check your API key.';
        break;

      case 429:
        type = 'RATE_LIMIT';
        message = 'Rate limit exceeded. Please wait before retrying.';
        break;

      case 400:
        type = 'INVALID_REQUEST';
        break;

      case 402:
        type = 'QUOTA_EXCEEDED';
        message = 'API quota exceeded. Please upgrade your plan.';
        break;

      case 500:
      case 502:
      case 503:
      case 504:
        message = 'Service temporarily unavailable. Please try again later.';
        break;

      default:
        if (status >= 400 && status < 500) {
          type = 'INVALID_REQUEST';
        } else if (status >= 500) {
          message = 'Service error. Please try again later.';
        }
    }

    return new ClayApiError(message, type, status, responseText);
  }

  /**
   * Get user-friendly error suggestions
   */
  static getErrorSuggestions(error: ClayApiError): string[] {
    switch (error.type) {
      case 'RATE_LIMIT':
        return [
          'Wait a few minutes before trying again',
          'Consider upgrading your Clay.com plan for higher limits',
          'Use cached results when available',
        ];

      case 'AUTHENTICATION':
        return [
          'Check your Clay.com API key configuration',
          'Ensure your API key is active and valid',
          'Contact Clay.com support if the issue persists',
        ];

      case 'INVALID_REQUEST':
        return [
          'Check your search parameters',
          'Try broadening your search criteria',
          'Verify all required fields are provided',
        ];

      case 'QUOTA_EXCEEDED':
        return [
          'Upgrade your Clay.com plan for more API credits',
          'Wait for your quota to reset (monthly/daily)',
          'Use mock data for development and testing',
        ];

      default:
        return [
          'Try again in a few moments',
          'Check your internet connection',
          'Contact support if the issue persists',
        ];
    }
  }
}


/**
 * Error recovery strategies
 */
export class ClayErrorRecovery {
  /**
   * Attempt to recover from rate limit errors
   */
  static async handleRateLimit(error: ClayApiError): Promise<{
    shouldRetry: boolean;
    waitTime?: number;
    fallbackStrategy?: string;
  }> {
    if (error.type !== 'RATE_LIMIT') {
      return { shouldRetry: false };
    }

    // Extract retry-after header if available
    const waitTime = this.extractRetryAfter(error);
    
    return {
      shouldRetry: true,
      waitTime: waitTime || 30000, // Default 30 seconds
      fallbackStrategy: 'use-mock-data'
    };
  }

  /**
   * Extract retry-after time from error response
   */
  private static extractRetryAfter(error: ClayApiError): number | null {
    if (error.response && typeof error.response === 'object') {
      const response = error.response as any;
      return response.retryAfter || response['retry-after'] || null;
    }
    return null;
  }

  /**
   * Determine if mock data fallback should be used
   */
  static shouldUseMockData(error: ClayApiError): boolean {
    const mockDataErrors: ClayApiErrorType[] = [
      'QUOTA_EXCEEDED',
      'AUTHENTICATION',
      'UNKNOWN'
    ];

    return mockDataErrors.includes(error.type);
  }
}