/**
 * Users API Endpoints
 */
import { apiClient, ApiResponse } from './client';
import { BackendUser } from './auth';

export const usersApi = {
  me: (): Promise<ApiResponse<BackendUser>> => 
    apiClient.get<BackendUser>('/users/profile'),
  
  getAll: (params?: Record<string, string>): Promise<ApiResponse<{ users: BackendUser[]; pagination: any }>> => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiClient.get<{ users: BackendUser[]; pagination: any }>('/users' + qs);
  },
  
  getById: (id: string): Promise<ApiResponse<BackendUser>> => 
    apiClient.get<BackendUser>('/users/' + id),
  
  create: (data: unknown): Promise<ApiResponse<BackendUser>> => 
    apiClient.post<BackendUser>('/users', data),
  
  update: (id: string, data: unknown): Promise<ApiResponse<BackendUser>> => 
    apiClient.patch<BackendUser>('/users/' + id, data),
  
  delete: (id: string): Promise<ApiResponse<void>> => 
    apiClient.delete<void>('/users/' + id),
  
  changePassword: (data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post<{ message: string }>('/users/change-password', data),
  
  getStats: (): Promise<ApiResponse<{ total: number; active: number; inactive: number }>> =>
    apiClient.get<{ total: number; active: number; inactive: number }>('/users/stats'),
  
  getHierarchy: (): Promise<ApiResponse<unknown[]>> => 
    apiClient.get<unknown[]>('/users/hierarchy'),
  
  getSupervisor: (): Promise<ApiResponse<BackendUser | null>> => 
    apiClient.get<BackendUser | null>('/users/supervisor'),
};

export default usersApi;
