import { PrismaClient, Prisma, Service, Category } from '@prisma/client';
import { ErrorFactory } from '../utils/custom-error';

const prisma = new PrismaClient();

// Define input interfaces
interface CreateServiceInput {
    name: string;
    description: string;
    price: number;
    duration: number;
  category: Category; // Using the Prisma-generated Category enum
    imageUrl?: string;
  }

interface UpdateServiceInput {
      name?: string;
      description?: string;
      price?: number;
      duration?: number;
  category?: Category;
      imageUrl?: string;
    }

export class ServiceService {
  /**
   * Create a new service
   */
  async createService(data: CreateServiceInput): Promise<Service> {
    try {
      return await prisma.service.create({
        data: {
          name: data.name,
          description: data.description,
          price: data.price,
          duration: data.duration,
          category: data.category as Category, // Ensure proper type casting
          imageUrl: data.imageUrl
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw ErrorFactory.database('Database error while creating service', {
          code: error.code,
          meta: error.meta
        });
      }
      throw ErrorFactory.system('Failed to create service', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update a service
   */
  async updateService(id: string, data: UpdateServiceInput): Promise<Service> {
    try {
      return await prisma.service.update({
      where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.description && { description: data.description }),
          ...(data.price && { price: data.price }),
          ...(data.duration && { duration: data.duration }),
          ...(data.category && { category: data.category as Category }),
          ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl })
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw ErrorFactory.notFound('Service');
        }
        throw ErrorFactory.database('Database error while updating service', {
          code: error.code,
          meta: error.meta
        });
      }
      throw ErrorFactory.system('Failed to update service', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get all services
   */
  async getAllServices(params?: {
    category?: Category;
    skip?: number;
    take?: number;
  }): Promise<Service[]> {
    try {
      return await prisma.service.findMany({
        where: params?.category ? { category: params.category } : undefined,
        skip: params?.skip,
        take: params?.take,
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      throw ErrorFactory.system('Failed to fetch services', {
        error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

  /**
   * Get service by ID
   */
  async getServiceById(id: string): Promise<Service> {
    try {
      const service = await prisma.service.findUnique({
        where: { id }
      });

      if (!service) {
        throw ErrorFactory.notFound('Service');
      }

      return service;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw ErrorFactory.database('Database error while fetching service', {
          code: error.code,
          meta: error.meta
        });
      }
      throw ErrorFactory.system('Failed to fetch service', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Delete service
   */
  async deleteService(id: string): Promise<void> {
    try {
      await prisma.service.delete({
        where: { id }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw ErrorFactory.notFound('Service');
        }
        throw ErrorFactory.database('Database error while deleting service', {
          code: error.code,
          meta: error.meta
        });
      }
      throw ErrorFactory.system('Failed to delete service', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const serviceService = new ServiceService();
