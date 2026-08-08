"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../../../../../test/e2e/helpers/database-init"));
const test_helper_1 = require("../../../../../test/e2e/helpers/test-helper");
const no_logger_1 = __importDefault(require("../../../../../test/fixtures/no-logger"));
const types_1 = require("../../../../types");
let app;
let db;
beforeAll(async () => {
    db = await (0, database_init_1.default)('last_seen_at_service_e2e', no_logger_1.default);
    app = await (0, test_helper_1.setupAppWithCustomConfig)(db.stores, {
        experimental: {
            flags: {
                strictSchemaValidation: true,
            },
        },
    }, db.rawDatabase);
});
beforeEach(async () => {
    await db.rawDatabase.raw('DELETE FROM last_seen_at_metrics;');
});
afterAll(async () => {
    await app.destroy();
    await db.destroy();
});
test('should clean unknown feature flag names from last seen store', async () => {
    const { lastSeenService, featureToggleService } = app.services;
    const clean = ['clean1', 'clean2', 'clean3', 'clean4'];
    const dirty = ['dirty1', 'dirty2', 'dirty3', 'dirty4'];
    await Promise.all(clean.map((featureName) => featureToggleService.createFeatureToggle('default', { name: featureName }, types_1.TEST_AUDIT_USER)));
    const inserts = [...clean, ...dirty].map((feature) => {
        return {
            featureName: feature,
            environment: 'default',
            yes: 1,
            no: 0,
            appName: 'test',
            timestamp: new Date(),
        };
    });
    lastSeenService.updateLastSeen(inserts);
    await lastSeenService.store();
    // We have no method to get these from the last seen service or any other service or store
    let stored = await db.rawDatabase.raw('SELECT * FROM last_seen_at_metrics;');
    expect(stored.rows.length).toBe(8);
    await lastSeenService.cleanLastSeen();
    stored = await db.rawDatabase.raw('SELECT * FROM last_seen_at_metrics;');
    expect(stored.rows.length).toBe(4);
    expect(stored.rows).toMatch;
    const notInDirty = stored.rows.filter((row) => !dirty.includes(row.feature_name));
    expect(notInDirty.length).toBe(4);
});
test('should clean unknown feature flag environments from last seen store', async () => {
    const { lastSeenService, featureToggleService } = app.services;
    const clean = [
        { name: 'clean5', environment: 'default' },
        { name: 'clean6', environment: 'default' },
        { name: 'clean7', environment: 'nonexisting' },
        { name: 'clean8', environment: 'nonexisting' },
    ];
    await Promise.all(clean.map((feature) => featureToggleService.createFeatureToggle('default', { name: feature.name }, types_1.TEST_AUDIT_USER)));
    const inserts = [...clean].map((feature) => {
        return {
            featureName: feature.name,
            environment: feature.environment,
            yes: 1,
            no: 0,
            appName: 'test',
            timestamp: new Date(),
        };
    });
    lastSeenService.updateLastSeen(inserts);
    await lastSeenService.store();
    // We have no method to get these from the last seen service or any other service or store
    let stored = await db.rawDatabase.raw('SELECT * FROM last_seen_at_metrics;');
    expect(stored.rows.length).toBe(4);
    await lastSeenService.cleanLastSeen();
    stored = await db.rawDatabase.raw('SELECT * FROM last_seen_at_metrics;');
    expect(stored.rows.length).toBe(2);
});
test('should not fail with feature names longer than 255 chars', async () => {
    const { lastSeenService } = app.services;
    const longFeatureNames = [
        { name: 'a'.repeat(254), environment: 'default' },
        { name: 'b'.repeat(255), environment: 'default' },
        { name: 'c'.repeat(256), environment: 'default' }, // this one should be filtered out
    ];
    const inserts = [...longFeatureNames].map((feature) => {
        return {
            featureName: feature.name,
            environment: feature.environment,
            yes: 1,
            no: 0,
            appName: 'test',
            timestamp: new Date(),
        };
    });
    lastSeenService.updateLastSeen(inserts);
    await lastSeenService.store();
    // We have no method to get these from the last seen service or any other service or store
    const stored = await db.rawDatabase.raw('SELECT * FROM last_seen_at_metrics;');
    expect(stored.rows.length).toBe(2);
});
//# sourceMappingURL=last-seen-service.e2e.test.js.map