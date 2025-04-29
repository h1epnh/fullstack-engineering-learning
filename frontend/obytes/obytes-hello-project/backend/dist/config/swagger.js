"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.specs = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
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
exports.specs = (0, swagger_jsdoc_1.default)(swaggerOptions);
