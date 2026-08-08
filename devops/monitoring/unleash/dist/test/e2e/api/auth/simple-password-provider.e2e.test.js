"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_config_1 = require("../../../config/test-config");
const types_1 = require("../../../../lib/types");
const user_service_1 = __importDefault(require("../../../../lib/services/user-service"));
const access_service_1 = require("../../../../lib/services/access-service");
const test_helper_1 = require("../../helpers/test-helper");
const database_init_1 = __importDefault(require("../../helpers/database-init"));
const no_logger_1 = __importDefault(require("../../../fixtures/no-logger"));
const email_service_1 = require("../../../../lib/services/email-service");
const session_service_1 = __importDefault(require("../../../../lib/services/session-service"));
const model_1 = require("../../../../lib/types/model");
const setting_service_1 = __importDefault(require("../../../../lib/services/setting-service"));
const group_service_1 = require("../../../../lib/services/group-service");
const reset_token_service_1 = __importDefault(require("../../../../lib/services/reset-token-service"));
const features_1 = require("../../../../lib/features");
let app;
let stores;
let db;
const config = (0, test_config_1.createTestConfig)({
    getLogger: no_logger_1.default,
    server: {
        unleashUrl: 'http://localhost:3000',
        baseUriPath: '',
    },
    email: {
        host: 'test',
    },
});
const password = 'DtUYwi&l5I1KX4@Le';
let userService;
let adminUser;
beforeAll(async () => {
    db = await (0, database_init_1.default)('simple_password_provider_api_serial', no_logger_1.default);
    stores = db.stores;
    app = await (0, test_helper_1.setupApp)(stores);
    const eventService = (0, features_1.createEventsService)(db.rawDatabase, config);
    const groupService = new group_service_1.GroupService(stores, config, eventService);
    const accessService = new access_service_1.AccessService(stores, config, groupService, eventService);
    const resetTokenService = new reset_token_service_1.default(stores, config);
    const emailService = new email_service_1.EmailService(config);
    const sessionService = new session_service_1.default(stores, config);
    const settingService = new setting_service_1.default(stores, config, eventService);
    userService = new user_service_1.default(stores, config, {
        accessService,
        resetTokenService,
        emailService,
        eventService,
        sessionService,
        settingService,
    });
    const adminRole = await accessService.getPredefinedRole(model_1.RoleName.ADMIN);
    adminUser = await userService.createUser({
        username: 'admin@test.com',
        email: 'admin@test.com',
        rootRole: adminRole.id,
        password: password,
    }, types_1.TEST_AUDIT_USER);
});
beforeEach(async () => {
    app = await (0, test_helper_1.setupApp)(stores);
});
afterEach(async () => {
    await app.destroy();
});
afterAll(async () => {
    await db.destroy();
});
test('Can log in', async () => {
    await app.request
        .post('/auth/simple/login')
        .send({
        username: adminUser.username,
        password,
    })
        .expect(200);
});
test('Gets rate limited after 10 tries', async () => {
    for (const statusCode of [...Array(10).fill(200), 429]) {
        await app.request
            .post('/auth/simple/login')
            .send({
            username: adminUser.username,
            password,
        })
            .expect(statusCode);
    }
});
//# sourceMappingURL=simple-password-provider.e2e.test.js.map