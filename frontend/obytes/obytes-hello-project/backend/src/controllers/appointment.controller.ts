import { type Request, type Response } from 'express';

import { AppointmentService } from '../services/appointment.service';
import { handleError } from '../utils/error.utils';

export class AppointmentController {
  private appointmentService: AppointmentService;

  constructor() {
    this.appointmentService = new AppointmentService();
  }

  getUserAppointments = async (req: Request, res: Response) => {
    try {
      const userId = req.user.userId;
      const appointments =
        await this.appointmentService.getUserAppointments(userId);
      res.json(appointments);
    } catch (error) {
      handleError(res, error);
    }
  };

  createAppointment = async (req: Request, res: Response) => {
    try {
      const appointmentData = req.body;
      const appointment =
        await this.appointmentService.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (error) {
      handleError(res, error);
    }
  };

  cancelAppointment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.appointmentService.cancelAppointment(id);
      res.status(204).send();
    } catch (error) {
      handleError(res, error);
    }
  };

  getAppointmentById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const appointment = await this.appointmentService.getAppointmentById(id);
      res.json(appointment);
    } catch (error) {
      handleError(res, error);
    }
  };
}
