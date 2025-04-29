import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Nail Salon API',
    version: '1.0.0',
    description: 'API documentation for Nail Salon services',
    contact: {
      name: 'API Support',
      email: 'support@nailsalon.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server'
    }
  ],
  components: {
    schemas: {
      Service: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Service unique identifier'
          },
          name: {
            type: 'string',
            description: 'Name of the service'
          },
          description: {
            type: 'string',
            description: 'Service description'
          },
          price: {
            type: 'number',
            description: 'Service price'
          },
          duration: {
            type: 'number',
            description: 'Service duration in minutes'
          },
          imageUrl: {
            type: 'string',
            nullable: true,
            description: 'URL of the service image'
          }
        }
      },
      Appointment: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Appointment unique identifier'
          },
          serviceId: {
            type: 'string',
            description: 'ID of the selected service'
          },
          customerId: {
            type: 'string',
            description: 'Customer unique identifier'
          },
          date: {
            type: 'string',
            format: 'date-time',
            description: 'Appointment date and time'
          },
          status: {
            type: 'string',
            enum: ['PENDING', 'CONFIRMED', 'CANCELLED'],
            description: 'Appointment status'
          }
        }
      }
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  }
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts']
};

export const specs = swaggerJsdoc(options);
