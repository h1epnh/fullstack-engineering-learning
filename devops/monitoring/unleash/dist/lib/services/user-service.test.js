"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
const user_service_1 = __importDefault(require("./user-service"));
const fake_user_store_1 = __importDefault(require("../../test/fixtures/fake-user-store"));
const access_service_mock_1 = __importDefault(require("../../test/fixtures/access-service-mock"));
const reset_token_service_1 = __importDefault(require("./reset-token-service"));
const email_service_1 = require("./email-service");
const owasp_validation_error_1 = __importDefault(require("../error/owasp-validation-error"));
const test_config_1 = require("../../test/config/test-config");
const session_service_1 = __importDefault(require("./session-service"));
const fake_session_store_1 = __importDefault(require("../../test/fixtures/fake-session-store"));
const user_1 = __importDefault(require("../types/user"));
const fake_reset_token_store_1 = __importDefault(require("../../test/fixtures/fake-reset-token-store"));
const setting_service_1 = __importDefault(require("./setting-service"));
const fake_setting_store_1 = __importDefault(require("../../test/fixtures/fake-setting-store"));
const util_1 = require("../util");
const features_1 = require("../features");
const config = (0, test_config_1.createTestConfig)();
const systemUser = new user_1.default({ id: -1, username: 'system' });
test.each([undefined, 'test-unleash@example.com', 'top-level-domain@jp'])('Should create new user with email %s', async (email) => {
    const userStore = new fake_user_store_1.default();
    const accessService = new access_service_mock_1.default();
    const resetTokenStore = new fake_reset_token_store_1.default();
    const resetTokenService = new reset_token_service_1.default({ resetTokenStore }, config);
    const sessionStore = new fake_session_store_1.default();
    const sessionService = new session_service_1.default({ sessionStore }, config);
    const emailService = new email_service_1.EmailService(config);
    const eventService = (0, features_1.createFakeEventsService)(config);
    const settingService = new setting_service_1.default({
        settingStore: new fake_setting_store_1.default(),
    }, config, eventService);
    const service = new user_service_1.default({ userStore }, config, {
        accessService,
        resetTokenService,
        emailService,
        eventService,
        sessionService,
        settingService,
    });
    const user = await service.createUser({
        username: 'test',
        rootRole: 1,
        email,
    }, (0, util_1.extractAuditInfoFromUser)(systemUser));
    const storedUser = await userStore.get(user.id);
    const allUsers = await userStore.getAll();
    expect(user.id).toBeTruthy();
    expect(user.username).toBe('test');
    expect(allUsers.length).toBe(1);
    expect(storedUser.username).toBe('test');
});
describe('Default admin initialization', () => {
    const DEFAULT_ADMIN_USERNAME = 'admin';
    const DEFAULT_ADMIN_PASSWORD = 'unleash4all';
    const CUSTOM_ADMIN_USERNAME = 'custom-admin';
    const CUSTOM_ADMIN_PASSWORD = 'custom-password';
    let userService;
    const sendGettingStartedMailMock = jest.fn();
    beforeEach(() => {
        jest.clearAllMocks();
        const userStore = new fake_user_store_1.default();
        const accessService = new access_service_mock_1.default();
        const resetTokenStore = new fake_reset_token_store_1.default();
        const resetTokenService = new reset_token_service_1.default({ resetTokenStore }, config);
        const emailService = new email_service_1.EmailService(config);
        emailService.configured = jest.fn(() => true);
        emailService.sendGettingStartedMail = sendGettingStartedMailMock;
        const sessionStore = new fake_session_store_1.default();
        const sessionService = new session_service_1.default({ sessionStore }, config);
        const eventService = (0, features_1.createFakeEventsService)(config);
        const settingService = new setting_service_1.default({
            settingStore: new fake_setting_store_1.default(),
        }, config, eventService);
        userService = new user_service_1.default({ userStore }, config, {
            accessService,
            resetTokenService,
            emailService,
            eventService,
            sessionService,
            settingService,
        });
    });
    test('Should create default admin user if `createAdminUser` is true and `initialAdminUser` is not set', async () => {
        await userService.initAdminUser({ createAdminUser: true });
        const user = await userService.loginUser(DEFAULT_ADMIN_USERNAME, DEFAULT_ADMIN_PASSWORD);
        expect(user.username).toBe(DEFAULT_ADMIN_USERNAME);
    });
    test('Should create custom default admin user if `createAdminUser` is true and `initialAdminUser` is set', async () => {
        await userService.initAdminUser({
            createAdminUser: true,
            initialAdminUser: {
                username: CUSTOM_ADMIN_USERNAME,
                password: CUSTOM_ADMIN_PASSWORD,
            },
        });
        await expect(userService.loginUser(DEFAULT_ADMIN_USERNAME, DEFAULT_ADMIN_PASSWORD)).rejects.toThrow('The combination of password and username you provided is invalid');
        const user = await userService.loginUser(CUSTOM_ADMIN_USERNAME, CUSTOM_ADMIN_PASSWORD);
        expect(user.username).toBe(CUSTOM_ADMIN_USERNAME);
    });
    test('Should not create any default admin user if `createAdminUser` is not true and `initialAdminUser` is not set', async () => {
        const userStore = new fake_user_store_1.default();
        const accessService = new access_service_mock_1.default();
        const resetTokenStore = new fake_reset_token_store_1.default();
        const resetTokenService = new reset_token_service_1.default({ resetTokenStore }, config);
        const emailService = new email_service_1.EmailService(config);
        const sessionStore = new fake_session_store_1.default();
        const sessionService = new session_service_1.default({ sessionStore }, config);
        const eventService = (0, features_1.createFakeEventsService)(config);
        const settingService = new setting_service_1.default({
            settingStore: new fake_setting_store_1.default(),
        }, config, eventService);
        const service = new user_service_1.default({ userStore }, config, {
            accessService,
            resetTokenService,
            emailService,
            eventService,
            sessionService,
            settingService,
        });
        await service.initAdminUser({});
        await expect(service.loginUser('admin', 'unleash4all')).rejects.toThrow('The combination of password and username you provided is invalid');
    });
    test('Should use the correct environment variables when initializing the default admin account', async () => {
        jest.resetModules();
        process.env.UNLEASH_DEFAULT_ADMIN_USERNAME = CUSTOM_ADMIN_USERNAME;
        process.env.UNLEASH_DEFAULT_ADMIN_PASSWORD = CUSTOM_ADMIN_PASSWORD;
        const config = (0, test_config_1.createTestConfig)();
        expect(config.authentication.initialAdminUser).toStrictEqual({
            username: CUSTOM_ADMIN_USERNAME,
            password: CUSTOM_ADMIN_PASSWORD,
        });
    });
});
test('Should be a valid password', async () => {
    const userStore = new fake_user_store_1.default();
    const accessService = new access_service_mock_1.default();
    const resetTokenStore = new fake_reset_token_store_1.default();
    const resetTokenService = new reset_token_service_1.default({ resetTokenStore }, config);
    const emailService = new email_service_1.EmailService(config);
    const sessionStore = new fake_session_store_1.default();
    const sessionService = new session_service_1.default({ sessionStore }, config);
    const eventService = (0, features_1.createFakeEventsService)(config);
    const settingService = new setting_service_1.default({
        settingStore: new fake_setting_store_1.default(),
    }, config, eventService);
    const service = new user_service_1.default({ userStore }, config, {
        accessService,
        resetTokenService,
        emailService,
        eventService,
        sessionService,
        settingService,
    });
    const valid = service.validatePassword('this is a strong password!');
    expect(valid).toBe(true);
});
test('Password must be at least 10 chars', async () => {
    const userStore = new fake_user_store_1.default();
    const accessService = new access_service_mock_1.default();
    const resetTokenStore = new fake_reset_token_store_1.default();
    const resetTokenService = new reset_token_service_1.default({ resetTokenStore }, config);
    const emailService = new email_service_1.EmailService(config);
    const sessionStore = new fake_session_store_1.default();
    const sessionService = new session_service_1.default({ sessionStore }, config);
    const eventService = (0, features_1.createFakeEventsService)(config);
    const settingService = new setting_service_1.default({
        settingStore: new fake_setting_store_1.default(),
    }, config, eventService);
    const service = new user_service_1.default({ userStore }, config, {
        accessService,
        resetTokenService,
        emailService,
        eventService,
        sessionService,
        settingService,
    });
    expect(() => service.validatePassword('admin')).toThrow('The password must be at least 10 characters long.');
    expect(() => service.validatePassword('qwertyabcde')).toThrowError(owasp_validation_error_1.default);
});
test('The password must contain at least one uppercase letter.', async () => {
    const userStore = new fake_user_store_1.default();
    const accessService = new access_service_mock_1.default();
    const resetTokenStore = new fake_reset_token_store_1.default();
    const resetTokenService = new reset_token_service_1.default({ resetTokenStore }, config);
    const emailService = new email_service_1.EmailService(config);
    const sessionStore = new fake_session_store_1.default();
    const sessionService = new session_service_1.default({ sessionStore }, config);
    const eventService = (0, features_1.createFakeEventsService)(config);
    const settingService = new setting_service_1.default({
        settingStore: new fake_setting_store_1.default(),
    }, config, eventService);
    const service = new user_service_1.default({ userStore }, config, {
        accessService,
        resetTokenService,
        emailService,
        eventService,
        sessionService,
        settingService,
    });
    expect(() => service.validatePassword('qwertyabcde')).toThrowError('The password must contain at least one uppercase letter.');
    expect(() => service.validatePassword('qwertyabcde')).toThrowError(owasp_validation_error_1.default);
});
test('The password must contain at least one number', async () => {
    const userStore = new fake_user_store_1.default();
    const accessService = new access_service_mock_1.default();
    const resetTokenStore = new fake_reset_token_store_1.default();
    const resetTokenService = new reset_token_service_1.default({ resetTokenStore }, config);
    const emailService = new email_service_1.EmailService(config);
    const sessionStore = new fake_session_store_1.default();
    const sessionService = new session_service_1.default({ sessionStore }, config);
    const eventService = (0, features_1.createFakeEventsService)(config);
    const settingService = new setting_service_1.default({
        settingStore: new fake_setting_store_1.default(),
    }, config, eventService);
    const service = new user_service_1.default({ userStore }, config, {
        accessService,
        resetTokenService,
        emailService,
        eventService,
        sessionService,
        settingService,
    });
    expect(() => service.validatePassword('qwertyabcdE')).toThrowError('The password must contain at least one number.');
    expect(() => service.validatePassword('qwertyabcdE')).toThrowError(owasp_validation_error_1.default);
});
test('The password must contain at least one special character', async () => {
    const userStore = new fake_user_store_1.default();
    const accessService = new access_service_mock_1.default();
    const resetTokenStore = new fake_reset_token_store_1.default();
    const resetTokenService = new reset_token_service_1.default({ resetTokenStore }, config);
    const emailService = new email_service_1.EmailService(config);
    const sessionStore = new fake_session_store_1.default();
    const sessionService = new session_service_1.default({ sessionStore }, config);
    const eventService = (0, features_1.createFakeEventsService)(config);
    const settingService = new setting_service_1.default({
        settingStore: new fake_setting_store_1.default(),
    }, config, eventService);
    const service = new user_service_1.default({ userStore }, config, {
        accessService,
        resetTokenService,
        emailService,
        eventService,
        sessionService,
        settingService,
    });
    expect(() => service.validatePassword('qwertyabcdE2')).toThrowError('The password must contain at least one special character.');
    expect(() => service.validatePassword('qwertyabcdE2')).toThrowError(owasp_validation_error_1.default);
});
test('Should be a valid password with special chars', async () => {
    const userStore = new fake_user_store_1.default();
    const accessService = new access_service_mock_1.default();
    const resetTokenStore = new fake_reset_token_store_1.default();
    const resetTokenService = new reset_token_service_1.default({ resetTokenStore }, config);
    const emailService = new email_service_1.EmailService(config);
    const sessionStore = new fake_session_store_1.default();
    const sessionService = new session_service_1.default({ sessionStore }, config);
    const eventService = (0, features_1.createFakeEventsService)(config);
    const settingService = new setting_service_1.default({
        settingStore: new fake_setting_store_1.default(),
    }, config, eventService);
    const service = new user_service_1.default({ userStore }, config, {
        accessService,
        resetTokenService,
        emailService,
        eventService,
        sessionService,
        settingService,
    });
    const valid = service.validatePassword('this is a strong password!');
    expect(valid).toBe(true);
});
test('Should send password reset email if user exists', async () => {
    const userStore = new fake_user_store_1.default();
    const accessService = new access_service_mock_1.default();
    const resetTokenStore = new fake_reset_token_store_1.default();
    const resetTokenService = new reset_token_service_1.default({ resetTokenStore }, config);
    const emailService = new email_service_1.EmailService(config);
    const sessionStore = new fake_session_store_1.default();
    const sessionService = new session_service_1.default({ sessionStore }, config);
    const eventService = (0, features_1.createFakeEventsService)(config);
    const settingService = new setting_service_1.default({
        settingStore: new fake_setting_store_1.default(),
    }, config, eventService);
    const service = new user_service_1.default({ userStore }, config, {
        accessService,
        resetTokenService,
        emailService,
        eventService,
        sessionService,
        settingService,
    });
    const unknownUser = service.createResetPasswordEmail('unknown@example.com');
    expect(unknownUser).rejects.toThrowError('Could not find user');
    await userStore.insert({
        id: 123,
        name: 'User',
        username: 'Username',
        email: 'known@example.com',
        permissions: [],
        imageUrl: '',
        seenAt: new Date(),
        loginAttempts: 0,
        createdAt: new Date(),
        isAPI: false,
        generateImageUrl: () => '',
    });
    const knownUser = service.createResetPasswordEmail('known@example.com');
    expect(knownUser).resolves.toBeInstanceOf(url_1.URL);
});
test('Should throttle password reset email', async () => {
    const userStore = new fake_user_store_1.default();
    const accessService = new access_service_mock_1.default();
    const resetTokenStore = new fake_reset_token_store_1.default();
    const resetTokenService = new reset_token_service_1.default({ resetTokenStore }, config);
    const emailService = new email_service_1.EmailService(config);
    const sessionStore = new fake_session_store_1.default();
    const sessionService = new session_service_1.default({ sessionStore }, config);
    const eventService = (0, features_1.createFakeEventsService)(config);
    const settingService = new setting_service_1.default({
        settingStore: new fake_setting_store_1.default(),
    }, config, eventService);
    const service = new user_service_1.default({ userStore }, config, {
        accessService,
        resetTokenService,
        emailService,
        eventService,
        sessionService,
        settingService,
    });
    await userStore.insert({
        id: 123,
        name: 'User',
        username: 'Username',
        email: 'known@example.com',
        permissions: [],
        imageUrl: '',
        seenAt: new Date(),
        loginAttempts: 0,
        createdAt: new Date(),
        isAPI: false,
        generateImageUrl: () => '',
    });
    jest.useFakeTimers();
    const attempt1 = service.createResetPasswordEmail('known@example.com');
    await expect(attempt1).resolves.toBeInstanceOf(url_1.URL);
    const attempt2 = service.createResetPasswordEmail('known@example.com');
    await expect(attempt2).rejects.toThrow('You can only send one new reset password email per minute, per user. Please try again later.');
    jest.runAllTimers();
    const attempt3 = service.createResetPasswordEmail('known@example.com');
    await expect(attempt3).resolves.toBeInstanceOf(url_1.URL);
});
//# sourceMappingURL=user-service.test.js.map