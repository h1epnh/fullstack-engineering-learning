"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceService = exports.ServiceService = void 0;
const client_1 = require("@prisma/client");
const custom_error_1 = require("../utils/custom-error");
const prisma = new client_1.PrismaClient();
class ServiceService {
    /**
     * Create a new service
     */
    async createService(data) {
        try {
            return await prisma.service.create({
                data: {
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    duration: data.duration,
                    category: data.category, // Ensure proper type casting
                    imageUrl: data.imageUrl
                }
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                throw custom_error_1.ErrorFactory.database('Database error while creating service', {
                    code: error.code,
                    meta: error.meta
                });
            }
            throw custom_error_1.ErrorFactory.system('Failed to create service', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    /**
     * Update a service
     */
    async updateService(id, data) {
        try {
            return await prisma.service.update({
                where: { id },
                data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (data.name && { name: data.name })), (data.description && { description: data.description })), (data.price && { price: data.price })), (data.duration && { duration: data.duration })), (data.category && { category: data.category })), (data.imageUrl !== undefined && { imageUrl: data.imageUrl }))
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw custom_error_1.ErrorFactory.notFound('Service');
                }
                throw custom_error_1.ErrorFactory.database('Database error while updating service', {
                    code: error.code,
                    meta: error.meta
                });
            }
            throw custom_error_1.ErrorFactory.system('Failed to update service', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    /**
     * Get all services
     */
    async getAllServices(params) {
        try {
            return await prisma.service.findMany({
                where: (params === null || params === void 0 ? void 0 : params.category) ? { category: params.category } : undefined,
                skip: params === null || params === void 0 ? void 0 : params.skip,
                take: params === null || params === void 0 ? void 0 : params.take,
                orderBy: { name: 'asc' }
            });
        }
        catch (error) {
            throw custom_error_1.ErrorFactory.system('Failed to fetch services', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    /**
     * Get service by ID
     */
    async getServiceById(id) {
        try {
            const service = await prisma.service.findUnique({
                where: { id }
            });
            if (!service) {
                throw custom_error_1.ErrorFactory.notFound('Service');
            }
            return service;
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                throw custom_error_1.ErrorFactory.database('Database error while fetching service', {
                    code: error.code,
                    meta: error.meta
                });
            }
            throw custom_error_1.ErrorFactory.system('Failed to fetch service', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    /**
     * Delete service
     */
    async deleteService(id) {
        try {
            await prisma.service.delete({
                where: { id }
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw custom_error_1.ErrorFactory.notFound('Service');
                }
                throw custom_error_1.ErrorFactory.database('Database error while deleting service', {
                    code: error.code,
                    meta: error.meta
                });
            }
            throw custom_error_1.ErrorFactory.system('Failed to delete service', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
exports.ServiceService = ServiceService;
exports.serviceService = new ServiceService();
