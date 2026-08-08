"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const audit_middleware_1 = require("./audit-middleware");
const test_config_1 = require("../../test/config/test-config");
const express_1 = __importDefault(require("express"));
const no_authentication_1 = __importDefault(require("./no-authentication"));
const supertest_1 = __importDefault(require("supertest"));
const config = (0, test_config_1.createTestConfig)();
describe('auditMiddleware testing', () => {
    test('Adds username and id from an IAuthRequest', async () => {
        const middleware = (0, audit_middleware_1.auditAccessMiddleware)(config);
        const app = (0, express_1.default)();
        (0, no_authentication_1.default)('', app);
        app.use('', middleware);
        let audit;
        app.get('/api/admin/test', (req, res) => {
            audit = req.audit;
            res.status(200).end();
        });
        const request = (0, supertest_1.default)(app);
        await request.get('/api/admin/test').expect(200);
        expect(audit).toBeDefined();
        expect(audit.id).toBe(-1);
        expect(audit.username).toBe('unknown');
        expect(audit.ip).toBe('::ffff:127.0.0.1');
    });
    test('If no auth in place, does not add the audit object', async () => {
        const middleware = (0, audit_middleware_1.auditAccessMiddleware)(config);
        const app = (0, express_1.default)();
        app.use('', middleware);
        let audit;
        app.get('/api/admin/test', (req, res) => {
            audit = req.audit;
            res.status(200).end();
        });
        const request = (0, supertest_1.default)(app);
        await request.get('/api/admin/test').expect(200);
        expect(audit).toBeUndefined();
    });
});
//# sourceMappingURL=audit-middleware.test.js.map