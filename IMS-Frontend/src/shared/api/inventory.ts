/**
 * Inventory API Endpoints
 */
import { apiClient, ApiResponse } from './client';

export const inventoryApi = {
  getSummary: (): Promise<ApiResponse<unknown>> => 
    apiClient.get<unknown>('/inventory/summary'),
  
  getByBranch: (id: string | number): Promise<ApiResponse<unknown>> => 
    apiClient.get<unknown>('/inventory/branch/' + id),
  
  register: (data: unknown): Promise<ApiResponse<unknown>> => 
    apiClient.post<unknown>('/inventory/register', data),
  
  transfer: (data: unknown): Promise<ApiResponse<unknown>> => 
    apiClient.post<unknown>('/inventory/transfer', data),
  
  receive: (data: unknown): Promise<ApiResponse<unknown>> => 
    apiClient.put<unknown>('/inventory/receive', data),
};

export default inventoryApi;
