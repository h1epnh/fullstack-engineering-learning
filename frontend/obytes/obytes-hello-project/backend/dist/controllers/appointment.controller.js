"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentController = void 0;
const appointment_service_1 = require("../services/appointment.service");
const error_utils_1 = require("../utils/error.utils");
class AppointmentController {
    constructor() {
        // CRUD
        // Create, Read, Update, Delete
        // CREATE
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
        // READ
        this.getAllAppointments = async (req, res) => {
            try {
                const appointments = await this.appointmentService.getAllAppointments();
                res.json(appointments);
            }
            catch (error) {
                (0, error_utils_1.handleError)(res, error);
            }
        };
        this.getUserAppointments = async (req, res) => {
            try {
                // Check if user exists in request
                console.log('req.user', req.user);
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
        this.searchAppointmentsByFilters = async (req, res) => {
            try {
                const filters = req.body.query;
                if (!filters) {
                    return res.status(400).json({ message: 'Missing filters' });
                }
                const appointments = await this.appointmentService.searchAppointmentsByFilters(filters);
                res.json(appointments);
            }
            catch (error) {
                (0, error_utils_1.handleError)(res, error);
            }
        };
        // UPDATE
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
        // DELETE
        this.deleteAppointment = async (req, res) => {
            try {
                const { id } = req.params;
                await this.appointmentService.deleteAppointment(id);
                res.status(204).send();
            }
            catch (error) {
                (0, error_utils_1.handleError)(res, error);
            }
        };
        // CANCEL
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
        this.appointmentService = new appointment_service_1.AppointmentService();
    }
}
exports.AppointmentController = AppointmentController;
