/**
 * Centralized API Service Layer
 * All HTTP calls to the IMS backend route through this module.
 */

import apiClient from './client';

export * from './client';
export * from './auth';
export * from './users';
export * from './inventory';
export * from './modules';

// Re-export for convenience
export { apiClient };
export { default as authApi } from './auth';
export { default as usersApi } from './users';
export { default as inventoryApi } from './inventory';
export { 
  requisitionsApi, 
  dispatchApi, 
  procurementApi, 
  maintenanceApi, 
  rolesApi, 
  permissionsApi 
} from './modules';

// Also export all modules as namespace
export * as auth from './auth';
export * as users from './users';
export * as inventory from './inventory';

export default apiClient;
