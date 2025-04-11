import prisma from '../utils/database.utils';

export class AppointmentService {
  async getUserAppointments(userId: string) {
    return prisma.appointment.findMany({
      where: { userId },
      include: {
        service: true,
        staff: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  async createAppointment(data: {
    userId: string;
    serviceId: string;
    staffId: string;
    date: Date;
  }) {
    return prisma.appointment.create({
      data,
      include: {
        service: true,
        staff: true,
        user: true,
      },
    });
  }

  async cancelAppointment(id: string) {
    return prisma.appointment.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
    });
  }

  async getAppointmentById(id: string) {
    const appointment = await prisma.appointment.findUnique({
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
}
