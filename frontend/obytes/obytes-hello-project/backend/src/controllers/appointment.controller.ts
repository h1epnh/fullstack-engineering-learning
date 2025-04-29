import { type Request, type Response } from 'express';

import { AppointmentService } from '../services/appointment.service';
import { handleError } from '../utils/error.utils';

export class AppointmentController {
  private appointmentService: AppointmentService;

  constructor() {
    this.appointmentService = new AppointmentService();
  }

  // CRUD
  // Create, Read, Update, Delete
  // CREATE
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

  // READ
  getAllAppointments = async (req: Request, res: Response) => {
    try {
      const appointments = await this.appointmentService.getAllAppointments();
      res.json(appointments);
    } catch (error) {
      handleError(res, error);
    }
  }

  getUserAppointments = async (req: Request, res: Response) => {
    try {
      // Check if user exists in request
      console.log('req.user', req.user);
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const userId = req.user.userId;
      console.log('userId', userId);
      const appointments =
        await this.appointmentService.getUserAppointments(userId);
      console.log('appointments', appointments);
      res.json(appointments);
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

  searchAppointmentsByFilters = async (req: Request, res: Response) => {
    try {
      const filters = req.body.query;

      if (!filters) {
        return res.status(400).json({ message: 'Missing filters' });
      }
      
      const appointments = await this.appointmentService.searchAppointmentsByFilters(filters);
      res.json(appointments);
    } catch (error) {
      handleError(res, error);
    }
  }

  // UPDATE
  updateAppointment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const appointmentData = req.body;
      const appointment = await this.appointmentService.updateAppointment(id, appointmentData);
      res.json(appointment);
    } catch (error) {
      handleError(res, error);
    }
  };

  // DELETE
  deleteAppointment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.appointmentService.deleteAppointment(id);
      res.status(204).send();
    } catch (error) {
      handleError(res, error);
    }
  }

  // CANCEL
  cancelAppointment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.appointmentService.cancelAppointment(id);
      res.status(204).send();
    } catch (error) {
      handleError(res, error);
    }
  };

  

  

  

  
}
