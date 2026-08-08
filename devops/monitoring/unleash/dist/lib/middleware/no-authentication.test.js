"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const no_authentication_1 = __importDefault(require("./no-authentication"));
test('should add dummy user object to all requests', () => {
    expect.assertions(1);
    const app = (0, express_1.default)();
    (0, no_authentication_1.default)('', app);
    app.get('/api/admin/test', (req, res) => {
        const user = { ...req.user };
        return res.status(200).json(user).end();
    });
    const request = (0, supertest_1.default)(app);
    return request
        .get('/api/admin/test')
        .expect(200)
        .expect((res) => {
        expect(res.body.username === 'unknown').toBe(true);
    });
});
//# sourceMappingURL=no-authentication.test.js.map