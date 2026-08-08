"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../../helpers/database-init"));
const no_logger_1 = __importDefault(require("../../../fixtures/no-logger"));
const test_config_1 = require("../../../config/test-config");
const services_1 = require("../../../../lib/services");
const reset_token_service_1 = __importDefault(require("../../../../lib/services/reset-token-service"));
const session_service_1 = __importDefault(require("../../../../lib/services/session-service"));
const setting_service_1 = __importDefault(require("../../../../lib/services/setting-service"));
const user_service_1 = __importDefault(require("../../../../lib/services/user-service"));
const types_1 = require("../../../../lib/types");
const users_1 = require("../../../../lib/users");
const util_1 = require("../../../../lib/util");
const features_1 = require("../../../../lib/features");
let db;
let stores;
let userService;
let sessionService;
let settingService;
let eventService;
let accessService;
let inactiveUserService;
const deletionUser = {
    id: -12,
    name: 'admin user for deletion',
    username: 'admin',
    email: 'admin@example.com',
    permissions: [types_1.ADMIN],
    isAPI: false,
    imageUrl: '',
};
beforeAll(async () => {
    db = await (0, database_init_1.default)('inactive_user_service_serial', no_logger_1.default);
    stores = db.stores;
    const config = (0, test_config_1.createTestConfig)();
    eventService = (0, features_1.createEventsService)(db.rawDatabase, config);
    const groupService = new services_1.GroupService(stores, config, eventService);
    accessService = new services_1.AccessService(stores, config, groupService, eventService);
    const resetTokenService = new reset_token_service_1.default(stores, config);
    const emailService = new services_1.EmailService(config);
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
    inactiveUserService = (0, users_1.createInactiveUsersService)(db.rawDatabase, config, userService);
});
afterEach(async () => {
    await db.rawDatabase.raw('DELETE FROM users WHERE id > 1000');
});
afterAll(async () => {
    await db.destroy();
});
describe('Inactive users service', () => {
    describe('Finding inactive users', () => {
        test('Finds users that have never logged in but was created before our deadline', async () => {
            await db.rawDatabase.raw(`INSERT INTO users(id, name, username, email, created_at)
                                      VALUES (9595, 'test user who never logged in', 'nedryerson', 'ned@ryerson.com',
                                              now() - INTERVAL '7 MONTHS')`);
            const users = await inactiveUserService.getInactiveUsers();
            expect(users).toBeTruthy();
            expect(users).toHaveLength(1);
        });
        test('Finds users that was last logged in before our deadline', async () => {
            await db.rawDatabase.raw(`INSERT INTO users(id, name, username, email, created_at, seen_at)
                                      VALUES (9595, 'test user who never logged in', 'nedryerson', 'ned@ryerson.com',
                                              now() - INTERVAL '7 MONTHS', now() - INTERVAL '182 DAYS')`);
            const users = await inactiveUserService.getInactiveUsers();
            expect(users).toBeTruthy();
            expect(users).toHaveLength(1);
        });
        test('Does not find users that was last logged in after our deadline', async () => {
            await db.rawDatabase.raw(`INSERT INTO users(id, name, username, email, created_at, seen_at)
                                      VALUES (9595, 'test user who has logged in', 'nedryerson', 'ned@ryerson.com',
                                              now() - INTERVAL '7 MONTHS', now() - INTERVAL '1 MONTH')`);
            const users = await inactiveUserService.getInactiveUsers();
            expect(users).toBeTruthy();
            expect(users).toHaveLength(0);
        });
        test('Does not find users that has never logged in, but was created after our deadline', async () => {
            await db.rawDatabase.raw(`INSERT INTO users(id, name, username, email, created_at)
                                      VALUES (9595, 'test user who never logged in', 'nedryerson', 'ned@ryerson.com',
                                              now() - INTERVAL '3 MONTHS')`);
            const users = await inactiveUserService.getInactiveUsers();
            expect(users).toBeTruthy();
            expect(users).toHaveLength(0);
        });
        test('A user with a pat that was last seen last week is not inactive', async () => {
            await db.rawDatabase.raw(`INSERT INTO users(id, name, username, email, created_at)
                                      VALUES (9595, 'test user with active PAT', 'nedryerson', 'ned@ryerson.com',
                                              now() - INTERVAL '200 DAYS')`);
            await db.rawDatabase.raw(`INSERT INTO personal_access_tokens(secret, user_id, expires_at, seen_at, created_at)
                      VALUES ('user:somefancysecret', 9595, now() + INTERVAL '6 MONTHS', now() - INTERVAL '1 WEEK', now() - INTERVAL '8 MONTHS')`);
            const users = await inactiveUserService.getInactiveUsers();
            expect(users).toBeTruthy();
            expect(users).toHaveLength(0);
        });
        test('A user with a pat that was last seen 7 months ago is inactive', async () => {
            await db.rawDatabase.raw(`INSERT INTO users(id, name, username, email, created_at)
                                      VALUES (9595, 'test user with active PAT', 'nedryerson', 'ned@ryerson.com',
                                              now() - INTERVAL '200 DAYS')`);
            await db.rawDatabase.raw(`INSERT INTO personal_access_tokens(secret, user_id, expires_at, seen_at, created_at) VALUES ('user:somefancysecret', 9595, now() + INTERVAL '6 MONTHS', now() - INTERVAL '7 MONTHS', now() - INTERVAL '8 MONTHS')`);
            const users = await inactiveUserService.getInactiveUsers();
            expect(users).toBeTruthy();
            expect(users).toHaveLength(1);
        });
        test('A user with a pat that was seen 7 months ago, but logged in yesterday should not be inactive', async () => {
            await db.rawDatabase.raw(`INSERT INTO users(id, name, username, email, created_at, seen_at) VALUES (9595, 'test user with active login and old PAT', 'nedryerson', 'ned@ryerson.com', now() - INTERVAL '1 YEAR', now() - INTERVAL '1 DAY')`);
            await db.rawDatabase.raw(`INSERT INTO personal_access_tokens(secret, user_id, expires_at, seen_at, created_at) VALUES ('user:somefancysecret', 9595, now() + INTERVAL '6 MONTHS', now() - INTERVAL '7 MONTHS', now() - INTERVAL '8 MONTHS')`);
            const users = await inactiveUserService.getInactiveUsers();
            expect(users).toBeTruthy();
            expect(users).toHaveLength(0);
        });
        test('System users and service users are not returned, even if not seen', async () => {
            await db.rawDatabase.raw(`INSERT INTO users(id, name, created_at, is_service) VALUES (4949, 'service_account', now() - INTERVAL '1 YEAR', true)`);
            await db.rawDatabase.raw(`INSERT INTO users(id, name, created_at, is_system) VALUES (13337, 'service_account', now() - INTERVAL '1 YEAR', true)`);
            const users = await inactiveUserService.getInactiveUsers();
            expect(users).toBeTruthy();
            expect(users).toHaveLength(0);
        });
    });
    describe('Deleting inactive users', () => {
        test('Deletes users that have never logged in but was created before our deadline', async () => {
            await db.rawDatabase.raw(`INSERT INTO users(id, name, username, email, created_at)
                                      VALUES (9595, 'test user who never logged in', 'nedryerson', 'ned@ryerson.com',
                                              now() - INTERVAL '7 MONTHS')`);
            const usersToDelete = await inactiveUserService
                .getInactiveUsers()
                .then((users) => users.map((user) => user.id));
            await inactiveUserService.deleteInactiveUsers((0, util_1.extractAuditInfoFromUser)(deletionUser), usersToDelete);
            await expect(userService.getUser(9595)).rejects.toThrowErrorMatchingSnapshot('noUserSnapshot');
        });
        test('Finds users that was last logged in before our deadline', async () => {
            await db.rawDatabase.raw(`INSERT INTO users(id, name, username, email, created_at, seen_at)
                                      VALUES (9595, 'test user who has not logged in in a while', 'nedryerson', 'ned@ryerson.com',
                                              now() - INTERVAL '7 MONTHS', now() - INTERVAL '182 DAYS')`);
            const usersToDelete = await inactiveUserService
                .getInactiveUsers()
                .then((users) => users.map((user) => user.id));
            await inactiveUserService.deleteInactiveUsers((0, util_1.extractAuditInfoFromUser)(deletionUser), usersToDelete);
            await expect(userService.getUser(9595)).rejects.toThrowErrorMatchingSnapshot('noUserSnapshot');
        });
        test('Does not delete users that was last logged in after our deadline', async () => {
            await db.rawDatabase.raw(`INSERT INTO users(id, name, username, email, created_at, seen_at)
                                      VALUES (9595, 'test user who has logged in recently', 'nedryerson', 'ned@ryerson.com',
                                              now() - INTERVAL '7 MONTHS', now() - INTERVAL '1 MONTH')`);
            const usersToDelete = await inactiveUserService
                .getInactiveUsers()
                .then((users) => users.map((user) => user.id));
            await inactiveUserService.deleteInactiveUsers((0, util_1.extractAuditInfoFromUser)(deletionUser), usersToDelete);
            await expect(userService.getUser(9595)).resolves.toBeTruthy();
        });
        test('Does not delete users that has never logged in, but was created after our deadline', async () => {
            await db.rawDatabase.raw(`INSERT INTO users(id, name, username, email, created_at)
                                      VALUES (9595, 'test user who never logged in', 'nedryerson', 'ned@ryerson.com',
                                              now() - INTERVAL '3 MONTHS')`);
            const usersToDelete = await inactiveUserService
                .getInactiveUsers()
                .then((users) => users.map((user) => user.id));
            await inactiveUserService.deleteInactiveUsers((0, util_1.extractAuditInfoFromUser)(deletionUser), usersToDelete);
            await expect(userService.getUser(9595)).resolves.toBeTruthy();
        });
        test('Does not delete the user that calls the service', async () => {
            await db.rawDatabase.raw(`INSERT INTO users(id, name, username, email, created_at)
                                      VALUES (9595, 'test user who never logged in', 'nedryerson', 'ned@ryerson.com',
                                              now() - INTERVAL '7 MONTHS')`);
            await db.rawDatabase.raw(`INSERT INTO users(id, name, username, email, created_at)
                                      VALUES (${deletionUser.id}, '${deletionUser.name}', '${deletionUser.username}', '${deletionUser.email}', now() - INTERVAL '7 MONTHS')`);
            const usersToDelete = await inactiveUserService
                .getInactiveUsers()
                .then((users) => users.map((user) => user.id));
            await inactiveUserService.deleteInactiveUsers((0, util_1.extractAuditInfoFromUser)(deletionUser), usersToDelete);
            await expect(userService.getUser(9595)).rejects.toBeTruthy();
            await expect(userService.getUser(deletionUser.id)).resolves.toBeTruthy();
        });
    });
});
//# sourceMappingURL=inactive-users-service.test.js.map