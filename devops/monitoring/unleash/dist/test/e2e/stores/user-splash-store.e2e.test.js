"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../helpers/database-init"));
const no_logger_1 = __importDefault(require("../../fixtures/no-logger"));
let stores;
let db;
let userSplashStore;
let userStore;
let currentUser;
beforeAll(async () => {
    db = await (0, database_init_1.default)('user_splash_store', no_logger_1.default);
    stores = db.stores;
    userSplashStore = stores.userSplashStore;
    userStore = stores.userStore;
    currentUser = await userStore.upsert({ email: 'me.feedback@mail.com' });
});
afterAll(async () => {
    await db.destroy();
});
afterEach(async () => {
    await userSplashStore.deleteAll();
});
test('should create userSplash', async () => {
    await userSplashStore.updateSplash({
        splashId: 'some-id',
        userId: currentUser.id,
        seen: false,
    });
    const userSplashs = await userSplashStore.getAllUserSplashes(currentUser.id);
    expect(userSplashs).toHaveLength(1);
    expect(userSplashs[0].splashId).toBe('some-id');
});
test('should get userSplash', async () => {
    await userSplashStore.updateSplash({
        splashId: 'some-id',
        userId: currentUser.id,
        seen: false,
    });
    const userSplash = await userSplashStore.getSplash(currentUser.id, 'some-id');
    expect(userSplash.splashId).toBe('some-id');
});
test('should exists', async () => {
    await userSplashStore.updateSplash({
        splashId: 'some-id-3',
        userId: currentUser.id,
        seen: false,
    });
    const exists = await userSplashStore.exists({
        userId: currentUser.id,
        splashId: 'some-id-3',
    });
    expect(exists).toBe(true);
});
test('should not exists', async () => {
    const exists = await userSplashStore.exists({
        userId: currentUser.id,
        splashId: 'some-id-not-here',
    });
    expect(exists).toBe(false);
});
test('should get all userSplashs', async () => {
    await userSplashStore.updateSplash({
        splashId: 'some-id-2',
        userId: currentUser.id,
        seen: false,
    });
    const userSplashs = await userSplashStore.getAll();
    expect(userSplashs).toHaveLength(1);
    expect(userSplashs[0].splashId).toBe('some-id-2');
});
//# sourceMappingURL=user-splash-store.e2e.test.js.map