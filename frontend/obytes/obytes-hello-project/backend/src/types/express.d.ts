import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      pagination?: {
        page: number;
        limit: number;
        skip: number;
      };
    }
  }
}

export {};
