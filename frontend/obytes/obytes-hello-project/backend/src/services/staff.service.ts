import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class StaffService {
  async getAllStaff() {
    return prisma.staff.findMany();
  }

  async getStaffById(id: string) {
    const staffMember = await prisma.staff.findUnique({
      where: { id },
    });

    if (!staffMember) {
      throw new Error('Staff member not found');
    }

    return staffMember;
  }

  async createStaff(data: {
    name: string;
    email: string;
    phone?: string;
  }) {
    return prisma.staff.create({
      data,
    });
  }

  async updateStaff(
    id: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
    }
  ) {
    return prisma.staff.update({
      where: { id },
      data,
    });
  }

  async deleteStaff(id: string) {
    return prisma.staff.delete({
      where: { id },
    });
  }
}
