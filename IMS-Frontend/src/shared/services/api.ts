/**
 * Centralized API Service Layer
 * All HTTP calls to the IMS backend route through this module.
 * 
 * API Communication Structure:
 * - Base client with unified request handling
 * - Modular endpoint organization
 * - Type-safe API calls
 * - Consistent error handling
 */

export * from '../api';
export { apiClient, default } from '../api';

// Legacy exports for backward compatibility
export type { ApiResponse, LoginPayload, BackendUser, LoginResponse } from '../api/auth';
