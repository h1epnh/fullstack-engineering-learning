"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const appointment_controller_1 = require("../controllers/appointment.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const appointmentController = new appointment_controller_1.AppointmentController();
// CRUD
// Create, Read, Update, Delete
// CREATE
router.post('/', auth_middleware_1.authMiddleware, appointmentController.createAppointment);
// READ
router.get('/', auth_middleware_1.authMiddleware, appointmentController.getUserAppointments);
router.get('/:id', auth_middleware_1.authMiddleware, appointmentController.getAppointmentById);
router.get('/all', auth_middleware_1.authMiddleware, appointmentController.getAllAppointments);
router.post('/filters', auth_middleware_1.authMiddleware, appointmentController.searchAppointmentsByFilters);
// UPDATE
router.put('/:id', auth_middleware_1.authMiddleware, appointmentController.updateAppointment);
// DELETE
router.delete('/:id', auth_middleware_1.authMiddleware, appointmentController.deleteAppointment);
router.put('/:id/cancel', auth_middleware_1.authMiddleware, appointmentController.cancelAppointment);
exports.default = router;
