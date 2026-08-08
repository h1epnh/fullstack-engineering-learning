"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../helpers/database-init"));
const no_logger_1 = __importDefault(require("../../fixtures/no-logger"));
const user_service_1 = __importDefault(require("../../../lib/services/user-service"));
const access_service_1 = require("../../../lib/services/access-service");
const reset_token_service_1 = __importDefault(require("../../../lib/services/reset-token-service"));
const email_service_1 = require("../../../lib/services/email-service");
const test_config_1 = require("../../config/test-config");
const session_service_1 = __importDefault(require("../../../lib/services/session-service"));
const notfound_error_1 = __importDefault(require("../../../lib/error/notfound-error"));
const model_1 = require("../../../lib/types/model");
const setting_service_1 = __importDefault(require("../../../lib/services/setting-service"));
const simple_auth_settings_1 = require("../../../lib/types/settings/simple-auth-settings");
const date_fns_1 = require("date-fns");
const group_service_1 = require("../../../lib/services/group-service");
const error_1 = require("../../../lib/error");
const password_mismatch_1 = __importDefault(require("../../../lib/error/password-mismatch"));
const types_1 = require("../../../lib/types");
const util_1 = require("../../../lib/util");
const password_previously_used_1 = require("../../../lib/error/password-previously-used");
const features_1 = require("../../../lib/features");
const metric_events_1 = require("../../../lib/metric-events");
let db;
let stores;
let userService;
let userStore;
let adminRole;
let viewerRole;
let customRole;
let sessionService;
let settingService;
let eventService;
let accessService;
let eventBus;
const allowedSessions = 2;
beforeAll(async () => {
    db = await (0, database_init_1.default)('user_service_serial', no_logger_1.default);
    stores = db.stores;
    const config = (0, test_config_1.createTestConfig)({
        session: { maxParallelSessions: allowedSessions },
    });
    eventBus = config.eventBus;
    eventService = (0, features_1.createEventsService)(db.rawDatabase, config);
    const groupService = new group_service_1.GroupService(stores, config, eventService);
    accessService = new access_service_1.AccessService(stores, config, groupService, eventService);
    const resetTokenService = new reset_token_service_1.default(stores, config);
    const emailService = new email_service_1.EmailService(config);
    sessionService = new session_service_1.default(stores, config);
    settingService = new setting_service_1.default(stores, config, eventService);
    userService = new user_service_1.default(stores, config, {
        accessService,
        resetTokenService,
        emailService,
        eventService,
        sessionService,
        settingService,
    });
    userStore = stores.userStore;
    const rootRoles = await accessService.getRootRoles();
    adminRole = rootRoles.find((r) => r.name === model_1.RoleName.ADMIN);
    viewerRole = rootRoles.find((r) => r.name === model_1.RoleName.VIEWER);
    customRole = await accessService.createRole({
        name: 'Custom role',
        type: util_1.CUSTOM_ROOT_ROLE_TYPE,
        description: 'A custom role',
        permissions: [
            {
                name: types_1.CREATE_ADDON,
            },
        ],
        createdByUserId: 1,
    }, types_1.SYSTEM_USER_AUDIT);
});
afterAll(async () => {
    await db.destroy();
});
beforeEach(async () => {
    await userStore.deleteAll();
    await settingService.deleteAll();
});
test('should create initial admin user', async () => {
    await userService.initAdminUser({
        createAdminUser: true,
    });
    await expect(async () => userService.loginUser('admin', 'wrong-password')).rejects.toThrow(Error);
    await expect(async () => userService.loginUser('admin', 'unleash4all')).toBeTruthy();
});
test('should not init default user if we already have users', async () => {
    await userService.createUser({
        username: 'test',
        password: 'A very strange P4ssw0rd_',
        rootRole: adminRole.id,
    }, types_1.SYSTEM_USER_AUDIT);
    await userService.initAdminUser({
        createAdminUser: true,
    });
    const users = await userService.getAll();
    expect(users).toHaveLength(1);
    expect(users[0].username).toBe('test');
    await expect(async () => userService.loginUser('admin', 'unleash4all')).rejects.toThrow(Error);
});
test('should not be allowed to create existing user', async () => {
    await userStore.insert({ username: 'test', name: 'Hans Mola' });
    await expect(async () => userService.createUser({ username: 'test', rootRole: adminRole.id }, types_1.TEST_AUDIT_USER)).rejects.toThrow(Error);
});
test('should create user with password', async () => {
    const recordedEvents = [];
    eventBus.on(metric_events_1.USER_LOGIN, (data) => {
        recordedEvents.push(data);
    });
    await userService.createUser({
        username: 'test',
        password: 'A very strange P4ssw0rd_',
        rootRole: adminRole.id,
    }, types_1.TEST_AUDIT_USER);
    const user = await userService.loginUser('test', 'A very strange P4ssw0rd_');
    expect(user.username).toBe('test');
    expect(recordedEvents).toEqual([{ loginOrder: 0 }]);
});
test('should create user with rootRole in audit-log', async () => {
    const user = await userService.createUser({
        username: 'test',
        rootRole: viewerRole.id,
    }, types_1.TEST_AUDIT_USER);
    const { events } = await eventService.getEvents();
    expect(events[0].type).toBe(types_1.USER_CREATED);
    expect(events[0].data.id).toBe(user.id);
    expect(events[0].data.username).toBe('test');
    expect(events[0].data.rootRole).toBe(viewerRole.id);
});
test('should update user with rootRole in audit-log', async () => {
    const user = await userService.createUser({
        username: 'test',
        rootRole: viewerRole.id,
    }, types_1.TEST_AUDIT_USER);
    await userService.updateUser({ id: user.id, rootRole: adminRole.id }, types_1.TEST_AUDIT_USER);
    const { events } = await eventService.getEvents();
    expect(events[0].type).toBe(types_1.USER_UPDATED);
    expect(events[0].data.id).toBe(user.id);
    expect(events[0].data.username).toBe('test');
    expect(events[0].data.rootRole).toBe(adminRole.id);
});
test('should remove user with rootRole in audit-log', async () => {
    const user = await userService.createUser({
        username: 'test',
        rootRole: viewerRole.id,
    }, types_1.TEST_AUDIT_USER);
    await userService.deleteUser(user.id, types_1.TEST_AUDIT_USER);
    const { events } = await eventService.getEvents();
    expect(events[0].type).toBe(types_1.USER_DELETED);
    expect(events[0].preData.id).toBe(user.id);
    expect(events[0].preData.username).toBe('test');
    expect(events[0].preData.rootRole).toBe(viewerRole.id);
});
test('should not be able to login with deleted user', async () => {
    const user = await userService.createUser({
        username: 'deleted_user',
        password: 'unleash4all',
        rootRole: adminRole.id,
    }, types_1.TEST_AUDIT_USER);
    await userService.deleteUser(user.id, types_1.TEST_AUDIT_USER);
    await expect(userService.loginUser('deleted_user', 'unleash4all')).rejects.toThrow(new password_mismatch_1.default('The combination of password and username you provided is invalid. If you have forgotten your password, visit /forgotten-password or get in touch with your instance administrator.'));
});
test('should not be able to login without password_hash on user', async () => {
    const user = await userService.createUser({
        username: 'deleted_user',
        password: 'unleash4all',
        rootRole: adminRole.id,
    }, types_1.TEST_AUDIT_USER);
    /*@ts-ignore: we are testing for null on purpose! */
    await userStore.setPasswordHash(user.id, null);
    await expect(userService.loginUser('deleted_user', 'anything-should-fail')).rejects.toThrow(new password_mismatch_1.default('The combination of password and username you provided is invalid. If you have forgotten your password, visit /forgotten-password or get in touch with your instance administrator.'));
});
test('should not login user if simple auth is disabled', async () => {
    await settingService.insert(simple_auth_settings_1.simpleAuthSettingsKey, { disabled: true }, types_1.TEST_AUDIT_USER, true);
    await userService.createUser({
        username: 'test_no_pass',
        password: 'A very strange P4ssw0rd_',
        rootRole: adminRole.id,
    }, types_1.TEST_AUDIT_USER);
    await expect(async () => {
        await userService.loginUser('test_no_pass', 'A very strange P4ssw0rd_');
    }).rejects.toThrowError('Logging in with username/password has been disabled.');
});
test('should login for user _without_ password', async () => {
    const email = 'some@test.com';
    await userService.createUser({
        email,
        password: 'A very strange P4ssw0rd_',
        rootRole: adminRole.id,
    }, types_1.TEST_AUDIT_USER);
    const user = await userService.loginUserWithoutPassword(email);
    expect(user.email).toBe(email);
});
test('should get user with root role', async () => {
    const email = 'some@test.com';
    const u = await userService.createUser({
        email,
        password: 'A very strange P4ssw0rd_',
        rootRole: adminRole.id,
    }, types_1.TEST_AUDIT_USER);
    const user = await userService.getUser(u.id);
    expect(user.email).toBe(email);
    expect(user.id).toBe(u.id);
    expect(user.rootRole).toBe(adminRole.id);
});
test('should get user with root role by name', async () => {
    const email = 'some2@test.com';
    const u = await userService.createUser({
        email,
        password: 'A very strange P4ssw0rd_',
        rootRole: model_1.RoleName.ADMIN,
    }, types_1.TEST_AUDIT_USER);
    const user = await userService.getUser(u.id);
    expect(user.email).toBe(email);
    expect(user.id).toBe(u.id);
    expect(user.rootRole).toBe(adminRole.id);
});
test("deleting a user should delete the user's sessions", async () => {
    const email = 'some@test.com';
    const user = await userService.createUser({
        email,
        password: 'A very strange P4ssw0rd_',
        rootRole: adminRole.id,
    }, types_1.TEST_AUDIT_USER);
    const testComSession = {
        sid: 'xyz321',
        sess: {
            cookie: {
                originalMaxAge: (0, date_fns_1.minutesToMilliseconds)(48),
                expires: (0, date_fns_1.addDays)(Date.now(), 1).toDateString(),
                secure: false,
                httpOnly: true,
                path: '/',
            },
            user,
        },
    };
    await sessionService.insertSession(testComSession);
    const userSessions = await sessionService.getSessionsForUser(user.id);
    expect(userSessions.length).toBe(1);
    await userService.deleteUser(user.id, types_1.TEST_AUDIT_USER);
    const noSessions = await sessionService.getSessionsForUser(user.id);
    expect(noSessions.length).toBe(0);
});
test('user login should remove stale sessions', async () => {
    const email = 'some@test.com';
    const user = await userService.createUser({
        email,
        password: 'A very strange P4ssw0rd_',
        rootRole: adminRole.id,
    }, types_1.TEST_AUDIT_USER);
    const userSession = (index) => ({
        sid: `sid${index}`,
        sess: {
            cookie: {
                originalMaxAge: (0, date_fns_1.minutesToMilliseconds)(48),
                expires: (0, date_fns_1.addDays)(Date.now(), 1).toDateString(),
                secure: false,
                httpOnly: true,
                path: '/',
            },
            user,
        },
    });
    for (let i = 0; i < allowedSessions; i++) {
        await sessionService.insertSession(userSession(i));
    }
    const loggedInUser = await userService.loginUser(email, 'A very strange P4ssw0rd_');
    expect(loggedInUser.deletedSessions).toBe(1);
    expect(loggedInUser.activeSessions).toBe(allowedSessions);
});
test('updating a user without an email should not strip the email', async () => {
    const email = 'some@test.com';
    const user = await userService.createUser({
        email,
        password: 'A very strange P4ssw0rd_',
        rootRole: adminRole.id,
    }, types_1.TEST_AUDIT_USER);
    await userService.updateUser({
        id: user.id,
        name: 'some',
    }, types_1.TEST_AUDIT_USER);
    const updatedUser = await userService.getUser(user.id);
    expect(updatedUser.email).toBe(email);
});
test('should login and create user via SSO', async () => {
    const recordedEvents = [];
    eventBus.on(metric_events_1.USER_LOGIN, (data) => {
        recordedEvents.push(data);
    });
    const email = 'some@test.com';
    const user = await userService.loginUserSSO({
        email,
        rootRole: model_1.RoleName.VIEWER,
        name: 'some',
        autoCreate: true,
    });
    const userWithRole = await userService.getUser(user.id);
    expect(user.email).toBe(email);
    expect(user.name).toBe('some');
    expect(userWithRole.name).toBe('some');
    expect(userWithRole.rootRole).toBe(viewerRole.id);
    expect(recordedEvents).toEqual([{ loginOrder: 0 }]);
});
test('should throw if rootRole is wrong via SSO', async () => {
    expect.assertions(1);
    await expect(userService.loginUserSSO({
        email: 'some@test.com',
        rootRole: model_1.RoleName.MEMBER,
        name: 'some',
        autoCreate: true,
    })).rejects.toThrow(new error_1.BadDataError('Could not find rootRole=Member'));
});
test('should update user name when signing in via SSO', async () => {
    const email = 'some@test.com';
    const originalUser = await userService.createUser({
        email,
        rootRole: model_1.RoleName.VIEWER,
        name: 'some',
    }, types_1.TEST_AUDIT_USER);
    await userService.loginUserSSO({
        email,
        rootRole: model_1.RoleName.ADMIN,
        name: 'New name!',
        autoCreate: true,
    });
    const actualUser = await userService.getUser(originalUser.id);
    expect(actualUser.email).toBe(email);
    expect(actualUser.name).toBe('New name!');
    expect(actualUser.rootRole).toBe(viewerRole.id);
});
test('should update name if it is different via SSO', async () => {
    const email = 'some@test.com';
    const originalUser = await userService.createUser({
        email,
        rootRole: model_1.RoleName.VIEWER,
        name: 'some',
    }, types_1.TEST_AUDIT_USER);
    await userService.loginUserSSO({
        email,
        rootRole: model_1.RoleName.ADMIN,
        name: 'New name!',
        autoCreate: false,
    });
    const actualUser = await userService.getUser(originalUser.id);
    expect(actualUser.email).toBe(email);
    expect(actualUser.name).toBe('New name!');
    expect(actualUser.rootRole).toBe(viewerRole.id);
});
test('should throw if autoCreate is false via SSO', async () => {
    expect.assertions(1);
    await expect(userService.loginUserSSO({
        email: 'some@test.com',
        rootRole: model_1.RoleName.MEMBER,
        name: 'some',
        autoCreate: false,
    })).rejects.toThrow(new notfound_error_1.default('No user found'));
});
test('should support a root role id when logging in and creating user via SSO', async () => {
    const name = 'root-role-id';
    const email = `${name}@test.com`;
    const user = await userService.loginUserSSO({
        email,
        rootRole: viewerRole.id,
        name,
        autoCreate: true,
    });
    const userWithRole = await userService.getUser(user.id);
    expect(user.email).toBe(email);
    expect(user.name).toBe(name);
    expect(userWithRole.name).toBe(name);
    expect(userWithRole.rootRole).toBe(viewerRole.id);
});
test('should support a custom root role id when logging in and creating user via SSO', async () => {
    const name = 'custom-root-role-id';
    const email = `${name}@test.com`;
    const user = await userService.loginUserSSO({
        email,
        rootRole: customRole.id,
        name,
        autoCreate: true,
    });
    const userWithRole = await userService.getUser(user.id);
    expect(user.email).toBe(email);
    expect(user.name).toBe(name);
    expect(userWithRole.name).toBe(name);
    expect(userWithRole.rootRole).toBe(customRole.id);
    const permissions = await accessService.getPermissionsForUser(user);
    expect(permissions).toHaveLength(1);
    expect(permissions[0].permission).toBe(types_1.CREATE_ADDON);
});
describe('Should not be able to use any of previous 5 passwords', () => {
    test('throws exception when trying to use a previously used password', async () => {
        const name = 'same-password-is-not-allowed';
        const email = `${name}@test.com`;
        const password = 'externalScreaming$123';
        const user = await userService.createUser({
            email,
            rootRole: customRole.id,
            name,
            password,
        });
        await expect(userService.changePasswordWithPreviouslyUsedPasswordCheck(user.id, password)).rejects.toThrow(new password_previously_used_1.PasswordPreviouslyUsedError());
    });
    test('Is still able to change password to one not used', async () => {
        const name = 'new-password-is-allowed';
        const email = `${name}@test.com`;
        const password = 'externalScreaming$123';
        const user = await userService.createUser({
            email,
            rootRole: customRole.id,
            name,
            password,
        });
        await expect(userService.changePasswordWithPreviouslyUsedPasswordCheck(user.id, 'internalScreaming$123')).resolves.not.toThrow();
    });
    test('Remembers 5 passwords', async () => {
        const name = 'remembers-5-passwords-like-a-boss';
        const email = `${name}@test.com`;
        const password = 'externalScreaming$123';
        const user = await userService.createUser({
            email,
            rootRole: customRole.id,
            name,
            password,
        });
        for (let i = 0; i < 5; i++) {
            await userService.changePasswordWithPreviouslyUsedPasswordCheck(user.id, `${password}${i}`);
        }
        await expect(userService.changePasswordWithPreviouslyUsedPasswordCheck(user.id, `${password}`)).resolves.not.toThrow(); // We've added 5 new passwords, so the original should work again
    });
    test('Can bypass check by directly calling the changePassword method', async () => {
        const name = 'can-bypass-check-like-a-boss';
        const email = `${name}@test.com`;
        const password = 'externalScreaming$123';
        const user = await userService.createUser({
            email,
            rootRole: customRole.id,
            name,
            password,
        });
        await expect(userService.changePassword(user.id, `${password}`)).resolves.not.toThrow(); // By bypassing the check, we can still set the same password as currently set
    });
});
//# sourceMappingURL=user-service.e2e.test.js.map