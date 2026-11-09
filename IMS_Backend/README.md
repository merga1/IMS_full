# Inventory Management System Backend

Node.js and Express REST API for authentication, role permissions, inventory, requisitions, approvals, dispatch, procurement, and maintenance. PostgreSQL is accessed through Prisma; Redis stores login sessions.

The full architecture explanation, main code guide, API route table, library descriptions, local setup steps, and presentation script are in [BACKEND_PRESENTATION_GUIDE.md](./BACKEND_PRESENTATION_GUIDE.md).

## Quick start

1. Run `npm install`.
2. Copy `.env.example` to `.env` and set the database URL, JWT secrets, and allowed browser origins.
3. Sync a development database with `npm run db:push` or create/apply a migration with `npm run migrate`.
4. Run `npm run generate` after schema changes.
5. Start the server using `npm run dev` or `npm start`.

The API is mounted under `/api`; health is at `/health` and Swagger UI is at `/docs/inventory/`. See the presentation guide before seeding demo users or deploying because the seed password and database migration history require setup.
