"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const logger_utils_1 = __importDefault(require("./logger.utils"));
const prisma = new client_1.PrismaClient({
    log: [
        {
            emit: 'event',
            level: 'query',
        },
        {
            emit: 'event',
            level: 'error',
        },
        {
            emit: 'event',
            level: 'info',
        },
        {
            emit: 'event',
            level: 'warn',
        },
    ],
});
prisma.$on('query', (e) => {
    logger_utils_1.default.debug('Query: ' + e.query);
    logger_utils_1.default.debug('Duration: ' + e.duration + 'ms');
});
prisma.$on('error', (e) => {
    logger_utils_1.default.error('Database Error: ' + e.message);
});
exports.default = prisma;
