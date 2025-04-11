import { Router } from 'express';

import { AppointmentController } from '../controllers/appointment.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const appointmentController = new AppointmentController();

router.get('/', authMiddleware, appointmentController.getUserAppointments);
router.post('/', authMiddleware, appointmentController.createAppointment);
router.put(
  '/:id/cancel',
  authMiddleware,
  appointmentController.cancelAppointment
);
router.get('/:id', authMiddleware, appointmentController.getAppointmentById);

export default router;
