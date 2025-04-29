import { type Request, type Response } from 'express';
import { Prisma } from '@prisma/client';
import { ServiceService } from '../services/service.service';
import { handleError } from '../utils/error.utils';

// Get the Category enum from Prisma's generated types
type Category = Prisma.ServiceCreateInput['category'];

export class ServiceController {
  private serviceService: ServiceService;

  constructor() {
    this.serviceService = new ServiceService();
  }

  // CRUD
  // Create, Read, Update, Delete
  // CREATE
  createService = async (req: Request, res: Response) => {
    try {
      // const serviceData = req.body;
      const serviceData = {
        ...req.body,
        category: req.body.category as Category // Ensure category is cast to enum
      };
      const service = await this.serviceService.createService(serviceData);
      res.status(201).json(service);
    } catch (error) {
      handleError(res, error);
    }
  };

  // READ
  getAllServices = async (req: Request, res: Response) => {
    try {
      const services = await this.serviceService.getAllServices();
      res.json(services);
    } catch (error) {
      handleError(res, error);
    }
  };

  getServiceById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const service = await this.serviceService.getServiceById(id);
      res.json(service);
    } catch (error) {
      handleError(res, error);
    }
  };

  // UPDATE
  updateService = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const serviceData = req.body;
      const service = await this.serviceService.updateService(id, serviceData);
      res.json(service);
    } catch (error) {
      handleError(res, error);
    }
  };

  // DELETE
  deleteService = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.serviceService.deleteService(id);
      res.status(204).send();
    } catch (error) {
      handleError(res, error);
    }
  };
}
