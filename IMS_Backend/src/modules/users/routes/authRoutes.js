import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';

import { validate } from '../../../shared/middleware/validation.js';
import authController from '../controllers/authController.js';
import userValidators from '../validators/userValidators.js';

const router = Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Try again later.' },
});

router.post('/login', loginLimiter, validate(userValidators.loginSchema), authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

export default router;
