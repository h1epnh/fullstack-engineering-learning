"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class StaffService {
    async getAllStaff() {
        return prisma.staff.findMany();
    }
    async getStaffById(id) {
        const staffMember = await prisma.staff.findUnique({
            where: { id },
        });
        if (!staffMember) {
            throw new Error('Staff member not found');
        }
        return staffMember;
    }
    async createStaff(data) {
        return prisma.staff.create({
            data,
        });
    }
    async updateStaff(id, data) {
        return prisma.staff.update({
            where: { id },
            data,
        });
    }
    async deleteStaff(id) {
        return prisma.staff.delete({
            where: { id },
        });
    }
}
exports.StaffService = StaffService;
