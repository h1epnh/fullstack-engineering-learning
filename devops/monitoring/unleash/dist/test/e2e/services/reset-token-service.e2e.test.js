"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../helpers/database-init"));
const no_logger_1 = __importDefault(require("../../fixtures/no-logger"));
const reset_token_service_1 = __importDefault(require("../../../lib/services/reset-token-service"));
const user_service_1 = __importDefault(require("../../../lib/services/user-service"));
const access_service_1 = require("../../../lib/services/access-service");
const email_service_1 = require("../../../lib/services/email-service");
const test_config_1 = require("../../config/test-config");
const session_service_1 = __importDefault(require("../../../lib/services/session-service"));
const invalid_token_error_1 = __importDefault(require("../../../lib/error/invalid-token-error"));
const setting_service_1 = __importDefault(require("../../../lib/services/setting-service"));
const fake_setting_store_1 = __importDefault(require("../../fixtures/fake-setting-store"));
const group_service_1 = require("../../../lib/services/group-service");
const types_1 = require("../../../lib/types");
const features_1 = require("../../../lib/features");
const config = (0, test_config_1.createTestConfig)();
let stores;
let db;
let adminUser;
let userToCreateResetFor;
let userIdToCreateResetFor;
let accessService;
let userService;
let resetTokenService;
let sessionService;
beforeAll(async () => {
    db = await (0, database_init_1.default)('reset_token_service_serial', no_logger_1.default);
    stores = db.stores;
    const eventService = (0, features_1.createEventsService)(db.rawDatabase, config);
    const groupService = new group_service_1.GroupService(stores, config, eventService);
    accessService = new access_service_1.AccessService(stores, config, groupService, eventService);
    resetTokenService = new reset_token_service_1.default(stores, config);
    sessionService = new session_service_1.default(stores, config);
    const emailService = new email_service_1.EmailService(config);
    const settingService = new setting_service_1.default({
        settingStore: new fake_setting_store_1.default(),
    }, config, eventService);
    userService = new user_service_1.default(stores, config, {
        accessService,
        resetTokenService,
        emailService,
        eventService,
        sessionService,
        settingService,
    });
    adminUser = await userService.createUser({
        username: 'admin@test.com',
        rootRole: 1,
    }, types_1.TEST_AUDIT_USER);
    userToCreateResetFor = await userService.createUser({
        username: 'test@test.com',
        rootRole: 2,
    }, types_1.TEST_AUDIT_USER);
    userIdToCreateResetFor = userToCreateResetFor.id;
});
afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});
test('Should create a reset link', async () => {
    const url = await resetTokenService.createResetPasswordUrl(userIdToCreateResetFor, adminUser.username);
    expect(url.toString().substring(0, url.toString().indexOf('='))).toBe(`${config.server.unleashUrl}/reset-password?token`);
});
test('Should create a reset link with unleashUrl with context path', async () => {
    const localConfig = (0, test_config_1.createTestConfig)({
        server: { unleashUrl: 'http://localhost:4242/my/sub/path' },
    });
    const resetToken = new reset_token_service_1.default(stores, localConfig);
    const url = await resetToken.createResetPasswordUrl(userIdToCreateResetFor, adminUser.username);
    expect(url.toString().substring(0, url.toString().indexOf('='))).toBe(`${localConfig.server.unleashUrl}/reset-password?token`);
});
test('Should create a welcome link', async () => {
    const url = await resetTokenService.createNewUserUrl(userIdToCreateResetFor, adminUser.username);
    const urlS = url.toString();
    expect(urlS.substring(0, urlS.indexOf('='))).toBe(`${config.server.unleashUrl}/new-user?token`);
});
test('Tokens should be one-time only', async () => {
    const token = await resetTokenService.createToken(userIdToCreateResetFor, adminUser.username);
    const accessGranted = await resetTokenService.useAccessToken(token);
    expect(accessGranted).toBe(true);
    const secondGo = await resetTokenService.useAccessToken(token);
    expect(secondGo).toBe(false);
});
test('Creating a new token should expire older tokens', async () => {
    const firstToken = await resetTokenService.createToken(userIdToCreateResetFor, adminUser.username);
    const secondToken = await resetTokenService.createToken(userIdToCreateResetFor, adminUser.username);
    await expect(async () => resetTokenService.isValid(firstToken.token)).rejects.toThrow(invalid_token_error_1.default);
    const validToken = await resetTokenService.isValid(secondToken.token);
    expect(secondToken.token).toBe(validToken.token);
});
test('Retrieving valid invitation links should retrieve an object with userid key and token value', async () => {
    const token = await resetTokenService.createToken(userIdToCreateResetFor, adminUser.username);
    expect(token).toBeTruthy();
    const activeInvitations = await resetTokenService.getActiveInvitations();
    expect(Object.keys(activeInvitations).length === 1).toBe(true);
    expect(+Object.keys(activeInvitations)[0] === userIdToCreateResetFor).toBe(true);
    expect(activeInvitations[userIdToCreateResetFor]).toBeTruthy();
});
//# sourceMappingURL=reset-token-service.e2e.test.js.map