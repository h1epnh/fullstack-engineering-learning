"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const test_config_1 = require("../../../test/config/test-config");
const store_1 = __importDefault(require("../../../test/fixtures/store"));
const services_1 = require("../../services");
const permissions_1 = __importDefault(require("../../../test/fixtures/permissions"));
const app_1 = __importDefault(require("../../app"));
async function getSetup() {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const perms = (0, permissions_1.default)();
    const config = (0, test_config_1.createTestConfig)({
        preHook: perms.hook,
        server: { baseUriPath: base },
    });
    const stores = (0, store_1.default)();
    const services = (0, services_1.createServices)(stores, config);
    const app = await (0, app_1.default)(config, stores, services);
    return {
        base,
        request: (0, supertest_1.default)(app),
    };
}
let base;
let request;
beforeEach(async () => {
    const setup = await getSetup();
    base = setup.base;
    request = setup.request;
});
test('should get all context definitions', () => {
    expect.assertions(2);
    return request
        .get(`${base}/api/admin/context`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
        expect(res.body.length === 3).toBe(true);
        const envField = res.body.find((c) => c.name === 'environment');
        expect(envField.name === 'environment').toBe(true);
    });
});
test('should get context definition', () => {
    expect.assertions(1);
    return request
        .get(`${base}/api/admin/context/userId`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
        expect(res.body.name).toBe('userId');
    });
});
test('should be allowed to use new context field name', () => {
    expect.assertions(0);
    return request
        .post(`${base}/api/admin/context/validate`)
        .send({ name: 'new.name' })
        .set('Content-Type', 'application/json')
        .expect(200);
});
test('should not be allowed reuse context field name', () => {
    expect.assertions(0);
    return request
        .post(`${base}/api/admin/context/validate`)
        .send({ name: 'environment' })
        .set('Content-Type', 'application/json')
        .expect(409);
});
test('should create a context field', () => {
    expect.assertions(0);
    return request
        .post(`${base}/api/admin/context`)
        .send({ name: 'fancy', description: 'Bla bla' })
        .set('Content-Type', 'application/json')
        .expect(201);
});
test('should create a context field with legal values', () => {
    expect.assertions(0);
    return request
        .post(`${base}/api/admin/context`)
        .send({
        name: 'page',
        description: 'Bla bla',
        legalValues: [{ value: 'blue' }, { value: 'red' }],
    })
        .set('Content-Type', 'application/json')
        .expect(201);
});
test('should require name when creating a context field', () => {
    expect.assertions(0);
    return request
        .post(`${base}/api/admin/context`)
        .send({ description: 'Bla bla' })
        .set('Content-Type', 'application/json')
        .expect(400);
});
test('should not create a context field with existing name', () => {
    expect.assertions(0);
    return request
        .post(`${base}/api/admin/context`)
        .send({ name: 'userId', description: 'Bla bla' })
        .set('Content-Type', 'application/json')
        .expect(409);
});
test('should not create a context field with duplicate legal values', () => {
    expect.assertions(0);
    return request
        .post(`${base}/api/admin/context`)
        .send({
        name: 'page',
        description: 'Bla bla',
        legalValues: [{ value: 'blue' }, { value: 'blue' }],
    })
        .set('Content-Type', 'application/json')
        .expect(400);
});
test('should update a context field with new legal values', () => {
    expect.assertions(0);
    return request
        .put(`${base}/api/admin/context/environment`)
        .send({
        name: 'environment',
        description: 'Used target application envrionments',
        legalValues: [
            { value: 'local' },
            { value: 'stage' },
            { value: 'production' },
        ],
    })
        .set('Content-Type', 'application/json')
        .expect(200);
});
test('should add and update a single context field with new legal values', async () => {
    expect.assertions(1);
    // non existent context
    await request
        .post(`${base}/api/admin/context/doesntexist/legalValues`)
        .send({
        value: 'local',
        description: 'Local environment',
    })
        .set('Content-Type', 'application/json')
        .expect(404);
    // invalid schema
    await request
        .post(`${base}/api/admin/context/environment/legal-values`)
        .send({
        valueInvalid: 'invalid schema',
        description: 'Local environment',
    })
        .set('Content-Type', 'application/json')
        .expect(400);
    // add a new context field legal value
    await request
        .post(`${base}/api/admin/context/environment/legal-values`)
        .send({
        value: 'newvalue',
        description: 'new description',
    })
        .set('Content-Type', 'application/json')
        .expect(200);
    // update existing context field legal value description
    await request
        .post(`${base}/api/admin/context/environment/legal-values`)
        .send({
        value: 'newvalue',
        description: 'updated description',
    })
        .set('Content-Type', 'application/json')
        .expect(200);
    const { body } = await request.get(`${base}/api/admin/context/environment`);
    expect(body).toMatchObject({
        name: 'environment',
        legalValues: [
            { value: 'newvalue', description: 'updated description' },
        ],
    });
});
test('should delete a single context field legal value', async () => {
    expect.assertions(1);
    // add a new context field legal value
    await request
        .post(`${base}/api/admin/context/environment/legal-values`)
        .send({
        value: 'valueA',
    })
        .set('Content-Type', 'application/json')
        .expect(200);
    await request
        .post(`${base}/api/admin/context/environment/legal-values`)
        .send({
        value: 'valueB',
    })
        .set('Content-Type', 'application/json')
        .expect(200);
    await request
        .delete(`${base}/api/admin/context/environment/legal-values/valueB`)
        .expect(200);
    const { body } = await request.get(`${base}/api/admin/context/environment`);
    expect(body).toMatchObject({
        name: 'environment',
        legalValues: [{ value: 'valueA' }],
    });
    // verify delete is idempotent
    await request
        .delete(`${base}/api/admin/context/environment/legal-values/valueB`)
        .expect(200);
});
test('should not delete a unknown context field', () => {
    expect.assertions(0);
    return request
        .delete(`${base}/api/admin/context/unknown`)
        .set('Content-Type', 'application/json')
        .expect(404);
});
test('should delete a context field', () => {
    expect.assertions(0);
    return request
        .delete(`${base}/api/admin/context/appName`)
        .set('Content-Type', 'application/json')
        .expect(200);
});
//# sourceMappingURL=context.test.js.map