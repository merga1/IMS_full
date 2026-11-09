// src/config/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';

import { port } from './env.js';

const routeDocs = [
  ['post', '/auth/login', 'Log in with Fayda ID and password', 'Authentication', true],
  ['post', '/auth/refresh-token', 'Rotate the refresh token', 'Authentication', true],
  ['post', '/auth/logout', 'End the current session', 'Authentication', true],
  ['post', '/users', 'Create a user', 'Users'],
  ['get', '/users', 'List users with filters and pagination', 'Users'],
  ['get', '/users/stats', 'Get user counts by type and clearance suspension', 'Users'],
  ['get', '/users/hierarchy', 'Get the management hierarchy', 'Users'],
  ['get', '/users/supervisor', 'Get the current user’s supervisor or sponsor', 'Users'],
  ['get', '/users/profile', 'Get the current user profile', 'Users'],
  ['get', '/users/{id}', 'Get a user by UUID', 'Users'],
  ['patch', '/users/{id}', 'Update a user', 'Users'],
  ['delete', '/users/{id}', 'Delete a user', 'Users'],
  ['post', '/users/change-password', 'Change the current user password', 'Users'],
  ['post', '/roles', 'Create a role', 'Access control'],
  ['get', '/roles', 'List roles', 'Access control'],
  ['get', '/roles/{id}', 'Get a role by integer ID', 'Access control'],
  ['patch', '/roles/{id}', 'Update a role', 'Access control'],
  ['delete', '/roles/{id}', 'Delete a role', 'Access control'],
  ['post', '/roles/{id}/permissions', 'Assign permissions to a role', 'Access control'],
  ['delete', '/roles/{id}/permissions', 'Remove permissions from a role', 'Access control'],
  ['post', '/permissions', 'Create a permission', 'Access control'],
  ['post', '/permissions/bulk', 'Create multiple permissions', 'Access control'],
  ['get', '/permissions', 'List permissions', 'Access control'],
  ['get', '/permissions/module/{module}', 'List permissions for a module', 'Access control'],
  ['get', '/permissions/{id}', 'Get a permission by integer ID', 'Access control'],
  ['delete', '/permissions/{id}', 'Delete a permission', 'Access control'],
  ['get', '/inventory/summary', 'Get global stock summary', 'Inventory'],
  ['get', '/inventory/branch/{id}', 'Get inventory for a branch', 'Inventory'],
  ['post', '/inventory/register', 'Register a SKU', 'Inventory'],
  ['post', '/inventory/transfer', 'Create an asset transfer and gate pass', 'Inventory'],
  ['put', '/inventory/receive', 'Confirm receipt at the destination location', 'Inventory'],
  ['post', '/requests/ask', 'Create an inventory requisition', 'Requisitions'],
  ['get', '/requests/my-requests', 'List the current user requisitions', 'Requisitions'],
  ['get', '/requests/approved-list', 'List approved requisitions for the current branch', 'Requisitions'],
  ['get', '/approvals/pending', 'List requisitions awaiting the current user approval', 'Approvals'],
  ['post', '/approvals/{id}/action', 'Approve or reject a requisition', 'Approvals'],
  ['post', '/dispatch/verify-otp', 'Verify pickup OTP and issue an item', 'Dispatch'],
  ['post', '/dispatch/notify', 'Mark an approved item ready for pickup', 'Dispatch'],
  ['get', '/dispatch/gate-pass/{id}', 'Get a gate pass', 'Dispatch'],
  ['post', '/dispatch/sign', 'Record an approval signature', 'Dispatch'],
  ['post', '/procurement/buy-request', 'Create an out-of-stock procurement request', 'Procurement'],
  ['post', '/procurement/gd-approve/{id}', 'Approve a procurement request', 'Procurement'],
  ['get', '/procurement/pending', 'List procurement requests awaiting approval', 'Procurement'],
  ['post', '/incidents/report', 'Report a damaged or lost item', 'Maintenance'],
  ['get', '/maintenance/queue', 'List unresolved incidents', 'Maintenance'],
  ['put', '/maintenance/resolve/{id}', 'Resolve an incident', 'Maintenance'],
  ['post', '/maintenance/scrap/{id}', 'Mark an asset as scrapped', 'Maintenance'],
];

const paths = {};
for (const [method, path, summary, tag, isPublic = false] of routeDocs) {
  paths[path] ??= {};
  const parameters = [...path.matchAll(/\{([^}]+)\}/g)].map(([, name]) => ({
    name,
    in: 'path',
    required: true,
    schema: { type: 'string' },
  }));

  paths[path][method] = {
    summary,
    tags: [tag],
    ...(parameters.length ? { parameters } : {}),
    security: isPublic ? [] : [{ bearerAuth: [] }],
    responses: {
      200: { description: 'Request completed successfully' },
      201: { description: 'Resource created successfully' },
      400: { description: 'Invalid request data' },
      401: { description: 'Authentication required or token invalid' },
      403: { description: 'Insufficient permissions' },
      500: { description: 'Unexpected server error' },
    },
  };
}

const options = {
  definition: {
    openapi: '3.0.0',
    paths,
    info: {
      title: 'inventory management system',
      version: '1.0.0',
      description: 'Documentation for inventory management system',
      contact: {
        name: 'API Support',
        url: 'https://inventory-management-system.com',
        email: 'support@example.com'
      },
      license: {
        name: 'Apache 2.0',
        url: 'http://www.apache.org/licenses/LICENSE-2.0.html'
      }
    },
    servers: [
      {
        url: `http://localhost:${port}/api`,
        description: 'Local API server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token in the format: Bearer &lt;token>'
        }
      },
      schemas: {
        // Common schemas can be defined here
        Error: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            code: { type: 'integer' },
            errors: { type: 'array', items: { type: 'string' } }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  // Path to the API docs
  apis: [
    './src/modules/**/routes/*.js',
    './src/modules/**/dto/*.js'
  ]
};

const specs = swaggerJsdoc(options);

export default specs;
