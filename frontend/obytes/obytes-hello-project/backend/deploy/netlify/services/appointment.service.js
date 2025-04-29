"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentService = void 0;
const database_utils_1 = __importDefault(require("../utils/database.utils"));
class AppointmentService {
    // CRUD
    // Create, Read, Update, Delete
    // CREATE
    async createAppointment(data) {
        try {
            if (!data.userId || !data.serviceId || !data.staffId || !data.date || !data.timeRange) {
                throw new Error('Missing required fields');
            }
            const newAppointment = await database_utils_1.default.appointment.create({
                data,
                include: {
                    service: true,
                    staff: true,
                    user: true,
                },
            });
            return newAppointment.id;
        }
        catch (error) {
            console.error('Error creating appointment:', error);
            throw new Error(`Could not create appointment: An unknown error occurred`);
        }
    }
    // READ
    async getAllAppointments() {
        return database_utils_1.default.appointment.findMany({
            include: {
                service: true,
                staff: true,
                user: true,
            },
        });
    }
    async getUserAppointments(userId) {
        return database_utils_1.default.appointment.findMany({
            where: { userId },
            include: {
                service: true,
                staff: true,
            },
            orderBy: { date: 'desc' },
        });
    }
    async getAppointmentById(id) {
        const appointment = await database_utils_1.default.appointment.findUnique({
            where: { id },
            include: {
                service: true,
                staff: true,
                user: true,
            },
        });
        if (!appointment) {
            throw new Error('Appointment not found');
        }
        return appointment;
    }
    async searchAppointmentsByFilters(filters) {
        return database_utils_1.default.appointment.findMany({
            where: filters
        });
    }
    // UPDATE
    async updateAppointment(id, data) {
        return database_utils_1.default.appointment.update({ where: { id }, data });
    }
    // DELETE
    async deleteAppointment(id) {
        return database_utils_1.default.appointment.delete({ where: { id } });
    }
    // CANCEL
    async cancelAppointment(id) {
        return database_utils_1.default.appointment.update({
            where: { id },
            data: {
                status: 'CANCELLED',
            },
        });
    }
}
exports.AppointmentService = AppointmentService;
