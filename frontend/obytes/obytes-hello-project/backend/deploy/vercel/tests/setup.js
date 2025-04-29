"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
// Load test environment variables
dotenv_1.default.config({ path: '.env.test' });
const prisma = new client_1.PrismaClient();
beforeAll(async () => {
    try {
        await prisma.$connect();
        // Clean up database before tests
        // Note: Commenting out raw queries for now until database is properly set up
        /*
        await prisma.$executeRaw`TRUNCATE TABLE "Service" CASCADE`;
        await prisma.$executeRaw`TRUNCATE TABLE "Appointment" CASCADE`;
        await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE`;
        */
    }
    catch (error) {
        console.error('Test setup error:', error);
    }
});
afterAll(async () => {
    await prisma.$disconnect();
});
// Global test timeout
jest.setTimeout(30000);
