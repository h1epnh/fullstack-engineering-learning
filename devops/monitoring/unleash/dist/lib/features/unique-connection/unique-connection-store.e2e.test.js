"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../../../test/e2e/helpers/database-init"));
const no_logger_1 = __importDefault(require("../../../test/fixtures/no-logger"));
const hyperloglog_lite_1 = __importDefault(require("hyperloglog-lite"));
const date_fns_1 = require("date-fns");
let stores;
let db;
let uniqueConnectionStore;
beforeAll(async () => {
    db = await (0, database_init_1.default)('unique_connections_store', no_logger_1.default);
    stores = db.stores;
    uniqueConnectionStore = stores.uniqueConnectionStore;
});
afterAll(async () => {
    await db.destroy();
});
beforeEach(async () => {
    await uniqueConnectionStore.deleteAll();
});
test('should store empty HyperLogLog buffer', async () => {
    const hll = (0, hyperloglog_lite_1.default)(12);
    await uniqueConnectionStore.insert({
        id: 'current',
        hll: hll.output().buckets,
    });
    const fetchedHll = await uniqueConnectionStore.get('current');
    hll.merge({ n: 12, buckets: fetchedHll.hll });
    expect(hll.count()).toBe(0);
});
test('should store non empty HyperLogLog buffer', async () => {
    const hll = (0, hyperloglog_lite_1.default)(12);
    hll.add(hyperloglog_lite_1.default.hash('connection-1'));
    hll.add(hyperloglog_lite_1.default.hash('connection-2'));
    await uniqueConnectionStore.insert({
        id: 'current',
        hll: hll.output().buckets,
    });
    const fetchedHll = await uniqueConnectionStore.get('current');
    const emptyHll = (0, hyperloglog_lite_1.default)(12);
    emptyHll.merge({ n: 12, buckets: fetchedHll.hll });
    expect(hll.count()).toBe(2);
});
test('should indicate when no entry', async () => {
    const fetchedHll = await uniqueConnectionStore.get('current');
    expect(fetchedHll).toBeNull();
});
test('should update updated_at date', async () => {
    const hll = (0, hyperloglog_lite_1.default)(12);
    hll.add(hyperloglog_lite_1.default.hash('connection-1'));
    hll.add(hyperloglog_lite_1.default.hash('connection-2'));
    await uniqueConnectionStore.insert({
        id: 'current',
        hll: hll.output().buckets,
    });
    const firstFetch = await uniqueConnectionStore.get('current');
    await uniqueConnectionStore.insert({
        id: 'current',
        hll: hll.output().buckets,
    });
    const secondFetch = await uniqueConnectionStore.get('current');
    expect((0, date_fns_1.isAfter)(secondFetch?.updatedAt, firstFetch?.updatedAt)).toBe(true);
});
//# sourceMappingURL=unique-connection-store.e2e.test.js.map