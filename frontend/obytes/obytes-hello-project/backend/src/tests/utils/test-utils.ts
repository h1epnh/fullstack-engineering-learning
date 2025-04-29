import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../../app';

const prisma = new PrismaClient();

export const createTestUser = async () => {
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: 'hashedPassword',
      name: 'Test User',
    },
  });
  
  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
  
  return { user, token };
};

export const createTestService = async () => {
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

export const testRequest = request(app);

export const clearDatabase = async () => {
  try {
    // Add your cleanup logic here
    // Example:
    /*
    await prisma.appointment.deleteMany();
    await prisma.service.deleteMany();
    await prisma.user.deleteMany();
    */
  } catch (error) {
    console.error('Database cleanup error:', error);
  }
};

export const createTestData = async () => {
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
  } catch (error) {
    console.error('Test data creation error:', error);
  }
};
