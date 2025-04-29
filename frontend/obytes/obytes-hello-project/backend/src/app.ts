import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { specs } from './docs/swagger';

import { config } from './config/env';
import { errorMiddleware } from './middlewares/error.middleware';
import { rateLimiter } from './middlewares/rate-limit.middleware';
import { securityMiddleware } from './middlewares/security.middleware';
import appointmentRoutes from './routes/appointment.routes';
import authRoutes from './routes/auth.routes';
import serviceRoutes from './routes/service.routes';
import staffRoutes from './routes/staff.routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(rateLimiter);
app.use(securityMiddleware);

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/staff', staffRoutes);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Nail Salon API Documentation"
}));

// Error handling
app.use(errorMiddleware);

const PORT = config.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
