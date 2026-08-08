"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../helpers/database-init"));
const no_logger_1 = __importDefault(require("../../fixtures/no-logger"));
const test_config_1 = require("../../config/test-config");
const addon_service_1 = __importDefault(require("../../../lib/services/addon-service"));
const types_1 = require("../../../lib/types");
const addon_service_test_simple_addon_1 = __importDefault(require("../../../lib/services/addon-service-test-simple-addon"));
const tag_type_service_1 = __importDefault(require("../../../lib/features/tag-type/tag-type-service"));
const events_1 = require("../../../lib/types/events");
const services_1 = require("../../../lib/services");
const features_1 = require("../../../lib/features");
const addonProvider = { simple: new addon_service_test_simple_addon_1.default() };
let db;
let stores;
let addonService;
const TEST_USER_ID = -9999;
beforeAll(async () => {
    const config = (0, test_config_1.createTestConfig)({
        server: { baseUriPath: '/test' },
    });
    db = await (0, database_init_1.default)('addon_service_serial', no_logger_1.default);
    stores = db.stores;
    const eventService = (0, features_1.createEventsService)(db.rawDatabase, config);
    const tagTypeService = new tag_type_service_1.default(stores, config, eventService);
    const integrationEventsService = new services_1.IntegrationEventsService(stores, config);
    addonService = new addon_service_1.default(stores, config, tagTypeService, eventService, integrationEventsService, addonProvider);
});
afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});
afterEach(async () => {
    const addons = await stores.addonStore.getAll();
    const deleteAll = addons.map((a) => stores.addonStore.delete(a.id));
    await Promise.all(deleteAll);
});
test('should only return active addons', async () => {
    jest.useFakeTimers();
    const config = {
        provider: 'simple',
        enabled: false,
        parameters: {
            url: 'http://localhost/wh',
            var: 'some-value',
        },
        events: [events_1.FEATURE_CREATED],
        description: '',
    };
    const config2 = {
        provider: 'simple',
        enabled: true,
        parameters: {
            url: 'http://localhost/wh',
            var: 'some-value',
        },
        events: [events_1.FEATURE_CREATED],
        description: '',
    };
    const config3 = {
        provider: 'simple',
        enabled: true,
        parameters: {
            url: 'http://localhost/wh',
            var: 'some-value',
        },
        events: [events_1.FEATURE_CREATED],
        description: '',
    };
    await addonService.createAddon(config, types_1.TEST_AUDIT_USER);
    await addonService.createAddon(config2, types_1.TEST_AUDIT_USER);
    await addonService.createAddon(config3, types_1.TEST_AUDIT_USER);
    jest.advanceTimersByTime(61000);
    const activeAddons = await addonService.fetchAddonConfigs();
    const allAddons = await addonService.getAddons();
    expect(activeAddons.length).toBe(2);
    expect(allAddons.length).toBe(3);
    jest.useRealTimers();
});
//# sourceMappingURL=addon-service.e2e.test.js.map