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

  constructor(baseURL: string = BASE_URL) {
    this.baseURL = baseURL;
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

    const response = await fetch(${this.baseURL}, {
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
      throw new Error(${response.status}: );
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
