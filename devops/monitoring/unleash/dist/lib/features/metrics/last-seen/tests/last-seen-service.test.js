"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const store_1 = __importDefault(require("../../../../../test/fixtures/store"));
const events_1 = __importDefault(require("events"));
const no_logger_1 = __importDefault(require("../../../../../test/fixtures/no-logger"));
const last_seen_service_1 = require("../last-seen-service");
function initLastSeenService(flagEnabled = true) {
    const stores = (0, store_1.default)();
    const eventBus = new events_1.default();
    eventBus.emit = jest.fn();
    const config = {
        eventBus,
        getLogger: no_logger_1.default,
        flagResolver: {
            isEnabled: () => {
                return flagEnabled;
            },
        },
    };
    const lastSeenService = new last_seen_service_1.LastSeenService({
        lastSeenStore: stores.lastSeenStore,
    }, config);
    return {
        lastSeenService,
        featureToggleStore: stores.featureToggleStore,
        lastSeenStore: stores.lastSeenStore,
    };
}
test('should not add duplicates per feature/environment', async () => {
    const { lastSeenService, featureToggleStore, lastSeenStore } = initLastSeenService(false);
    const lastSeenSpy = jest.spyOn(lastSeenStore, 'setLastSeen');
    lastSeenService.updateLastSeen([
        {
            featureName: 'myFeature',
            environment: 'development',
            yes: 1,
            no: 0,
            appName: 'test',
            timestamp: new Date(),
        },
    ]);
    lastSeenService.updateLastSeen([
        {
            featureName: 'myFeature',
            environment: 'development',
            yes: 1,
            no: 0,
            appName: 'test',
            timestamp: new Date(),
        },
    ]);
    await lastSeenService.store();
    expect(lastSeenSpy).toHaveBeenCalledWith([
        {
            environment: 'development',
            featureName: 'myFeature',
        },
    ]);
});
test('should call last seen at store with correct data', async () => {
    const { lastSeenService, lastSeenStore, featureToggleStore } = initLastSeenService(true);
    lastSeenService.updateLastSeen([
        {
            featureName: 'myFeature',
            environment: 'development',
            yes: 1,
            no: 0,
            appName: 'test',
            timestamp: new Date(),
        },
    ]);
    lastSeenService.updateLastSeen([
        {
            featureName: 'myFeature',
            environment: 'development',
            yes: 1,
            no: 0,
            appName: 'test',
            timestamp: new Date(),
        },
    ]);
    lastSeenStore.setLastSeen = jest.fn();
    await lastSeenService.store();
    expect(lastSeenStore.setLastSeen).toHaveBeenCalledWith([
        {
            environment: 'development',
            featureName: 'myFeature',
        },
    ]);
});
//# sourceMappingURL=last-seen-service.test.js.map