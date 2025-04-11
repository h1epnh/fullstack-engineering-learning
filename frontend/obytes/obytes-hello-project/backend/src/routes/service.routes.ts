import { Router } from 'express';

import { ServiceController } from '../controllers/service.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const serviceController = new ServiceController();

// Public routes
router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);

// Protected routes
router.post('/', authMiddleware, serviceController.createService);
router.put('/:id', authMiddleware, serviceController.updateService);
router.delete('/:id', authMiddleware, serviceController.deleteService);

export default router;
