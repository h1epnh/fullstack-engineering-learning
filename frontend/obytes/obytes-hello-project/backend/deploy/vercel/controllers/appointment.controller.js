"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentController = void 0;
const appointment_service_1 = require("../services/appointment.service");
const error_utils_1 = require("../utils/error.utils");
class AppointmentController {
    constructor() {
        this.getUserAppointments = async (req, res) => {
            try {
                // Check if user exists in request
                if (!req.user) {
                    return res.status(401).json({ message: 'User not authenticated' });
                }
                const userId = req.user.userId;
                console.log('userId', userId);
                const appointments = await this.appointmentService.getUserAppointments(userId);
                console.log('appointments', appointments);
                res.json(appointments);
            }
            catch (error) {
                (0, error_utils_1.handleError)(res, error);
            }
        };
        this.createAppointment = async (req, res) => {
            try {
                const appointmentData = req.body;
                const appointment = await this.appointmentService.createAppointment(appointmentData);
                res.status(201).json(appointment);
            }
            catch (error) {
                (0, error_utils_1.handleError)(res, error);
            }
        };
        this.cancelAppointment = async (req, res) => {
            try {
                const { id } = req.params;
                await this.appointmentService.cancelAppointment(id);
                res.status(204).send();
            }
            catch (error) {
                (0, error_utils_1.handleError)(res, error);
            }
        };
        this.getAppointmentById = async (req, res) => {
            try {
                const { id } = req.params;
                const appointment = await this.appointmentService.getAppointmentById(id);
                res.json(appointment);
            }
            catch (error) {
                (0, error_utils_1.handleError)(res, error);
            }
        };
        this.updateAppointment = async (req, res) => {
            try {
                const { id } = req.params;
                const appointmentData = req.body;
                const appointment = await this.appointmentService.updateAppointment(id, appointmentData);
                res.json(appointment);
            }
            catch (error) {
                (0, error_utils_1.handleError)(res, error);
            }
        };
        this.appointmentService = new appointment_service_1.AppointmentService();
    }
}
exports.AppointmentController = AppointmentController;
