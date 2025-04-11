import { Router } from 'express';

import { AuthController } from '../controllers/auth.controller';
import {
  validateLogin,
  validateRegister,
} from '../middlewares/validation.middleware';

const router = Router();
const authController = new AuthController();

router.post('/login', validateLogin, authController.login);
router.post('/register', validateRegister, authController.register);

export default router;
