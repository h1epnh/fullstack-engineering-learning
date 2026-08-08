"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../helpers/database-init"));
const no_logger_1 = __importDefault(require("../../fixtures/no-logger"));
let stores;
let db;
beforeAll(async () => {
    db = await (0, database_init_1.default)('setting_store_serial', no_logger_1.default);
    stores = db.stores;
});
afterAll(async () => {
    await db.destroy();
});
test('should have api secret stored', async () => {
    const secret = await stores.settingStore.get('unleash.secret');
    expect(secret).toBeDefined();
});
test('should insert arbitrary value', async () => {
    const value = { b: 'hello' };
    await stores.settingStore.insert('unleash.custom', value);
    const ret = await stores.settingStore.get('unleash.custom');
    expect(ret).toEqual(value);
});
test('should update arbitrary value', async () => {
    const value = { b: 'hello' };
    await stores.settingStore.insert('unleash.custom', value);
    const value2 = { some: 'other' };
    await stores.settingStore.insert('unleash.custom', value2);
    const ret = await stores.settingStore.get('unleash.custom');
    expect(ret).toEqual(value2);
});
test('should delete arbitrary value', async () => {
    const value = { b: 'hello' };
    await stores.settingStore.insert('unleash.custom', value);
    await stores.settingStore.delete('unleash.custom');
    const ret = await stores.settingStore.get('unleash.custom');
    expect(ret).toBeUndefined();
});
test('should getAll', async () => {
    await stores.settingStore.insert('unleash.custom.1', { b: 'hello' });
    await stores.settingStore.insert('unleash.custom.2', { b: 'hello' });
    await stores.settingStore.insert('unleash.custom.3', { b: 'hello' });
    const ret = await stores.settingStore.getAll();
    expect(ret).toHaveLength(6);
});
test('should exists', async () => {
    await stores.settingStore.insert('unleash.custom.2', { b: 'hello' });
    const ret = await stores.settingStore.exists('unleash.custom.2');
    expect(ret).toBe(true);
});
test('should delete all', async () => {
    await stores.settingStore.deleteAll();
    const ret = await stores.settingStore.getAll();
    expect(ret).toHaveLength(0);
});
//# sourceMappingURL=setting-store.e2e.test.js.map