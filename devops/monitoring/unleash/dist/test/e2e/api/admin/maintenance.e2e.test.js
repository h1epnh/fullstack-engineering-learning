"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../../helpers/database-init"));
const test_helper_1 = require("../../helpers/test-helper");
const no_logger_1 = __importDefault(require("../../../fixtures/no-logger"));
let db;
beforeAll(async () => {
    db = await (0, database_init_1.default)('maintenance_api_serial', no_logger_1.default);
});
afterEach(async () => {
    await db.stores.featureToggleStore.deleteAll();
});
afterAll(async () => {
    await db.destroy();
});
test('should not allow to create feature flags in maintenance mode', async () => {
    const appWithMaintenanceMode = await (0, test_helper_1.setupAppWithCustomConfig)(db.stores, {
        experimental: {
            flags: {
                maintenanceMode: true,
            },
        },
    });
    return appWithMaintenanceMode.request
        .post('/api/admin/projects/default/features')
        .send({
        name: 'maintenance-feature',
    })
        .set('Content-Type', 'application/json')
        .expect(503);
});
test('maintenance mode is off by default', async () => {
    const appWithMaintenanceMode = await (0, test_helper_1.setupApp)(db.stores);
    return appWithMaintenanceMode.request
        .post('/api/admin/projects/default/features')
        .send({
        name: 'maintenance-feature1',
    })
        .set('Content-Type', 'application/json')
        .expect(201);
});
test('should go into maintenance mode, when user has set it', async () => {
    const appWithMaintenanceMode = await (0, test_helper_1.setupApp)(db.stores);
    await appWithMaintenanceMode.request
        .post('/api/admin/maintenance')
        .send({
        enabled: true,
    })
        .set('Content-Type', 'application/json')
        .expect(204);
    return appWithMaintenanceMode.request
        .post('/api/admin/projects/default/features')
        .send({
        name: 'maintenance-feature1',
    })
        .set('Content-Type', 'application/json')
        .expect(503);
});
test('maintenance mode flag should take precedence over maintenance mode setting', async () => {
    const appWithMaintenanceMode = await (0, test_helper_1.setupAppWithCustomConfig)(db.stores, {
        experimental: {
            flags: {
                maintenanceMode: true,
            },
        },
    });
    await appWithMaintenanceMode.request
        .post('/api/admin/maintenance')
        .send({
        enabled: false,
    })
        .set('Content-Type', 'application/json')
        .expect(204);
    return appWithMaintenanceMode.request
        .post('/api/admin/projects/default/features')
        .send({
        name: 'maintenance-feature1',
    })
        .set('Content-Type', 'application/json')
        .expect(503);
});
//# sourceMappingURL=maintenance.e2e.test.js.map