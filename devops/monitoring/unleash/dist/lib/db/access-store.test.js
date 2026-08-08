"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../../test/e2e/helpers/database-init"));
const no_logger_1 = __importDefault(require("../../test/fixtures/no-logger"));
const error_1 = require("../error");
let db;
beforeAll(async () => {
    db = await (0, database_init_1.default)('access_store_serial', no_logger_1.default);
});
afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});
// Helper function to make the test cases more readable
const args = (permissions, expectations) => {
    if (expectations) {
        return [permissions, expectations];
    }
    else {
        return [permissions];
    }
};
test('resolvePermissions returns empty list if undefined', async () => {
    const access = db.stores.accessStore;
    const result = await access.resolvePermissions(undefined);
    expect(result).toStrictEqual([]);
});
test('resolvePermissions returns empty list if empty list', async () => {
    const access = db.stores.accessStore;
    const result = await access.resolvePermissions([]);
    expect(result).toStrictEqual([]);
});
test.each([
    args([{ name: 'CREATE_CONTEXT_FIELD' }]),
    args([{ name: 'CREATE_FEATURE', environment: 'development' }]),
    args([
        { name: 'CREATE_CONTEXT_FIELD' },
        { name: 'CREATE_FEATURE', environment: 'development' },
    ]),
])('resolvePermissions with permission names (%o) will return the list unmodified', async (permissions) => {
    const access = db.stores.accessStore;
    const result = await access.resolvePermissions(permissions);
    expect(result).toStrictEqual(permissions);
});
test.each([
    args([{ id: 1 }], [{ id: 1, name: 'ADMIN' }]),
    args([{ id: 4, environment: 'development' }], [{ id: 4, name: 'CREATE_ADDON', environment: 'development' }]),
    args([
        { id: 1, environment: 'development' },
        { id: 2, name: 'ignore this name' },
    ], [
        { id: 1, name: 'ADMIN', environment: 'development' },
        { id: 2, name: 'ignore this name' },
    ]),
])('resolvePermissions with only permission ids (%o) will resolve to named permissions without an id', async (permissions, expected) => {
    const access = db.stores.accessStore;
    const result = await access.resolvePermissions(permissions);
    expect(result).toStrictEqual(expected);
});
test.each([
    args([
        { name: 'CREATE_CONTEXT_FIELD' },
        { id: 3 },
        { name: 'CREATE_FEATURE', environment: 'development' },
        { id: 15, environment: 'development' },
        { name: 'UPDATE_FEATURE', environment: 'development' },
    ], [
        { name: 'CREATE_CONTEXT_FIELD' },
        { id: 3, name: 'CREATE_STRATEGY' },
        { name: 'CREATE_FEATURE', environment: 'development' },
        { id: 15, name: 'UPDATE_STRATEGY', environment: 'development' },
        { name: 'UPDATE_FEATURE', environment: 'development' },
    ]),
])('resolvePermissions mixed ids and names (%o) will inject the names where they are missing', async (permissions, expected) => {
    const access = db.stores.accessStore;
    const result = await access.resolvePermissions(permissions);
    expect(result).toStrictEqual(expected);
});
describe('addAccessToProject', () => {
    test.each(['roles', 'groups', 'users'])('should throw a bad data error if there is invalid data in the %s property of the addAccessToProject payload', async (property) => {
        const access = db.stores.accessStore;
        const payload = {
            roles: [4, 5],
            groups: [],
            users: [],
            [property]: [123456789],
        };
        await expect(() => access.addAccessToProject(payload.roles, payload.groups, payload.users, 'projectId', 'createdBy')).rejects.toThrow(error_1.BadDataError);
    });
});
//# sourceMappingURL=access-store.test.js.map