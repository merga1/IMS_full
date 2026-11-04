/**
 * Additional API Endpoints
 */
import { apiClient, ApiResponse } from './client';

export const requisitionsApi = {
  create: (data: unknown): Promise<ApiResponse<unknown>> => 
    apiClient.post<unknown>('/requests/ask', data),
  myRequests: (): Promise<ApiResponse<unknown[]>> => 
    apiClient.get<unknown[]>('/requests/my-requests'),
  approvedList: (): Promise<ApiResponse<unknown[]>> => 
    apiClient.get<unknown[]>('/requests/approved-list'),
  pendingApprovals: (): Promise<ApiResponse<unknown[]>> => 
    apiClient.get<unknown[]>('/approvals/pending'),
  action: (id: string, data: { action: 'APPROVE' | 'REJECT'; comments?: string }): Promise<ApiResponse<unknown>> =>
    apiClient.post<unknown>('/approvals/' + id + '/action', data),
};

export const dispatchApi = {
  verifyOtp: (data: unknown): Promise<ApiResponse<unknown>> => 
    apiClient.post<unknown>('/dispatch/verify-otp', data),
  notify: (data: unknown): Promise<ApiResponse<unknown>> => 
    apiClient.post<unknown>('/dispatch/notify', data),
  getGatePass: (id: string): Promise<ApiResponse<unknown>> => 
    apiClient.get<unknown>('/dispatch/gate-pass/' + id),
  sign: (data: unknown): Promise<ApiResponse<unknown>> => 
    apiClient.post<unknown>('/dispatch/sign', data),
};

export const procurementApi = {
  buyRequest: (data: unknown): Promise<ApiResponse<unknown>> => 
    apiClient.post<unknown>('/procurement/buy-request', data),
  gdApprove: (id: string, data: unknown): Promise<ApiResponse<unknown>> =>
    apiClient.post<unknown>('/procurement/gd-approve/' + id, data),
  pending: (): Promise<ApiResponse<unknown[]>> => 
    apiClient.get<unknown[]>('/procurement/pending'),
};

export const maintenanceApi = {
  report: (data: unknown): Promise<ApiResponse<unknown>> => 
    apiClient.post<unknown>('/incidents/report', data),
  queue: (): Promise<ApiResponse<unknown[]>> => 
    apiClient.get<unknown[]>('/maintenance/queue'),
  resolve: (id: string, data: unknown): Promise<ApiResponse<unknown>> =>
    apiClient.put<unknown>('/maintenance/resolve/' + id, data),
  scrap: (id: string, data?: unknown): Promise<ApiResponse<unknown>> =>
    apiClient.post<unknown>('/maintenance/scrap/' + id, data),
};

export const rolesApi = {
  getAll: (): Promise<ApiResponse<unknown[]>> => 
    apiClient.get<unknown[]>('/roles'),
  getById: (id: string): Promise<ApiResponse<unknown>> => 
    apiClient.get<unknown>('/roles/' + id),
  create: (data: unknown): Promise<ApiResponse<unknown>> => 
    apiClient.post<unknown>('/roles', data),
  update: (id: string, data: unknown): Promise<ApiResponse<unknown>> => 
    apiClient.patch<unknown>('/roles/' + id, data),
  delete: (id: string): Promise<ApiResponse<void>> => 
    apiClient.delete<void>('/roles/' + id),
  assignPermissions: (id: string, permissionIds: number[]): Promise<ApiResponse<unknown>> =>
    apiClient.post<unknown>('/roles/' + id + '/permissions', { permissionIds }),
  removePermissions: (id: string, permissionIds: number[]): Promise<ApiResponse<unknown>> =>
    apiClient.delete<unknown>('/roles/' + id + '/permissions', { permissionIds }),
};

export const permissionsApi = {
  getAll: (): Promise<ApiResponse<unknown[]>> => 
    apiClient.get<unknown[]>('/permissions'),
  getByModule: (module: string): Promise<ApiResponse<unknown[]>> => 
    apiClient.get<unknown[]>('/permissions/module/' + module),
  create: (data: unknown): Promise<ApiResponse<unknown>> => 
    apiClient.post<unknown>('/permissions', data),
  bulkCreate: (data: unknown[]): Promise<ApiResponse<unknown>> => 
    apiClient.post<unknown>('/permissions/bulk', data),
  delete: (id: string): Promise<ApiResponse<void>> => 
    apiClient.delete<void>('/permissions/' + id),
};
