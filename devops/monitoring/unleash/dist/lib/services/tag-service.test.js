"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_config_1 = require("../../test/config/test-config");
const fake_tag_store_1 = __importDefault(require("../../test/fixtures/fake-tag-store"));
const tag_service_1 = __importDefault(require("./tag-service"));
const config = (0, test_config_1.createTestConfig)();
test('should trim tag values before saving them', async () => {
    const tagStore = new fake_tag_store_1.default();
    const service = new tag_service_1.default({ tagStore }, config, {
        storeEvent: async () => { },
    });
    await service.createTag({
        value: '  test  ',
        type: 'simple',
    }, { id: 1, username: 'audit user', ip: '' });
    expect(tagStore.tags).toMatchObject([
        {
            value: 'test',
            type: 'simple',
        },
    ]);
});
//# sourceMappingURL=tag-service.test.js.map