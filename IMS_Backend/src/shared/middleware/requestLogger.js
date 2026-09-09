import {morgan } from 'morgan';

import {logger}  from'../utils/logger.js'

// Custom token for user ID
morgan.token('user-id', (req) => req.user?.id || 'anonymous');

// Custom format
const format = ':method :url :status :response-time ms - :user-id - :remote-addr';

/**
 * Request logger middleware
 */
const requestLogger = morgan(format, {
  stream: {
    write: (message) => logger.http(message.trim())
  },
  skip: (req) => {
    // Skip health check endpoints
    return req.url === '/health' || req.url === '/ping';
  }
});

/**
 * Detailed request logger for debugging
 */
const detailedRequestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  logger.debug('Incoming request', {
    method: req.method,
    url: req.url,
    query: req.query,
    body: req.method !== 'GET' ? req.body : undefined,
    userId: req.user?.id,
    ip: req.ip
  });

  // Log response
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - startTime;
    
    logger.debug('Outgoing response', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id
    });

    originalSend.call(this, data);
  };

  next();
};

export{
  requestLogger,
  detailedRequestLogger
};