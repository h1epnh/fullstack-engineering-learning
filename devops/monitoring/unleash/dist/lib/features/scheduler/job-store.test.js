"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_config_1 = require("../../../test/config/test-config");
const job_store_1 = require("./job-store");
const database_init_1 = __importDefault(require("../../../test/e2e/helpers/database-init"));
let db;
const config = (0, test_config_1.createTestConfig)();
beforeAll(async () => {
    db = await (0, database_init_1.default)('job_store_serial', config.getLogger);
});
afterAll(async () => {
    await db.destroy();
});
test('cannot acquireBucket twice', async () => {
    const store = new job_store_1.JobStore(db.rawDatabase, config);
    // note: this might be flaky if the test runs exactly at 59 minutes and 59 seconds of an hour and 999 milliseconds but should be unlikely
    const bucket = await store.acquireBucket('test', 60);
    expect(bucket).toBeDefined();
    const bucket2 = await store.acquireBucket('test', 60);
    expect(bucket2).toBeUndefined();
});
test('Can acquire bucket for two different key names within the same period', async () => {
    const store = new job_store_1.JobStore(db.rawDatabase, config);
    const firstBucket = await store.acquireBucket('first', 60);
    const secondBucket = await store.acquireBucket('second', 60);
    expect(firstBucket).toBeDefined();
    expect(secondBucket).toBeDefined();
});
//# sourceMappingURL=job-store.test.js.map