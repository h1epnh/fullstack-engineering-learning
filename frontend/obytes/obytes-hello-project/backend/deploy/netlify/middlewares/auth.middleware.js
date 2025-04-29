"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const authMiddleware = (req, res, next) => {
    var _a;
    try {
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'No auth token provided' });
        }
        // Make sure JWT_SECRET exists
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET is not defined');
        }
        // Verify and decode token
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        if (!decoded || typeof decoded !== 'object' || !decoded.userId) {
            return res.status(401).json({ message: 'Invalid token format' });
        }
        // Set user in request
        req.user = Object.assign(Object.assign({}, decoded), { userId: decoded.userId });
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        return res.status(500).json({ message: 'Authentication error' });
    }
};
exports.authMiddleware = authMiddleware;
