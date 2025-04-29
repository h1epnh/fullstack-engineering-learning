"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceController = void 0;
const service_service_1 = require("../services/service.service");
const error_utils_1 = require("../utils/error.utils");
class ServiceController {
    constructor() {
        this.getAllServices = async (req, res) => {
            try {
                const services = await this.serviceService.getAllServices();
                res.json(services);
            }
            catch (error) {
                (0, error_utils_1.handleError)(res, error);
            }
        };
        this.getServiceById = async (req, res) => {
            try {
                const { id } = req.params;
                const service = await this.serviceService.getServiceById(id);
                res.json(service);
            }
            catch (error) {
                (0, error_utils_1.handleError)(res, error);
            }
        };
        this.createService = async (req, res) => {
            try {
                // const serviceData = req.body;
                const serviceData = Object.assign(Object.assign({}, req.body), { category: req.body.category // Ensure category is cast to enum
                 });
                const service = await this.serviceService.createService(serviceData);
                res.status(201).json(service);
            }
            catch (error) {
                (0, error_utils_1.handleError)(res, error);
            }
        };
        this.updateService = async (req, res) => {
            try {
                const { id } = req.params;
                const serviceData = req.body;
                const service = await this.serviceService.updateService(id, serviceData);
                res.json(service);
            }
            catch (error) {
                (0, error_utils_1.handleError)(res, error);
            }
        };
        this.deleteService = async (req, res) => {
            try {
                const { id } = req.params;
                await this.serviceService.deleteService(id);
                res.status(204).send();
            }
            catch (error) {
                (0, error_utils_1.handleError)(res, error);
            }
        };
        this.serviceService = new service_service_1.ServiceService();
    }
}
exports.ServiceController = ServiceController;
