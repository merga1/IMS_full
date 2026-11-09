# Inventory Management System — Backend

Node.js + Express 5 REST API for authentication, roles and permissions, inventory, requisitions and
multi-step approvals, OTP dispatch, procurement, and maintenance/incident handling.
PostgreSQL is accessed through Prisma; Redis stores login sessions.

## Quick start

```bash
npm install
cp .env.example .env        # then fill in DATABASE_URL and the two JWT secrets
npm run generate            # generate the Prisma client
npm run db:push             # create the tables (development)
npm run seed                # permissions, roles, branches, demo users (needs SEED_DEFAULT_PASSWORD)
npm run dev                 # nodemon  (or: npm start)
```

| URL | Purpose |
| --- | --- |
| `http://localhost:3000/health` | Liveness check |
| `http://localhost:3000/api/...` | All API routes |
| `http://localhost:3000/docs/inventory/` | Swagger UI (OpenAPI JSON at `/docs/inventory/json`) |

## Project layout

```
src/
  server.js                      entry point: DB connect, listen, graceful shutdown
  app.js                         Express app: middleware, /api routers, docs, 404 + error handler
  config/                        env.js, db.js (Prisma logging), redis.js, swagger.js
  database/
    index.js                     single PrismaClient instance
    prisma/schema.prisma         data model
    prisma/seeds/                permissionSeeder.js
  modules/
    users/                       auth, users, roles, permissions
      routes/  controllers/  services/  repositories/  validators/  dto/
    inventory-management/        inventory, requisitions, dispatch, procurement, maintenance
      routes/  controllers/  services/  repositories/  validators.js
  shared/
    middleware/                  authentication, authorization, validation, errorHandler
    constants/                   permissions.js (codes, role->permission map), prismaSelects.js
    services/audit/              auditService.js
    utils/                       asyncHandler, errors, logger, responses, tokens
```

Request flow: `route -> authenticate -> requirePermission -> validate (Joi) -> controller -> service -> repository -> Prisma -> PostgreSQL`.
