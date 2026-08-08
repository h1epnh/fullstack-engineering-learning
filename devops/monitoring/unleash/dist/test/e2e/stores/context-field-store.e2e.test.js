"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../helpers/database-init"));
const no_logger_1 = __importDefault(require("../../fixtures/no-logger"));
const fast_check_1 = __importDefault(require("fast-check"));
let stores;
let db;
beforeAll(async () => {
    db = await (0, database_init_1.default)('context_store_serial', no_logger_1.default);
    stores = db.stores;
});
afterAll(async () => {
    await db.destroy();
});
const cleanup = async () => {
    await stores.contextFieldStore.deleteAll();
};
const contextFieldDto = () => fast_check_1.default.record({
    name: fast_check_1.default.uuid(),
    sortOrder: fast_check_1.default.integer(),
    stickiness: fast_check_1.default.boolean(),
    description: fast_check_1.default.lorem({ mode: 'sentences' }),
    legalValues: fast_check_1.default.array(fast_check_1.default.record({
        value: fast_check_1.default.lorem({ maxCount: 1 }),
        description: fast_check_1.default.lorem({ mode: 'sentences' }),
    }, { requiredKeys: ['value'] })),
}, { requiredKeys: ['name'] });
test('creating an arbitrary context field should return the created context field', async () => {
    await fast_check_1.default.assert(fast_check_1.default
        .asyncProperty(contextFieldDto(), async (input) => {
        const { createdAt, ...storedData } = await stores.contextFieldStore.create(input);
        Object.entries(input).forEach(([key, value]) => {
            expect(storedData[key]).toStrictEqual(value);
        });
    })
        .afterEach(cleanup));
});
test('updating a context field should update the specified fields and leave everything else untouched', async () => {
    await fast_check_1.default.assert(fast_check_1.default
        .asyncProperty(contextFieldDto(), contextFieldDto(), async (original, { name, ...updateData }) => {
        await stores.contextFieldStore.create(original);
        const { createdAt, ...updatedData } = await stores.contextFieldStore.update({
            name: original.name,
            ...updateData,
        });
        const allKeys = [
            'sortOrder',
            'stickiness',
            'description',
            'legalValues',
        ];
        const updateKeys = Object.keys(updateData);
        const unchangedKeys = allKeys.filter((k) => !updateKeys.includes(k));
        Object.entries(updateData).forEach(([key, value]) => {
            expect(updatedData[key]).toStrictEqual(value);
        });
        for (const key in unchangedKeys) {
            expect(updatedData[key]).toStrictEqual(original[key]);
        }
    })
        .afterEach(cleanup));
});
//# sourceMappingURL=context-field-store.e2e.test.js.map