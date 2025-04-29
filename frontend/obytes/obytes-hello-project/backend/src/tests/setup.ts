import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

const prisma = new PrismaClient();

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
  } catch (error) {
    console.error('Test setup error:', error);
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});

// Global test timeout
jest.setTimeout(30000);
