import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';

import { config } from '../config/env';

export const securityMiddleware = [
  helmet(),
  compression(),
  morgan(config.NODE_ENV === 'development' ? 'dev' : 'combined'),
];
