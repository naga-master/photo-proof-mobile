import { AxiosError } from 'axios';
import type { ErrorInfo } from '@/components/common/ErrorState';

export class ApiError extends Error {
  code: number;
  type: ErrorInfo['type'];
  userMessage: string;

  constructor(message: string, code: number, type: ErrorInfo['type'], userMessage: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.type = type;
    this.userMessage = userMessage;
  }
}

export function handleApiError(error: any): ErrorInfo {
  // Network errors
  if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
    return {
      type: 'network',
      message: 'Unable to connect. Please check your internet connection and try again.',
    };
  }

  // Axios errors with response
  if (error.response) {
    const status = error.response.status;
    
    switch (status) {
      case 400:
        return {
          type: 'unknown',
          message: error.response.data?.detail || 'Invalid request. Please check your input.',
          code: 400,
        };
      
      case 401:
        return {
          type: 'unauthorized',
          message: 'Your session has expired. Please log in again.',
          code: 401,
        };
      
      case 403:
        return {
          type: 'unauthorized',
          message: 'You don\'t have permission to access this resource.',
          code: 403,
        };
      
      case 404:
        return {
          type: 'not_found',
          message: error.response.data?.detail || 'The requested resource was not found.',
          code: 404,
        };
      
      case 500:
      case 502:
      case 503:
        return {
          type: 'server',
          message: 'Server error. Our team has been notified. Please try again later.',
          code: status,
        };
      
      default:
        return {
          type: 'unknown',
          message: error.response.data?.detail || `An error occurred (${status}). Please try again.`,
          code: status,
        };
    }
  }

  // Request timeout
  if (error.code === 'ECONNABORTED') {
    return {
      type: 'network',
      message: 'Request timed out. Please check your connection and try again.',
    };
  }

  // Unknown errors
  return {
    type: 'unknown',
    message: error.message || 'An unexpected error occurred. Please try again.',
  };
}

export function isNetworkError(error: any): boolean {
  return error.message === 'Network Error' || error.code === 'ECONNABORTED';
}

export function isAuthError(error: any): boolean {
  return error.response?.status === 401 || error.response?.status === 403;
}

export function isNotFoundError(error: any): boolean {
  return error.response?.status === 404;
}

export function isServerError(error: any): boolean {
  const status = error.response?.status;
  return status >= 500 && status < 600;
}
