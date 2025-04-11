import { type Request, type Response } from 'express';

import { ServiceService } from '../services/service.service';
import { handleError } from '../utils/error.utils';

export class ServiceController {
  private serviceService: ServiceService;

  constructor() {
    this.serviceService = new ServiceService();
  }

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

  createService = async (req: Request, res: Response) => {
    try {
      const serviceData = req.body;
      const service = await this.serviceService.createService(serviceData);
      res.status(201).json(service);
    } catch (error) {
      handleError(res, error);
    }
  };

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
