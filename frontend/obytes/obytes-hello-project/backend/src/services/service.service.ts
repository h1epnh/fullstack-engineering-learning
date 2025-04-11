import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ServiceService {
  async getAllServices() {
    return prisma.service.findMany();
  }

  async getServiceById(id: string) {
    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new Error('Service not found');
    }

    return service;
  }

  async createService(data: {
    name: string;
    description: string;
    price: number;
    duration: number;
    category: string;
  }) {
    return prisma.service.create({
      data,
    });
  }

  async updateService(
    id: string,
    data: {
      name?: string;
      description?: string;
      price?: number;
      duration?: number;
      category?: string;
    }
  ) {
    return prisma.service.update({
      where: { id },
      data,
    });
  }

  async deleteService(id: string) {
    return prisma.service.delete({
      where: { id },
    });
  }
}
