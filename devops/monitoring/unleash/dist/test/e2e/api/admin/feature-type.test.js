"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../../helpers/database-init"));
const no_logger_1 = __importDefault(require("../../../fixtures/no-logger"));
const test_helper_1 = require("../../helpers/test-helper");
const validate_1 = require("../../../../lib/openapi/validate");
const feature_types_schema_1 = require("../../../../lib/openapi/spec/feature-types-schema");
let app;
let db;
beforeAll(async () => {
    db = await (0, database_init_1.default)('feature_type_api_serial', no_logger_1.default);
    app = await (0, test_helper_1.setupAppWithCustomConfig)(db.stores, {
        experimental: {
            flags: {
                strictSchemaValidation: true,
            },
        },
    }, db.rawDatabase);
});
afterAll(async () => {
    await app.destroy();
    await db.destroy();
});
test('Should get all defined feature types', async () => {
    await app.request
        .get('/api/admin/feature-types')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
        const { version, types } = res.body;
        expect(version).toBe(1);
        expect(types.length).toBe(5);
        expect(types[0].name).toBe('Release');
        expect((0, validate_1.validateSchema)(feature_types_schema_1.featureTypesSchema.$id, res.body)).toBeUndefined();
    });
});
describe('updating lifetimes', () => {
    test.each([null, 5])('it updates to the lifetime correctly: `%s`', async (lifetimeDays) => {
        const { body } = await app.request
            .put('/api/admin/feature-types/release/lifetime')
            .send({ lifetimeDays })
            .expect(200);
        expect(body.lifetimeDays).toEqual(lifetimeDays);
    });
    test("if the feature type doesn't exist, you get a 404", async () => {
        await app.request
            .put('/api/admin/feature-types/bogus-feature-type/lifetime')
            .send({ lifetimeDays: 45 })
            .expect(404);
    });
    test('Setting lifetime to `null` is the same as setting it to `0`', async () => {
        const setLifetime = async (lifetimeDays) => {
            const { body } = await app.request
                .put('/api/admin/feature-types/release/lifetime')
                .send({ lifetimeDays })
                .expect(200);
            return body;
        };
        expect(await setLifetime(0)).toMatchObject(await setLifetime(null));
        const { body } = await app.getRecordedEvents();
        expect(body.events[0]).toMatchObject({
            data: { id: 'release', lifetimeDays: null },
        });
    });
    test('the :id parameter is not case sensitive', async () => {
        const lifetimeDays = 45;
        const { body } = await app.request
            .put('/api/admin/feature-types/kIlL-SwItCh/lifetime')
            .send({ lifetimeDays })
            .expect(200);
        expect(body.lifetimeDays).toEqual(lifetimeDays);
    });
});
//# sourceMappingURL=feature-type.test.js.map