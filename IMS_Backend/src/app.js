import compression from 'compression';
import cors from 'cors';
import express, { json, urlencoded, Router } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { cors as corsConfig, env } from './config/env.js';
// NOTE: We use default import here because errorHandler was exported as default

import userRouter from './modules/users/routes/index.js';
import inventoryRouter from './modules/inventory-management/routes/index.js';
import inventoryDocsRouter from './modules/inventory-management/routes/inventory.routes.js';
import errorHandler from './shared/middleware/errorHandler.js';
// import { requestLogger } from './shared/middleware/requestLogger';

class App {
  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeModules();
    this.initializeDocs();
    this.initializeErrorHandling();
  }

  initializeMiddlewares() {
    // Security
    this.app.use(helmet({
      contentSecurityPolicy: false, // For Swagger UI
    }));
    this.app.use(cors(corsConfig));

    // Body parsing
    this.app.use(json({ limit: '10mb' }));
    this.app.use(urlencoded({ extended: true, limit: '10mb' }));
    this.app.use((req, res, next) => {
      req.cookies = req.cookies || {};
      if (req.headers.cookie) {
        req.headers.cookie.split(';').forEach(cookie => {
          const parts = cookie.split('=');
          const name = parts[0]?.trim();
          const value = parts.slice(1).join('=').trim();
          if (name) req.cookies[name] = decodeURIComponent(value);
        });
      }
      next();
    });

    // Compression
    this.app.use(compression());

    // Logging
    if (env === 'development') {
      this.app.use(morgan('dev'));
    }

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });
  }

  initializeModules() {
    const apiRouter = Router();

    // Mount modules directly to apiRouter to support /api/auth, /api/users, etc.
    apiRouter.use('/', userRouter);
    apiRouter.use('/', inventoryRouter);

    // Mount API router (Prefix: /api)
    this.app.use('/api', apiRouter);
  }

  initializeDocs() {
    // Serve Inventory API Documentation
    this.app.use('/docs/inventory', inventoryDocsRouter);
  }

  initializeErrorHandling() {
    // 404 handler (Catch-all)
    this.app.use((req, res, next) => {
      // If it's a documentation route, let it pass if not caught by docs middleware
      if (req.path.startsWith('/docs')) return next();

      res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl,
      });
    });

    // Final error handler
    this.app.use(errorHandler);
  }

  getApp() {
    return this.app;
  }
}

// Export the initialized Express app instance
export default new App().getApp();
