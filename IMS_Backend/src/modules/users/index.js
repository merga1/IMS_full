// src/modules/users/index.js
import routes from './routes/index.js';
import userService from './services/userService.js';
import roleService from './services/roleService.js';
import permissionService from './services/permissionService.js';

export default {
  routes,
  userService,
  roleService,
  permissionService,
};
