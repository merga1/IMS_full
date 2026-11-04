# API Communication Documentation

## Overview
This document describes the API communication structure for the IMS (Inventory Management System).

## Frontend API Layer
Location: IMS-Frontend/src/shared/api/

### Structure
`
shared/api/
├── client.ts      # Base HTTP client with unified request handling
├── auth.ts        # Authentication endpoints
├── users.ts       # User management endpoints
├── inventory.ts   # Inventory management endpoints
├── modules.ts     # Additional endpoints (requisitions, dispatch, etc.)
└── index.ts       # Central exports
`

### Usage

`	ypescript
import { authApi, usersApi, inventoryApi } from '@/shared/api';

// Login
const response = await authApi.login({ fayda_id: 'FIN-1000', password: 'password' });

// Get users
const users = await usersApi.getAll();
`

### Configuration
API base URL is configured via environment variable:
- VITE_API_BASE_URL - Base URL for API requests (defaults to /api in development with Vite proxy)

## Backend API
Location: IMS_Backend/src/

### Structure
`
src/
├── app.js         # Express app configuration
├── server.js      # Server entry point
├── config/        # Configuration (env, db, etc.)
├── modules/       # Feature modules (users, inventory, etc.)
├── shared/        # Shared utilities, middleware
└── database/      # Prisma schema and migrations
`

### API Routes
All API routes are prefixed with /api

- Health check: GET /health
- Auth: /api/auth/* (mounted via user module)
- Users: /api/users/*
- Inventory: /api/inventory/*
- Documentation: /docs/inventory

### Environment Variables
Backend requires .env file in IMS_Backend/ directory with:
- DATABASE_URL - PostgreSQL connection string
- JWT_SECRET - JWT signing secret
- JWT_REFRESH_SECRET - Refresh token secret
- PORT - Server port (default: 3000)
- CORS_ORIGIN - Allowed origins
