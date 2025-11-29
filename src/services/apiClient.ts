/**
 * Base API Client
 * Centralized API client with authentication, error handling, and response unwrapping
 * Based on Workdeck API Complete Reference Guide
 */

import { getAuthHeaders, logout } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://test-api.workdeck.com';
const API_TIMEOUT = 15000;

/**
 * Standard API Response Format
 */
export interface ApiResponse<T> {
  status: 'OK' | 'KO' | 'ERROR';
  result: T;
  errors?: ApiError[];
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
}

/**
 * Request options with timeout support
 */
export interface ApiRequestOptions extends RequestInit {
  timeout?: number;
  skipAuth?: boolean;
}

/**
 * Generic API fetch wrapper with auth, timeout, and response unwrapping
 */
export async function apiFetch<T>(
  endpoint: string,
  options?: ApiRequestOptions
): Promise<T> {
  const timeout = options?.timeout ?? API_TIMEOUT;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const fullUrl = `${API_BASE_URL}${endpoint}`;
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

  // Debug logging for POST/PUT/DELETE requests
  const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options?.method || 'GET');
  if (isMutation) {
    console.log(`[API ${requestId}] ${options?.method || 'GET'} ${fullUrl}`);
  }

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    // Add auth headers unless skipped
    if (!options?.skipAuth) {
      const authHeaders = getAuthHeaders();
      Object.assign(headers, authHeaders);
    }

    const response = await fetch(fullUrl, {
      ...options,
      signal: controller.signal,
      headers,
    });

    clearTimeout(timeoutId);

    if (isMutation) {
      console.log(`[API ${requestId}] Response: ${response.status} ${response.statusText}`);
    }

    // Handle HTTP errors
    if (!response.ok) {
      let errorBody = '';
      try {
        errorBody = await response.text();
        if (isMutation) {
          console.error(`[API ${requestId}] Error body:`, errorBody);
        }
      } catch (e) {
        // Ignore parse errors
      }

      // Handle 401 Unauthorized
      if (response.status === 401) {
        logout();
        throw new Error('Unauthorized - Please login again');
      }

      // Try to parse error response
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      try {
        const errorData = JSON.parse(errorBody);
        if (errorData.errors && errorData.errors.length > 0) {
          errorMessage = errorData.errors[0].message || errorMessage;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // Use default error message
      }

      throw new Error(errorMessage);
    }

    const data: ApiResponse<T> = await response.json();

    if (isMutation) {
      console.log(`[API ${requestId}] Response data:`, JSON.stringify(data).substring(0, 500));
    }

    // Handle API-level errors (status: "ERROR" or "KO")
    if (data.status === 'ERROR' || data.status === 'KO') {
      const errorMessage =
        data.errors?.[0]?.message ||
        (typeof data.result === 'string' ? data.result : 'API returned error status');
      console.error(`[API ${requestId}] API Error:`, data);
      throw new Error(errorMessage);
    }

    // Unwrap response.result (standard Workdeck API format)
    if (data.status === 'OK' && data.result !== undefined) {
      return data.result as T;
    }

    // Fallback: return data as-is if it doesn't match expected format
    return data as unknown as T;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    if (isMutation) {
      console.error(`[API ${requestId}] Fetch error:`, error);
    }
    throw error;
  }
}

/**
 * GET request helper
 */
export async function apiGet<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
  return apiFetch<T>(endpoint, { ...options, method: 'GET' });
}

/**
 * POST request helper
 */
export async function apiPost<T>(
  endpoint: string,
  body?: unknown,
  options?: ApiRequestOptions
): Promise<T> {
  return apiFetch<T>(endpoint, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT request helper
 */
export async function apiPut<T>(
  endpoint: string,
  body?: unknown,
  options?: ApiRequestOptions
): Promise<T> {
  return apiFetch<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE request helper
 */
export async function apiDelete<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
  return apiFetch<T>(endpoint, { ...options, method: 'DELETE' });
}

/**
 * Format date to DD/MM/YYYY (Workdeck API format)
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Parse DD/MM/YYYY date string to Date object
 */
export function parseDate(dateString: string): Date {
  const [day, month, year] = dateString.split('/').map(Number);
  return new Date(year, month - 1, day);
}

export { API_BASE_URL };

