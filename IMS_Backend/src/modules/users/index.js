// src/modules/users/index.js

import routes from './routes/index.js';


export default {
  routes,
  // Export services for use by other modules
  userService: require('./services/userService'),
  roleService: require('./services/roleService'),
  permissionService: require('./services/permissionService')
};