"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../../../test/e2e/helpers/database-init"));
const test_helper_1 = require("../../../test/e2e/helpers/test-helper");
const no_logger_1 = __importDefault(require("../../../test/fixtures/no-logger"));
let stores;
let db;
let app;
const flag = {
    name: 'test-flag',
    enabled: true,
    strategies: [{ name: 'default' }],
    createdByUserId: 9999,
};
beforeAll(async () => {
    db = await (0, database_init_1.default)('playground_api', no_logger_1.default);
    stores = db.stores;
    await stores.featureToggleStore.create('default', flag);
    app = await (0, test_helper_1.setupAppWithCustomConfig)(stores, {}, db.rawDatabase);
});
afterAll(async () => {
    await db.destroy();
});
test('strips invalid context properties from input before using it', async () => {
    const validData = {
        appName: 'test',
    };
    const inputContext = {
        invalid: {},
        ...validData,
    };
    const { body } = await app.request
        .post('/api/admin/playground/advanced')
        .send({
        context: inputContext,
        environments: ['production'],
        projects: '*',
    })
        .expect(200);
    const evaluatedContext = body.features[0].environments.production[0].context;
    expect(evaluatedContext).toStrictEqual(validData);
});
test('returns the input context exactly as it came in, even if invalid values have been removed for the evaluation', async () => {
    const invalidData = {
        invalid: {},
    };
    const inputContext = {
        ...invalidData,
        appName: 'test',
    };
    const { body } = await app.request
        .post('/api/admin/playground/advanced')
        .send({
        context: inputContext,
        environments: ['production'],
        projects: '*',
    })
        .expect(200);
    expect(body.input.context).toMatchObject(inputContext);
});
test('adds all removed top-level context properties to the list of warnings', async () => {
    const invalidData = {
        invalid1: {},
        invalid2: {},
    };
    const inputContext = {
        ...invalidData,
        appName: 'test',
    };
    const { body } = await app.request
        .post('/api/admin/playground/advanced')
        .send({
        context: inputContext,
        environments: ['production'],
        projects: '*',
    })
        .expect(200);
    const warned = body.warnings.invalidContextProperties;
    const invalidKeys = Object.keys(invalidData);
    expect(warned).toEqual(expect.arrayContaining(invalidKeys));
    expect(invalidKeys).toEqual(expect.arrayContaining(warned));
});
//# sourceMappingURL=playground-api.e2e.test.js.map