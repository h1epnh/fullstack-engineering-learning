import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Nail Salon API Documentation',
      version: '1.0.0',
      description: 'API documentation for the Nail Salon application',
      contact: {
        name: 'API Support',
        email: 'support@nailsalon.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

export const specs = swaggerJsdoc(swaggerOptions);
