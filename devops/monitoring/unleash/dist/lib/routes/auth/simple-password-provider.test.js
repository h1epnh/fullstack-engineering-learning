"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("../../types/user"));
const simple_password_provider_1 = require("./simple-password-provider");
const password_mismatch_1 = __importDefault(require("../../error/password-mismatch"));
const test_config_1 = require("../../../test/config/test-config");
const openapi_service_1 = require("../../services/openapi-service");
test('Should require password', async () => {
    const config = (0, test_config_1.createTestConfig)();
    const openApiService = new openapi_service_1.OpenApiService(config);
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    const userService = () => { };
    const ctr = new simple_password_provider_1.SimplePasswordProvider(config, {
        // @ts-expect-error
        userService,
        openApiService,
    });
    app.use('/auth/simple', ctr.router);
    const res = await (0, supertest_1.default)(app)
        .post('/auth/simple/login')
        .send({ name: 'john' });
    expect(400).toBe(res.status);
});
test('Should login user', async () => {
    const config = (0, test_config_1.createTestConfig)();
    const openApiService = new openapi_service_1.OpenApiService(config);
    const username = 'ola';
    const password = 'simplepass';
    const user = new user_1.default({ id: 123, username });
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use((req, res, next) => {
        // @ts-expect-error
        req.session = {};
        next();
    });
    const userService = {
        loginUser: (u, p) => {
            if (u === username && p === password) {
                return user;
            }
            throw new Error('Wrong password');
        },
    };
    const ctr = new simple_password_provider_1.SimplePasswordProvider(config, {
        // @ts-expect-error
        userService,
        openApiService,
    });
    app.use('/auth/simple', ctr.router);
    const res = await (0, supertest_1.default)(app)
        .post('/auth/simple/login')
        .send({ username, password });
    expect(200).toBe(res.status);
    expect(user.username).toBe(res.body.username);
});
test('Should not login user with wrong password', async () => {
    const config = (0, test_config_1.createTestConfig)();
    const openApiService = new openapi_service_1.OpenApiService(config);
    const username = 'ola';
    const password = 'simplepass';
    const user = new user_1.default({ id: 133, username });
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use((req, res, next) => {
        // @ts-expect-error
        req.session = {};
        next();
    });
    const userService = {
        loginUser: (u, p) => {
            if (u === username && p === password) {
                return user;
            }
            throw new password_mismatch_1.default();
        },
    };
    const ctr = new simple_password_provider_1.SimplePasswordProvider(config, {
        // @ts-expect-error
        userService,
        openApiService,
    });
    app.use('/auth/simple', ctr.router);
    const res = await (0, supertest_1.default)(app)
        .post('/auth/simple/login')
        .send({ username, password: 'not-correct' });
    expect(res.status).toBe(401);
});
//# sourceMappingURL=simple-password-provider.test.js.map