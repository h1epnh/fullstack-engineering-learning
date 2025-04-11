import cors from 'cors';
import express from 'express';

import { config } from './config/env';
import { errorMiddleware } from './middlewares/error.middleware';
import { rateLimiter } from './middlewares/rate-limit.middleware';
import { securityMiddleware } from './middlewares/security.middleware';
import appointmentRoutes from './routes/appointment.routes';
import authRoutes from './routes/auth.routes';
import serviceRoutes from './routes/service.routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(rateLimiter);
app.use(securityMiddleware);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);

// Error handling
app.use(errorMiddleware);

const PORT = config.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
