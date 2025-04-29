"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const custom_error_1 = require("../utils/custom-error");
const prisma = new client_1.PrismaClient();
// JWT Configuration
const JWT_CONFIG = {
    expiresIn: '24h'
};
// Validation functions
const validateJWTSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw custom_error_1.ErrorFactory.system('JWT_SECRET is not configured');
    }
    return secret;
};
const validatePassword = async (plainPassword, hashedPassword) => {
    return await bcrypt_1.default.compare(plainPassword, hashedPassword);
};
// Main service
class AuthService {
    constructor() {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw custom_error_1.ErrorFactory.system('JWT_SECRET is not configured');
        }
        this.jwtSecret = secret;
    }
    /**
     * Register a new user
     */
    async register(data) {
        try {
            // Check for existing user
            const existingUser = await prisma.user.findUnique({
                where: { email: data.email }
            });
            if (existingUser) {
                throw custom_error_1.ErrorFactory.validation('Email already registered');
            }
            // Hash password
            const hashedPassword = await bcrypt_1.default.hash(data.password, 10);
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
        }
        catch (error) {
            if (error instanceof custom_error_1.CustomError) {
                throw error;
            }
            throw custom_error_1.ErrorFactory.system('Registration failed', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    /**
     * Login user
     */
    async login(data) {
        try {
            // Find user
            const user = await prisma.user.findUnique({
                where: { email: data.email }
            });
            if (!user) {
                throw custom_error_1.ErrorFactory.authentication('Invalid credentials');
            }
            // Verify password
            const isValidPassword = await validatePassword(data.password, user.password);
            if (!isValidPassword) {
                throw custom_error_1.ErrorFactory.authentication('Invalid credentials');
            }
            // Generate token
            const token = this.generateToken(user);
            return {
                token,
                user: this.sanitizeUser(user)
            };
        }
        catch (error) {
            if (error instanceof custom_error_1.CustomError) {
                throw error;
            }
            throw custom_error_1.ErrorFactory.system('Login failed', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    /**
     * Generate JWT token
     */
    generateToken(user) {
        const payload = {
            userId: user.id,
            email: user.email || '',
            name: user.name || '',
            phone: user.phone || ''
        };
        try {
            // Explicitly type the secret and options
            const secret = this.jwtSecret;
            const options = JWT_CONFIG;
            return jsonwebtoken_1.default.sign(payload, secret, options);
        }
        catch (error) {
            throw custom_error_1.ErrorFactory.system('Token generation failed', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    /**
     * Verify JWT token
     */
    verifyToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.jwtSecret);
            return decoded;
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw custom_error_1.ErrorFactory.authentication('Token has expired');
            }
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw custom_error_1.ErrorFactory.authentication('Invalid token');
            }
            throw custom_error_1.ErrorFactory.system('Token verification failed');
        }
    }
    /**
     * Change password
     */
    async changePassword(userId, currentPassword, newPassword) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });
            if (!user) {
                throw custom_error_1.ErrorFactory.notFound('User');
            }
            // Verify current password
            const isValidPassword = await validatePassword(currentPassword, user.password);
            if (!isValidPassword) {
                throw custom_error_1.ErrorFactory.authentication('Current password is incorrect');
            }
            // Hash new password
            const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
            // Update password
            await prisma.user.update({
                where: { id: userId },
                data: { password: hashedPassword }
            });
        }
        catch (error) {
            if (error instanceof custom_error_1.CustomError) {
                throw error;
            }
            throw custom_error_1.ErrorFactory.system('Password change failed', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    /**
     * Sanitize user object by removing sensitive data
     */
    sanitizeUser(user) {
        return {
            id: user.id,
            email: user.email,
            name: user.name
        };
    }
}
exports.AuthService = AuthService;
// Create and export singleton instance
exports.authService = new AuthService();
