"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
const test_config_1 = require("../../test/config/test-config");
const feature_toggle_service_1 = __importDefault(require("../features/feature-toggle/feature-toggle-service"));
const event_service_1 = __importDefault(require("../features/events/event-service"));
const fake_feature_tag_store_1 = __importDefault(require("../../test/fixtures/fake-feature-tag-store"));
test('Should only store events for potentially stale on', async () => {
    expect.assertions(2);
    const featureUpdates = [
        { name: 'feature1', potentiallyStale: true, project: 'default' },
        { name: 'feature2', potentiallyStale: false, project: 'default' },
    ];
    const config = (0, test_config_1.createTestConfig)();
    const eventService = new event_service_1.default({
        // @ts-expect-error
        eventStore: {
            batchStore: async (events) => {
                expect(events.length).toBe(1);
                const [event1] = events;
                expect(event1).toMatchObject({
                    featureName: 'feature1',
                    project: 'default',
                    type: types_1.FEATURE_POTENTIALLY_STALE_ON,
                });
            },
        },
        featureTagStore: new fake_feature_tag_store_1.default(),
    }, config, {}, {});
    const featureToggleService = new feature_toggle_service_1.default({
        featureToggleStore: {
            updatePotentiallyStaleFeatures: () => featureUpdates,
        },
        featureTagStore: {
            getAllTagsForFeature: () => [],
        },
    }, {
        ...config,
        flagResolver: { isEnabled: () => true },
        experimental: {
            ...(config.experimental ?? {}),
        },
    }, {}, {}, eventService, {}, {}, {}, {}, {}, {});
    await featureToggleService.updatePotentiallyStaleFeatures();
});
//# sourceMappingURL=feature-service-potentially-stale.test.js.map