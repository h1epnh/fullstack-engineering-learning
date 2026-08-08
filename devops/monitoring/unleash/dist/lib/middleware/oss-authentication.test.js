"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const services_1 = require("../services");
const test_config_1 = require("../../test/config/test-config");
const store_1 = __importDefault(require("../../test/fixtures/store"));
const oss_authentication_1 = __importDefault(require("./oss-authentication"));
const app_1 = __importDefault(require("../app"));
const user_1 = __importDefault(require("../types/user"));
const session_db_1 = __importDefault(require("./session-db"));
const getLogger = (() => ({ debug() { } }));
async function getSetup(preRouterHook) {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const config = (0, test_config_1.createTestConfig)({
        server: { baseUriPath: base },
        preRouterHook: (_app) => {
            preRouterHook(_app);
            (0, oss_authentication_1.default)(_app, getLogger, base);
            _app.get(`${base}/api/protectedResource`, (req, res) => {
                res.status(200).json({ message: 'OK' }).end();
            });
        },
    });
    const stores = (0, store_1.default)();
    const services = (0, services_1.createServices)(stores, config);
    const unleashSession = (0, session_db_1.default)(config, {});
    const app = await (0, app_1.default)(config, stores, services, unleashSession);
    return {
        base,
        request: (0, supertest_1.default)(app),
    };
}
test('should return 401 when missing user', async () => {
    expect.assertions(0);
    const { base, request } = await getSetup(() => { });
    return request.get(`${base}/api/protectedResource`).expect(401);
});
test('should return 200 when user exists', async () => {
    expect.assertions(0);
    const user = new user_1.default({ id: 1, email: 'some@mail.com' });
    const { base, request } = await getSetup((app) => app.use((req, res, next) => {
        req.user = user;
        next();
    }));
    return request.get(`${base}/api/protectedResource`).expect(200);
});
//# sourceMappingURL=oss-authentication.test.js.map