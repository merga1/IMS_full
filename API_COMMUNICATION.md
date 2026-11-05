# Addis Mesob IMS - API Communication & System Architecture

## Overview
This document describes the unified API communication contract between `IMS-Frontend` and `IMS_Backend` for the Addis Mesob Inventory Management System.

---

## 1. Frontend API Layer (`IMS-Frontend/src/shared/api/`)

The frontend uses a centralized, type-safe API client built on `fetch`, with automatic bearer token attachment, cookie credential passing, and environment-driven base URL configuration.

### Structure
```
IMS-Frontend/src/shared/api/
├── client.ts        # Base HTTP client (unified request, headers, token storage, error handling)
├── auth.ts          # Authentication endpoints (login, logout, refresh-token)
├── users.ts         # User management, hierarchy, stats, and profile endpoints
├── inventory.ts     # Inventory summary, branch stock, SKU registration, transfer, receive
├── modules.ts       # Requisitions, approvals, dispatch OTP, procurement, maintenance, RBAC
└── index.ts         # Central re-exports & default client instance
```

### Configuration
Configured via `VITE_API_BASE_URL` in `IMS-Frontend/.env`:
- **Local Development**: `VITE_API_BASE_URL=` (defaults to `/api`, proxied via `vite.config.ts` to `http://localhost:3000`)
- **Production (e.g., Netlify)**: `VITE_API_BASE_URL=https://<your-backend-api-domain>/api`

### Usage Example
```typescript
import { authApi, usersApi, inventoryApi, requisitionsApi } from '@/shared/api';

// 1. Authenticate with Fayda ID
const response = await authApi.login({ 
  fayda_id: 'FIN-1000', 
  password: 'Password@123' 
});

// 2. Fetch inventory summary
const inventory = await inventoryApi.getSummary();

// 3. Submit an asset requisition
const requisition = await requisitionsApi.create({
  sku_id: 'SKU-DELL-5420',
  quantity: 1
});
```

---

## 2. Backend Architecture (`IMS_Backend/src/`)

The backend follows the **Controller-Service-Repository** pattern with PostgreSQL (via Prisma ORM) and Redis for high-speed session validation and permission caching.

### Structure
```
IMS_Backend/src/
├── app.js           # Express app setup (Helmet, CORS, parsers, logging, routes, error handler)
├── server.js        # Server entry point (Prisma connect, HTTP listen, graceful shutdown)
├── config/          # Configurations (env validation, db, redis, security, swagger)
├── database/        # Prisma schema, migrations, and permission/user seeds
├── modules/
│   ├── users/       # Auth, Users, Roles, Permissions (controllers, services, repos, DTOs)
│   └── inventory-management/ # Assets, requisitions, dispatch, procurement, maintenance
└── shared/          # Middlewares (auth, authz, error, validation), constants, utils, logger
```

---

## 3. Complete Endpoint Reference Table

| Module | Method | Endpoint | Access / Permission | Purpose |
|---|---|---|---|---|
| **System** | `GET` | `/health` | Public | System status & uptime check |
| **Auth** | `POST` | `/api/auth/login` | Public | Fayda ID login & JWT token issue |
| **Auth** | `POST` | `/api/auth/refresh-token` | Public | Token rotation with reuse detection |
| **Auth** | `POST` | `/api/auth/logout` | Authenticated | Deletes Redis session & clears cookies |
| **Users** | `GET` | `/api/users/profile` | Authenticated | Current user profile details |
| **Users** | `GET` | `/api/users/supervisor` | Authenticated | Designated supervisor for user |
| **Users** | `POST` | `/api/users/change-password` | Authenticated | Update user password |
| **Users** | `GET` | `/api/users` | `USERS.READ` | Paginated users list with search/filters |
| **Users** | `GET` | `/api/users/stats` | `USERS.READ` | Total, active, and inactive user counts |
| **Users** | `GET` | `/api/users/hierarchy` | `USERS.READ` | Organization reporting tree |
| **Users** | `GET` | `/api/users/:id` | `USERS.READ` | Single user details |
| **Users** | `POST` | `/api/users` | `USERS.CREATE` | Create new user |
| **Users** | `PATCH` | `/api/users/:id` | `USERS.UPDATE` | Update user metadata |
| **Users** | `DELETE` | `/api/users/:id` | `USERS.DELETE` | Remove or deactivate user |
| **RBAC** | `GET` | `/api/roles` | `USERS.READ` | List roles and assigned permissions |
| **RBAC** | `POST` | `/api/roles/:id/permissions` | `USERS.UPDATE` | Assign permission codes to role |
| **RBAC** | `GET` | `/api/permissions` | `USERS.READ` | List all granular permission codes |
| **Inventory** | `GET` | `/api/inventory/summary` | Authenticated | Stock summary, counts, category distribution |
| **Inventory** | `GET` | `/api/inventory/branch/:id` | Authenticated | Branch-specific stock list |
| **Inventory** | `POST` | `/api/inventory/register` | Authenticated | Register new SKU or serialized asset |
| **Inventory** | `POST` | `/api/inventory/transfer` | Authenticated | Initiate transfer & issue Gate Pass |
| **Inventory** | `PUT` | `/api/inventory/receive` | Authenticated | Confirm transfer delivery at destination |
| **Requisition** | `POST` | `/api/requests/ask` | Authenticated | Submit request (generates OTP & steps) |
| **Requisition** | `GET` | `/api/requests/my-requests` | Authenticated | Requisitions created by current user |
| **Requisition** | `GET` | `/api/approvals/pending` | Authenticated | Requisitions awaiting user's approval step |
| **Requisition** | `POST` | `/api/approvals/:id/action` | Authenticated | Approve or reject a requisition step |
| **Requisition** | `GET` | `/api/requests/approved-list`| Authenticated | Storekeeper view of fully approved requests |
| **Dispatch** | `POST` | `/api/dispatch/verify-otp` | Authenticated | Verify requester OTP & issue asset |
| **Dispatch** | `POST` | `/api/dispatch/sign` | Authenticated | Store physical receipt signature blob |
| **Dispatch** | `GET` | `/api/dispatch/gate-pass/:id`| Authenticated | Retrieve Gate Pass document |
| **Procurement** | `POST` | `/api/procurement/buy-request`| Authenticated | Trigger Ask-to-Buy on low stock |
| **Procurement** | `POST` | `/api/procurement/gd-approve/:id` | Authenticated | General Director purchase authorization |
| **Procurement** | `GET` | `/api/procurement/pending` | Authenticated | Pending procurement queue for GD |
| **Maintenance** | `POST` | `/api/incidents/report` | Authenticated | Report damage/loss & freeze clearance |
| **Maintenance** | `GET` | `/api/maintenance/queue` | Authenticated | Active maintenance queue |
| **Maintenance** | `PUT` | `/api/maintenance/resolve/:id`| Authenticated | Resolve repair & restore clearance |
| **Maintenance** | `POST` | `/api/maintenance/scrap/:id` | Authenticated | Mark asset as unrepairable/scrapped |
| **Docs** | `GET` | `/docs/inventory` | Public | Interactive Swagger API Documentation |
