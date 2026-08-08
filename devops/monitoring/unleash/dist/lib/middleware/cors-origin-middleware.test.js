"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_origin_middleware_1 = require("./cors-origin-middleware");
const fake_setting_store_1 = __importDefault(require("../../test/fixtures/fake-setting-store"));
const test_config_1 = require("../../test/config/test-config");
const fake_event_store_1 = __importDefault(require("../../test/fixtures/fake-event-store"));
const random_id_1 = require("../util/random-id");
const fake_project_store_1 = __importDefault(require("../../test/fixtures/fake-project-store"));
const services_1 = require("../../lib/services");
const types_1 = require("../../lib/types");
const frontend_settings_1 = require("../../lib/types/settings/frontend-settings");
const fake_feature_tag_store_1 = __importDefault(require("../../test/fixtures/fake-feature-tag-store"));
const features_1 = require("../features");
const TEST_USER_ID = -9999;
const createSettingService = (frontendApiOrigins) => {
    const config = (0, test_config_1.createTestConfig)({ frontendApiOrigins });
    const stores = {
        settingStore: new fake_setting_store_1.default(),
        eventStore: new fake_event_store_1.default(),
        featureTagStore: new fake_feature_tag_store_1.default(),
        projectStore: new fake_project_store_1.default(),
    };
    const eventService = (0, features_1.createFakeEventsService)(config);
    const services = {
        settingService: new services_1.SettingService(stores, config, eventService),
    };
    return {
        //@ts-ignore
        frontendApiService: new services_1.FrontendApiService(config, stores, services),
        settingStore: stores.settingStore,
    };
};
test('resolveOrigin', () => {
    const dotCom = 'https://example.com';
    const dotOrg = 'https://example.org';
    expect((0, cors_origin_middleware_1.resolveOrigin)([])).toEqual('*');
    expect((0, cors_origin_middleware_1.resolveOrigin)(['*'])).toEqual('*');
    expect((0, cors_origin_middleware_1.resolveOrigin)([dotOrg])).toEqual([dotOrg]);
    expect((0, cors_origin_middleware_1.resolveOrigin)([dotCom, dotOrg])).toEqual([dotCom, dotOrg]);
    expect((0, cors_origin_middleware_1.resolveOrigin)([dotOrg, '*'])).toEqual('*');
});
test('corsOriginMiddleware origin validation', async () => {
    const { frontendApiService } = createSettingService([]);
    const userName = (0, random_id_1.randomId)();
    await expect(() => frontendApiService.setFrontendSettings({ frontendApiOrigins: ['a'] }, types_1.TEST_AUDIT_USER)).rejects.toThrow('Invalid origin: a');
});
test('corsOriginMiddleware without config', async () => {
    const { frontendApiService, settingStore } = createSettingService([]);
    const userName = (0, random_id_1.randomId)();
    expect(await frontendApiService.getFrontendSettings(false)).toEqual({
        frontendApiOrigins: [],
    });
    await frontendApiService.setFrontendSettings({ frontendApiOrigins: [] }, types_1.TEST_AUDIT_USER);
    expect(await frontendApiService.getFrontendSettings(false)).toEqual({
        frontendApiOrigins: [],
    });
    await frontendApiService.setFrontendSettings({ frontendApiOrigins: ['*'] }, types_1.TEST_AUDIT_USER);
    expect(await frontendApiService.getFrontendSettings(false)).toEqual({
        frontendApiOrigins: ['*'],
    });
    await settingStore.delete(frontend_settings_1.frontendSettingsKey);
    expect(await frontendApiService.getFrontendSettings(false)).toEqual({
        frontendApiOrigins: [],
    });
});
test('corsOriginMiddleware with config', async () => {
    const { frontendApiService, settingStore } = createSettingService(['*']);
    const userName = (0, random_id_1.randomId)();
    expect(await frontendApiService.getFrontendSettings(false)).toEqual({
        frontendApiOrigins: ['*'],
    });
    await frontendApiService.setFrontendSettings({ frontendApiOrigins: [] }, types_1.TEST_AUDIT_USER);
    expect(await frontendApiService.getFrontendSettings(false)).toEqual({
        frontendApiOrigins: [],
    });
    await frontendApiService.setFrontendSettings({ frontendApiOrigins: ['https://example.com', 'https://example.org'] }, types_1.TEST_AUDIT_USER);
    expect(await frontendApiService.getFrontendSettings(false)).toEqual({
        frontendApiOrigins: ['https://example.com', 'https://example.org'],
    });
    await settingStore.delete(frontend_settings_1.frontendSettingsKey);
    expect(await frontendApiService.getFrontendSettings(false)).toEqual({
        frontendApiOrigins: ['*'],
    });
});
test('corsOriginMiddleware with caching enabled', async () => {
    const { frontendApiService } = createSettingService([]);
    const userName = (0, random_id_1.randomId)();
    expect(await frontendApiService.getFrontendSettings()).toEqual({
        frontendApiOrigins: [],
    });
    //setting
    await frontendApiService.setFrontendSettings({ frontendApiOrigins: ['*'] }, types_1.TEST_AUDIT_USER);
    //still get cached value
    expect(await frontendApiService.getFrontendSettings()).toEqual({
        frontendApiOrigins: [],
    });
    await frontendApiService.fetchFrontendSettings(); // called by the scheduler service
    const settings = await frontendApiService.getFrontendSettings();
    expect(settings).toEqual({
        frontendApiOrigins: ['*'],
    });
});
//# sourceMappingURL=cors-origin-middleware.test.js.map