import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { PrismaClient, User } from '@prisma/client';
import { ErrorFactory, ErrorType, CustomError } from '../utils/custom-error';

const prisma = new PrismaClient();

// Types
interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  phone: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

interface LoginInput {
  email: string;
  password: string;
}

// JWT Configuration
const JWT_CONFIG: SignOptions = {
  expiresIn: '24h'
};

// Validation functions
const validateJWTSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw ErrorFactory.system('JWT_SECRET is not configured');
  }
  return secret;
};

const validatePassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// Main service
export class AuthService {
  private readonly jwtSecret: string;

  constructor() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw ErrorFactory.system('JWT_SECRET is not configured');
    }
    this.jwtSecret = secret;
  }

  /**
   * Register a new user
   */
  async register(data: RegisterInput): Promise<AuthResponse> {
    try {
      // Check for existing user
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (existingUser) {
        throw ErrorFactory.validation('Email already registered');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name
        }
      });

      // Generate token
      const token = this.generateToken(user);

      return {
        token,
        user: this.sanitizeUser(user)
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw ErrorFactory.system('Registration failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Login user
   */
  async login(data: LoginInput): Promise<AuthResponse> {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (!user) {
        throw ErrorFactory.authentication('Invalid credentials');
      }

      // Verify password
      const isValidPassword = await validatePassword(data.password, user.password);

      if (!isValidPassword) {
        throw ErrorFactory.authentication('Invalid credentials');
      }

      // Generate token
      const token = this.generateToken(user);

      return {
        token,
        user: this.sanitizeUser(user)
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw ErrorFactory.system('Login failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Generate JWT token
   */
  private generateToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email || '',
      name: user.name || '',
      phone: user.phone || ''
    };

    try {
      // Explicitly type the secret and options
      const secret: jwt.Secret = this.jwtSecret;
      const options: jwt.SignOptions = JWT_CONFIG;

      return jwt.sign(payload, secret, options);
    } catch (error) {
      throw ErrorFactory.system('Token generation failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as TokenPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw ErrorFactory.authentication('Token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw ErrorFactory.authentication('Invalid token');
      }
      throw ErrorFactory.system('Token verification failed');
    }
  }

  /**
   * Change password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw ErrorFactory.notFound('User');
      }

      // Verify current password
      const isValidPassword = await validatePassword(
        currentPassword,
        user.password
      );

      if (!isValidPassword) {
        throw ErrorFactory.authentication('Current password is incorrect');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw ErrorFactory.system('Password change failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Sanitize user object by removing sensitive data
   */
  private sanitizeUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name
    };
  }
}

// Create and export singleton instance
export const authService = new AuthService();
