"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getLicensedUsers_1 = require("./getLicensedUsers");
const database_init_1 = __importDefault(require("../../../test/e2e/helpers/database-init"));
const no_logger_1 = __importDefault(require("../../../test/fixtures/no-logger"));
let db;
let getLicensedUsers;
const mockUser = (deletedDaysAgo, uniqueId) => {
    const deletedAt = deletedDaysAgo !== null
        ? new Date(Date.now() - deletedDaysAgo * 24 * 60 * 60 * 1000)
        : null;
    return {
        email: `${uniqueId}.user@example.com`,
        email_hash: `${uniqueId}.user@example.com`,
        deleted_at: deletedAt,
    };
};
beforeAll(async () => {
    db = await (0, database_init_1.default)('licensed_users_serial', no_logger_1.default);
    getLicensedUsers = (0, getLicensedUsers_1.createGetLicensedUsers)(db.rawDatabase);
});
afterEach(async () => {
    await db.rawDatabase('users').delete();
});
afterAll(async () => {
    await db.destroy();
});
test('should return 0 users when no users are present', async () => {
    await expect(getLicensedUsers()).resolves.toEqual(0);
});
test('should return 1 active user with no deletion date', async () => {
    await db.rawDatabase('users').insert(mockUser(null, 1));
    await expect(getLicensedUsers()).resolves.toEqual(1);
});
test('should count user as active if deleted within 30 days', async () => {
    await db.rawDatabase('users').insert(mockUser(29, 2));
    await expect(getLicensedUsers()).resolves.toEqual(1);
});
test('should not count user as active if deleted more than 30 days ago', async () => {
    await db.rawDatabase('users').insert(mockUser(31, 3));
    await expect(getLicensedUsers()).resolves.toEqual(0);
});
test('should return correct count for multiple users with mixed deletion statuses', async () => {
    const users = [
        ...Array.from({ length: 10 }, (_, userId) => mockUser(null, userId)), // 10 active users
        ...Array.from({ length: 5 }, (_, userId) => mockUser(29, userId + 10)), // 5 users deleted within 30 days
        ...Array.from({ length: 3 }, (_, userId) => mockUser(31, userId + 15)), // 3 users deleted more than 30 days ago
    ];
    await db.rawDatabase('users').insert(users);
    await expect(getLicensedUsers()).resolves.toEqual(15);
});
//# sourceMappingURL=getLicensedUsers.e2e.test.js.map