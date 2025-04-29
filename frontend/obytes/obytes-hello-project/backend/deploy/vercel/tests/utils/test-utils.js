"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestData = exports.clearDatabase = exports.testRequest = exports.createTestService = exports.createTestUser = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../app"));
const prisma = new client_1.PrismaClient();
const createTestUser = async () => {
    const user = await prisma.user.create({
        data: {
            email: 'test@example.com',
            password: 'hashedPassword',
            name: 'Test User',
        },
    });
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return { user, token };
};
exports.createTestUser = createTestUser;
const createTestService = async () => {
    return await prisma.service.create({
        data: {
            name: 'Test Service',
            description: 'Test Description',
            price: 50,
            duration: 60,
            category: 'MANICURE',
            imageUrl: 'https://example.com/image.jpg',
        },
    });
};
exports.createTestService = createTestService;
exports.testRequest = (0, supertest_1.default)(app_1.default);
const clearDatabase = async () => {
    try {
        // Add your cleanup logic here
        // Example:
        /*
        await prisma.appointment.deleteMany();
        await prisma.service.deleteMany();
        await prisma.user.deleteMany();
        */
    }
    catch (error) {
        console.error('Database cleanup error:', error);
    }
};
exports.clearDatabase = clearDatabase;
const createTestData = async () => {
    try {
        // Add your test data creation logic here
        // Example:
        /*
        const user = await prisma.user.create({
          data: {
            email: 'test@example.com',
            name: 'Test User',
            password: 'hashedPassword'
          }
        });
        return { user };
        */
    }
    catch (error) {
        console.error('Test data creation error:', error);
    }
};
exports.createTestData = createTestData;
