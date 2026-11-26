import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/authenticate';
import { validateBody } from '../middlewares/validate';
import { loginSchema, registerSchema } from '../validators/auth.validator';

export const authRoutes = Router();

authRoutes.post('/register', validateBody(registerSchema), authController.register);
authRoutes.post('/login', validateBody(loginSchema), authController.login);
authRoutes.get('/me', authenticate, authController.me);
authRoutes.post('/refresh', authenticate, authController.refresh);
