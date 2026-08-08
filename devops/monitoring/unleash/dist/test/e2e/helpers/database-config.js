"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDbConfig = void 0;
const parse_database_url_1 = __importDefault(require("parse-database-url"));
const getDbConfig = () => {
    const url = process.env.TEST_DATABASE_URL ||
        'postgres://unleash_user:password@localhost:5432/unleash_test';
    return (0, parse_database_url_1.default)(url);
};
exports.getDbConfig = getDbConfig;
//# sourceMappingURL=database-config.js.map