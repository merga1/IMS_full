import express from 'express';
import inventoryRouter from './routes/index.js';

class InventoryModule {
    constructor() {
        this.router = inventoryRouter;
    }
}

export default new InventoryModule();