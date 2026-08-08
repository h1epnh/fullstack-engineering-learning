"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const conditional_middleware_1 = require("../../../../lib/middleware/conditional-middleware");
const supertest_1 = __importDefault(require("supertest"));
test('disabled middleware should not block paths that use the same path', async () => {
    const app = (0, express_1.default)();
    const path = '/api/admin/projects';
    app.use(path, (0, conditional_middleware_1.conditionalMiddleware)(() => false, (req, res) => {
        res.send({ changeRequest: 'hello' });
    }));
    app.get(path, (req, res) => {
        res.json({ projects: [] });
    });
    await (0, supertest_1.default)(app)
        .get('/api/admin/projects')
        .expect(200, { projects: [] });
});
test('should return 404 when path is not enabled', async () => {
    const app = (0, express_1.default)();
    const path = '/api/admin/projects';
    app.use(`${path}/change-requests`, (0, conditional_middleware_1.conditionalMiddleware)(() => false, (req, res) => {
        res.send({ changeRequest: 'hello' });
    }));
    app.get(path, (req, res) => {
        res.json({ projects: [] });
    });
    await (0, supertest_1.default)(app).get('/api/admin/projects/change-requests').expect(404);
});
test('should respect ordering of endpoints', async () => {
    const app = (0, express_1.default)();
    const path = '/api/admin/projects';
    app.use(path, (0, conditional_middleware_1.conditionalMiddleware)(() => true, (req, res) => {
        res.json({ name: 'Request changes' });
    }));
    app.get(path, (req, res) => {
        res.json({ projects: [] });
    });
    await (0, supertest_1.default)(app)
        .get('/api/admin/projects')
        .expect(200, { name: 'Request changes' });
});
test('disabled middleware should not block paths that use the same basepath', async () => {
    const app = (0, express_1.default)();
    const path = '/api/admin/projects';
    app.use(`${path}/change-requests`, (0, conditional_middleware_1.conditionalMiddleware)(() => false, (req, res) => {
        res.json({ name: 'Request changes' });
    }));
    app.get(path, (req, res) => {
        res.json({ projects: [] });
    });
    await (0, supertest_1.default)(app)
        .get('/api/admin/projects')
        .expect(200, { projects: [] });
});
//# sourceMappingURL=conditional-middleware.e2e.test.js.map