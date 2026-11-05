/**
 * Base API Client
 * Centralized HTTP client for all API communications
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = BASE_URL) {
    this.baseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('ims_access_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('ims_access_token', token);
      } else {
        localStorage.removeItem('ims_access_token');
      }
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('ims_access_token');
    }
    return this.token;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string>),
    };

    const token = this.getToken();
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = `${this.baseURL}${cleanPath}`;

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
      ...options,
    });

    let json: any;
    try {
      json = await response.json();
    } catch {
      throw new Error(`${response.status}: ${response.statusText}`);
    }

    if (!response.ok) {
      const msg = json?.message || response.statusText;
      const err = new Error(msg) as any;
      err.statusCode = response.status;
      err.data = json;
      throw err;
    }

    return json as ApiResponse<T>;
  }

  get<T>(path: string, options?: RequestInit) {
    return this.request<T>('GET', path, undefined, options);
  }

  post<T>(path: string, body?: unknown, options?: RequestInit) {
    return this.request<T>('POST', path, body, options);
  }

  put<T>(path: string, body?: unknown, options?: RequestInit) {
    return this.request<T>('PUT', path, body, options);
  }

  patch<T>(path: string, body?: unknown, options?: RequestInit) {
    return this.request<T>('PATCH', path, body, options);
  }

  delete<T>(path: string, body?: unknown, options?: RequestInit) {
    return this.request<T>('DELETE', path, body, options);
  }
}

export const apiClient = new ApiClient();
export default apiClient;
