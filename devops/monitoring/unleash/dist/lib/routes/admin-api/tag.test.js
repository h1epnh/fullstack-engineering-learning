"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const store_1 = __importDefault(require("../../../test/fixtures/store"));
const permissions_1 = __importDefault(require("../../../test/fixtures/permissions"));
const app_1 = __importDefault(require("../../app"));
const test_config_1 = require("../../../test/config/test-config");
const services_1 = require("../../services");
async function getSetup() {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const stores = (0, store_1.default)();
    const perms = (0, permissions_1.default)();
    const config = (0, test_config_1.createTestConfig)({
        server: { baseUriPath: base },
        preRouterHook: perms.hook,
    });
    const services = (0, services_1.createServices)(stores, config);
    const app = await (0, app_1.default)(config, stores, services);
    return {
        base,
        perms,
        tagStore: stores.tagStore,
        request: (0, supertest_1.default)(app),
    };
}
let base;
let tagStore;
let request;
beforeEach(async () => {
    const setup = await getSetup();
    base = setup.base;
    tagStore = setup.tagStore;
    request = setup.request;
});
test('should get empty getTags via admin', () => {
    expect.assertions(1);
    return request
        .get(`${base}/api/admin/tags`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
        expect(res.body.tags.length === 0).toBe(true);
    });
});
test('should get all tags added', () => {
    expect.assertions(1);
    tagStore.createTag({
        type: 'simple',
        value: 'TeamGreen',
    });
    return request
        .get(`${base}/api/admin/tags`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
        expect(res.body.tags.length === 1).toBe(true);
    });
});
test('should be able to get single tag by type and value', async () => {
    expect.assertions(1);
    await tagStore.createTag({ value: 'TeamRed', type: 'simple' });
    return request
        .get(`${base}/api/admin/tags/simple/TeamRed`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
        expect(res.body.tag.value).toBe('TeamRed');
    });
});
test('trying to get non-existing tag by name and type should not be found', () => request.get(`${base}/api/admin/tags/simple/TeamRed`).expect((res) => {
    expect(res.status).toBe(404);
}));
test('should be able to delete a tag', () => {
    expect.assertions(0);
    tagStore.createTag({ type: 'simple', value: 'TeamRed' });
    return request
        .delete(`${base}/api/admin/tags/simple/TeamGreen`)
        .expect(200);
});
test('should get empty tags of type', () => {
    expect.assertions(1);
    return request
        .get(`${base}/api/admin/tags/simple`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
        expect(res.body.tags.length).toBe(0);
    });
});
test('should be able to filter by type', () => {
    tagStore.createTag({ type: 'simple', value: 'TeamRed' });
    tagStore.createTag({ type: 'slack', value: 'TeamGreen' });
    return request
        .get(`${base}/api/admin/tags/simple`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
        expect(res.body.tags.length).toBe(1);
        expect(res.body.tags[0].value).toBe('TeamRed');
    });
});
//# sourceMappingURL=tag.test.js.map