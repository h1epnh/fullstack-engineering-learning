import { Router } from 'express';

import { AppointmentController } from '../controllers/appointment.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const appointmentController = new AppointmentController();

// CRUD
// Create, Read, Update, Delete

// CREATE
router.post('/', authMiddleware, appointmentController.createAppointment);

// READ
router.get('/', authMiddleware, appointmentController.getUserAppointments);
router.get('/:id', authMiddleware, appointmentController.getAppointmentById);
router.get('/all', authMiddleware, appointmentController.getAllAppointments);
router.post('/filters', authMiddleware, appointmentController.searchAppointmentsByFilters);

// UPDATE
router.put('/:id', authMiddleware, appointmentController.updateAppointment);

// DELETE
router.delete('/:id', authMiddleware, appointmentController.deleteAppointment);
router.put(
  '/:id/cancel',
  authMiddleware,
  appointmentController.cancelAppointment
);



export default router;
