// src/modules/inventory-management/routes/inventory.routes.js
import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';

import specs from '../../../config/swagger.js';

const router = Router();

const options = {
    explorer: true,
    swaggerOptions: {
        docExpansion: 'list',
        filter: true,
        showRequestDuration: true,
        defaultModelsExpandDepth: 3,
        defaultModelExpandDepth: 3,
    }
};

// Serve Swagger UI
router.use('/', swaggerUi.serve);
router.get(
    '/',
    swaggerUi.setup(specs, options)
);

// Serve Swagger JSON
router.get('/json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
});

export default router;
