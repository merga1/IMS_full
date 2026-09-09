/**
 * Centralized API Service Layer
 * All HTTP calls to the IMS backend route through this module.
 * The Vite proxy forwards /api/* to http://localhost:3000/api/*
 */

const BASE = '/api';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
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

export interface LoginPayload {
  fayda_id: string;
  password: string;
}

export interface LoginResponse {
  user: BackendUser;
  role_rank: number;
  token: string;
}

// ─── Core Fetch Helper ────────────────────────────────────────────────────────

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  let json: any;
  try {
    json = await response.json();
  } catch {
    throw new Error(response.status + ': ' + response.statusText);
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

// ─── Auth Endpoints ───────────────────────────────────────────────────────────

export const authApi = {
  login: (payload: LoginPayload) =>
    request<LoginResponse>('POST', '/auth/login', payload),
  logout: () =>
    request<null>('POST', '/auth/logout'),
  refreshToken: () =>
    request<null>('POST', '/auth/refresh-token'),
};

// ─── User Endpoints ───────────────────────────────────────────────────────────

export const usersApi = {
  me: () => request<BackendUser>('GET', '/users/profile'),
  getAll: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<{ users: BackendUser[]; pagination: any }>('GET', '/users' + qs);
  },
  getById: (id: string) => request<BackendUser>('GET', '/users/' + id),
  create: (data: unknown) => request<BackendUser>('POST', '/users', data),
  update: (id: string, data: unknown) => request<BackendUser>('PATCH', '/users/' + id, data),
  delete: (id: string) => request<void>('DELETE', '/users/' + id),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    request<{ message: string }>('POST', '/users/change-password', data),
  getStats: () =>
    request<{ total: number; active: number; inactive: number }>('GET', '/users/stats'),
  getHierarchy: () => request<unknown[]>('GET', '/users/hierarchy'),
  getSupervisor: () => request<BackendUser | null>('GET', '/users/supervisor'),
};

// ─── Inventory Endpoints ──────────────────────────────────────────────────────

export const inventoryApi = {
  getSummary: () => request<unknown>('GET', '/inventory/summary'),
  getByBranch: (id: string | number) => request<unknown>('GET', '/inventory/branch/' + id),
  register: (data: unknown) => request<unknown>('POST', '/inventory/register', data),
  transfer: (data: unknown) => request<unknown>('POST', '/inventory/transfer', data),
  receive: (data: unknown) => request<unknown>('PUT', '/inventory/receive', data),
};

// ─── Requisition Endpoints ────────────────────────────────────────────────────

export const requisitionsApi = {
  create: (data: unknown) => request<unknown>('POST', '/requests/ask', data),
  myRequests: () => request<unknown[]>('GET', '/requests/my-requests'),
  approvedList: () => request<unknown[]>('GET', '/requests/approved-list'),
  pendingApprovals: () => request<unknown[]>('GET', '/approvals/pending'),
  action: (id: string, data: { action: 'APPROVE' | 'REJECT'; comments?: string }) =>
    request<unknown>('POST', '/approvals/' + id + '/action', data),
};

// ─── Dispatch Endpoints ───────────────────────────────────────────────────────

export const dispatchApi = {
  verifyOtp: (data: unknown) => request<unknown>('POST', '/dispatch/verify-otp', data),
  notify: (data: unknown) => request<unknown>('POST', '/dispatch/notify', data),
  getGatePass: (id: string) => request<unknown>('GET', '/dispatch/gate-pass/' + id),
  sign: (data: unknown) => request<unknown>('POST', '/dispatch/sign', data),
};

// ─── Procurement Endpoints ────────────────────────────────────────────────────

export const procurementApi = {
  buyRequest: (data: unknown) => request<unknown>('POST', '/procurement/buy-request', data),
  gdApprove: (id: string, data: unknown) =>
    request<unknown>('POST', '/procurement/gd-approve/' + id, data),
  pending: () => request<unknown[]>('GET', '/procurement/pending'),
};

// ─── Maintenance Endpoints ────────────────────────────────────────────────────

export const maintenanceApi = {
  report: (data: unknown) => request<unknown>('POST', '/incidents/report', data),
  queue: () => request<unknown[]>('GET', '/maintenance/queue'),
  resolve: (id: string, data: unknown) =>
    request<unknown>('PUT', '/maintenance/resolve/' + id, data),
  scrap: (id: string, data?: unknown) =>
    request<unknown>('POST', '/maintenance/scrap/' + id, data),
};

// ─── Role & Permission Endpoints ──────────────────────────────────────────────

export const rolesApi = {
  getAll: () => request<unknown[]>('GET', '/roles'),
  getById: (id: string) => request<unknown>('GET', '/roles/' + id),
  create: (data: unknown) => request<unknown>('POST', '/roles', data),
  update: (id: string, data: unknown) => request<unknown>('PATCH', '/roles/' + id, data),
  delete: (id: string) => request<void>('DELETE', '/roles/' + id),
  assignPermissions: (id: string, permissionIds: number[]) =>
    request<unknown>('POST', '/roles/' + id + '/permissions', { permissionIds }),
  removePermissions: (id: string, permissionIds: number[]) =>
    request<unknown>('DELETE', '/roles/' + id + '/permissions', { permissionIds }),
};

export const permissionsApi = {
  getAll: () => request<unknown[]>('GET', '/permissions'),
  getByModule: (module: string) => request<unknown[]>('GET', '/permissions/module/' + module),
  create: (data: unknown) => request<unknown>('POST', '/permissions', data),
  bulkCreate: (data: unknown[]) => request<unknown>('POST', '/permissions/bulk', data),
  delete: (id: string) => request<void>('DELETE', '/permissions/' + id),
};
