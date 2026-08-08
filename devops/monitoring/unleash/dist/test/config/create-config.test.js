"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const create_config_1 = require("../../lib/create-config");
const option_1 = require("../../lib/types/option");
test('Should use DATABASE_URL from env', () => {
    const databaseUrl = 'postgres://u:p@localhost:5432/name';
    delete process.env.NODE_ENV;
    process.env.DATABASE_URL = databaseUrl;
    const config = (0, create_config_1.createConfig)({});
    expect(config.db.host).toBe('localhost');
    expect(config.db.password).toBe('p');
    expect(config.db.user).toBe('u');
    expect(config.db.database).toBe('name');
    expect(config.db.schema).toBe('public');
});
test('Should use databaseURl from options', () => {
    const databaseUrl = 'postgres://u:p@localhost:5432/name';
    const config = (0, create_config_1.createConfig)({ databaseUrl });
    expect(config.db.host).toBe('localhost');
    expect(config.db.password).toBe('p');
    expect(config.db.user).toBe('u');
    expect(config.db.database).toBe('name');
    expect(config.db.schema).toBe('public');
});
test('Actual config values takes precedence over environment variables', () => {
    process.env.DATABASE_URL = 'postgres://test:5432/name';
    process.env.NODE_ENV = 'production';
    const config = (0, create_config_1.createConfig)({
        databaseUrl: 'postgres://test:1234/othername',
    });
    expect(config.db.port).toBe(1234);
    expect(config.db.database).toBe('othername');
});
test('should validate getLogger', () => {
    const getLogger = () => { };
    expect(() => {
        // @ts-ignore
        (0, create_config_1.createConfig)({ getLogger });
    }).toThrow();
});
test('should allow setting pool size', () => {
    const min = 4;
    const max = 20;
    const db = {
        user: 'db_user',
        password: 'db_password',
        host: 'db-host',
        port: 5432,
        database: 'unleash',
        driver: 'postgres',
        schema: 'public',
        pool: {
            min,
            max,
        },
        disableMigration: false,
    };
    const config = (0, create_config_1.createConfig)({ db });
    expect(config.db.pool.min).toBe(min);
    expect(config.db.pool.max).toBe(max);
    expect(config.db.driver).toBe('postgres');
});
test('Can set baseUriPath', () => {
    const baseUriPath = '/some';
    const config = (0, create_config_1.createConfig)({ server: { baseUriPath } });
    expect(config.server.baseUriPath).toBe(baseUriPath);
});
test('can convert both upper and lowercase string to enum', () => {
    expect((0, create_config_1.authTypeFromString)('demo')).toBe(option_1.IAuthType.DEMO);
    expect((0, create_config_1.authTypeFromString)('DEMO')).toBe(option_1.IAuthType.DEMO);
    expect((0, create_config_1.authTypeFromString)('DeMo')).toBe(option_1.IAuthType.DEMO);
    expect((0, create_config_1.authTypeFromString)('open_source')).toBe(option_1.IAuthType.OPEN_SOURCE);
    expect((0, create_config_1.authTypeFromString)('OPEN_SOURCE')).toBe(option_1.IAuthType.OPEN_SOURCE);
    expect((0, create_config_1.authTypeFromString)('ENTERPRISE')).toBe(option_1.IAuthType.ENTERPRISE);
    expect((0, create_config_1.authTypeFromString)('enterprise')).toBe(option_1.IAuthType.ENTERPRISE);
    expect((0, create_config_1.authTypeFromString)('custom')).toBe(option_1.IAuthType.CUSTOM);
    expect((0, create_config_1.authTypeFromString)('CUSTOM')).toBe(option_1.IAuthType.CUSTOM);
    expect((0, create_config_1.authTypeFromString)('none')).toBe(option_1.IAuthType.NONE);
    expect((0, create_config_1.authTypeFromString)('NONE')).toBe(option_1.IAuthType.NONE);
    expect((0, create_config_1.authTypeFromString)('unknown-string')).toBe(option_1.IAuthType.OPEN_SOURCE);
});
test('Can set auth type programmatically with a string', () => {
    const config = (0, create_config_1.createConfig)({
        authentication: {
            // @ts-ignore
            type: 'demo',
        },
    });
    expect(config.authentication.type).toBe(option_1.IAuthType.DEMO);
});
test('should use DATABASE_URL_FILE from env', () => {
    const databaseUrl = 'postgres://u:p@localhost:5432/name';
    const path = '/tmp/db_url';
    fs.writeFileSync(path, databaseUrl, { mode: 0o755 });
    delete process.env.NODE_ENV;
    process.env.DATABASE_URL_FILE = path;
    const config = (0, create_config_1.createConfig)({});
    expect(config.db.host).toBe('localhost');
    expect(config.db.password).toBe('p');
    expect(config.db.user).toBe('u');
    expect(config.db.database).toBe('name');
    expect(config.db.schema).toBe('public');
});
//# sourceMappingURL=create-config.test.js.map