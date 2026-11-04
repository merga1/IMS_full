/**
 * Authentication API Endpoints
 */
import { apiClient, ApiResponse } from './client';

export interface LoginPayload {
  fayda_id: string;
  password: string;
}

export interface BackendUser {
  user_id: string;
  fayda_id: string;
  full_name: string;
  email: string;
  role: {
    role_id: number;
    role_name: string;
    role_rank: number;
    permissions: { code: string; module: string }[];
  };
  branch?: { branch_id: number; branch_name: string; type: string } | null;
  user_type: 'EMPLOYEE' | 'THIRD_PARTY';
  is_suspended_from_clearance: boolean;
}

export interface LoginResponse {
  user: BackendUser;
  role_rank: number;
  token: string;
}

export const authApi = {
  login: (payload: LoginPayload): Promise<ApiResponse<LoginResponse>> =>
    apiClient.post<LoginResponse>('/auth/login', payload),
  
  logout: (): Promise<ApiResponse<null>> =>
    apiClient.post<null>('/auth/logout'),
  
  refreshToken: (): Promise<ApiResponse<null>> =>
    apiClient.post<null>('/auth/refresh-token'),
};

export default authApi;
