import dotenv from 'dotenv';

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined in environment variables');
}

export const jwtConfig = {
  secret: process.env.JWT_SECRET as string,
  expiresIn: '24h'
};
