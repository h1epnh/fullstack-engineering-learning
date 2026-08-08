"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("./helpers/database-init"));
const test_helper_1 = require("./helpers/test-helper");
const types_1 = require("../../lib/types");
let db;
let stores;
const preHook = (app, config, { userService, accessService, }) => {
    app.use('/api/admin/', async (req, res, next) => {
        const role = await accessService.getPredefinedRole(types_1.RoleName.EDITOR);
        req.user = await userService.createUser({
            email: 'editor2@example.com',
            rootRole: role.id,
        });
        next();
    });
};
beforeAll(async () => {
    db = await (0, database_init_1.default)('custom_auth_serial');
    stores = db.stores;
});
afterAll(async () => {
    await db.destroy();
});
test('Using custom auth type without defining custom middleware causes default DENY ALL policy to take effect', async () => {
    jest.spyOn(global.console, 'error').mockImplementation(() => jest.fn());
    const { request, destroy } = await (0, test_helper_1.setupAppWithCustomAuth)(stores, undefined);
    await request
        .get('/api/admin/projects')
        .expect(401)
        .expect((res) => {
        expect(res.body.error).toBe('You have to configure a custom authentication middleware. Read https://docs.getunleash.io/docs/reference/deploy/configuring-unleash for more details');
    });
    await destroy();
});
test('If actually configuring a custom middleware should configure the middleware', async () => {
    expect.assertions(0);
    const { request, destroy } = await (0, test_helper_1.setupAppWithCustomAuth)(stores, preHook);
    await request.get('/api/admin/projects').expect(200);
    await destroy();
});
//# sourceMappingURL=custom-auth.test.js.map