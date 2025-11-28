/**
 * Authentication Service
 * Handles login, logout, OAuth, and token management for Workdeck
 *
 * API Endpoints (from existing Angular implementation):
 * - POST /auth/login - Email/password login
 * - GET /auth/google - Google OAuth redirect
 * - GET /auth/microsoft - Microsoft OAuth redirect
 * - GET /queries/me - Get current user
 * - POST /auth/reset/:token - Reset password
 * - POST /commands/sync/forgot-password - Forgot password
 */

const API_URL = import.meta.env.VITE_API_URL || 'https://api.workdeck.com';

// Storage keys (matching existing Angular implementation)
const TOKEN_KEY = 'api-token';
const USER_KEY = 'user';
const CSRF_KEY = 'csrf-token';
const RESTRICTIONS_KEY = 'restrictions';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  language?: {
    code: string;
  };
  role?: string;
  companyId?: string;
}

export interface LoginResponse {
  token?: string;
  error?: string;
  result?: {
    code: string;
    message: string;
  };
}

export interface AuthError {
  code: string;
  message: string;
}

/**
 * Get the stored API token
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Get the raw token (without Bearer prefix)
 */
export function getRawToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token && token.startsWith('Bearer ')) {
    return token.slice(7);
  }
  return token;
}

/**
 * Set the API token (adds Bearer prefix as per existing implementation)
 */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, `Bearer ${token}`);
}

/**
 * Get the stored user
 */
export function getStoredUser(): User | null {
  const userJson = localStorage.getItem(USER_KEY);
  if (userJson) {
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Set the stored user
 */
export function setStoredUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}

/**
 * Create authorization headers for API requests
 */
export function getAuthHeaders(): HeadersInit {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = token;
  }
  return headers;
}

/**
 * Authenticate user with email and password
 * Matches existing Angular: POST /auth/login with { mail, password, remember }
 */
export async function login(
  email: string,
  password: string,
  remember: boolean = false
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mail: email, // API expects 'mail' not 'email'
        password,
        remember,
      }),
    });

    const data: LoginResponse = await response.json();

    if (!response.ok) {
      const errorMessage = data.result?.message || data.error || 'Login failed';
      return { success: false, error: errorMessage };
    }

    if (data.token) {
      // Store the token
      setToken(data.token);

      // Fetch user data
      const user = await fetchCurrentUser();
      if (user) {
        setStoredUser(user);
        return { success: true, user };
      }
      return { success: true };
    }

    return { success: false, error: 'No token received' };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

/**
 * Fetch current user data
 * Matches existing Angular: GET /queries/me
 */
export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch(`${API_URL}/queries/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token is invalid, clean up
        logout();
      }
      return null;
    }

    const user: User = await response.json();
    return user;
  } catch (error) {
    console.error('Fetch user error:', error);
    return null;
  }
}

/**
 * Initiate Google OAuth login
 * Redirects to API which handles OAuth flow
 */
export function loginWithGoogle(remember: boolean = false): void {
  let url = `${API_URL}/auth/google`;
  if (remember) {
    url += '?remember=true';
  }
  window.location.href = url;
}

/**
 * Initiate Microsoft OAuth login
 * Redirects to API which handles OAuth flow
 */
export function loginWithMicrosoft(remember: boolean = false): void {
  let url = `${API_URL}/auth/microsoft`;
  if (remember) {
    url += '?remember=true';
  }
  window.location.href = url;
}

/**
 * Handle OAuth callback (when redirected back from OAuth provider)
 * The token should be in the URL query params
 */
export function handleOAuthCallback(): { success: boolean; token?: string; error?: string } {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const error = urlParams.get('error');

  if (error) {
    return { success: false, error };
  }

  if (token) {
    setToken(token);
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
    return { success: true, token };
  }

  return { success: false, error: 'No token received' };
}

/**
 * Request password reset email
 * Matches existing Angular: POST /commands/sync/forgot-password
 */
export async function forgotPassword(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/commands/sync/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const data = await response.json();
      return { success: false, error: data.message || 'Failed to send reset email' };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

/**
 * Reset password with token
 * Matches existing Angular: POST /auth/reset/:token
 */
export async function resetPassword(
  token: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/auth/reset/${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const data = await response.json();
      return { success: false, error: data.message || 'Failed to reset password' };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

/**
 * Verify reset token is valid
 * Matches existing Angular: POST /auth/reset/:token (without password)
 */
export async function verifyResetToken(token: string): Promise<{ valid: boolean }> {
  try {
    const response = await fetch(`${API_URL}/auth/reset/${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return { valid: response.ok };
  } catch {
    return { valid: false };
  }
}

/**
 * Update user password (when already logged in)
 * Matches existing Angular: POST /auth/update-password
 */
export async function updatePassword(
  oldPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/auth/update-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    if (!response.ok) {
      const data = await response.json();
      return { success: false, error: data.message || 'Failed to update password' };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

/**
 * Logout - clear all stored auth data
 * Matches existing Angular webStorage.clean()
 */
export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(CSRF_KEY);
  localStorage.removeItem(RESTRICTIONS_KEY);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
