"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../helpers/database-init"));
const no_logger_1 = __importDefault(require("../../fixtures/no-logger"));
const project_health_service_1 = __importDefault(require("../../../lib/services/project-health-service"));
const test_config_1 = require("../../config/test-config");
const types_1 = require("../../../lib/types");
const features_1 = require("../../../lib/features");
let stores;
let db;
let projectService;
let projectHealthService;
let user;
beforeAll(async () => {
    const config = (0, test_config_1.createTestConfig)();
    db = await (0, database_init_1.default)('project_health_service_serial', no_logger_1.default);
    stores = db.stores;
    user = await stores.userStore.insert({
        name: 'Some Name',
        email: 'test@getunleash.io',
    });
    projectService = (0, features_1.createProjectService)(db.rawDatabase, config);
    projectHealthService = new project_health_service_1.default(stores, config, projectService);
});
afterAll(async () => {
    await db.destroy();
});
test('Project with no stale toggles should have 100% health rating', async () => {
    const project = {
        id: 'health-rating',
        name: 'Health rating',
        description: 'Fancy',
    };
    const savedProject = await projectService.createProject(project, user, types_1.TEST_AUDIT_USER);
    await stores.featureToggleStore.create('health-rating', {
        name: 'health-rating-not-stale',
        description: 'new',
        stale: false,
        createdByUserId: 9999,
    });
    await stores.featureToggleStore.create('health-rating', {
        name: 'health-rating-not-stale-2',
        description: 'new too',
        stale: false,
        createdByUserId: 9999,
    });
    const rating = await projectHealthService.calculateHealthRating(savedProject);
    expect(rating).toBe(100);
});
test('Project with two stale toggles and two non stale should have 50% health rating', async () => {
    const project = {
        id: 'health-rating-2',
        name: 'Health rating',
        description: 'Fancy',
    };
    const savedProject = await projectService.createProject(project, user, types_1.TEST_AUDIT_USER);
    await stores.featureToggleStore.create('health-rating-2', {
        name: 'health-rating-2-not-stale',
        description: 'new',
        stale: false,
        createdByUserId: 9999,
    });
    await stores.featureToggleStore.create('health-rating-2', {
        name: 'health-rating-2-not-stale-2',
        description: 'new too',
        stale: false,
        createdByUserId: 9999,
    });
    await stores.featureToggleStore.create('health-rating-2', {
        name: 'health-rating-2-stale-1',
        description: 'stale',
        stale: true,
        createdByUserId: 9999,
    });
    await stores.featureToggleStore.create('health-rating-2', {
        name: 'health-rating-2-stale-2',
        description: 'stale too',
        stale: true,
        createdByUserId: 9999,
    });
    const rating = await projectHealthService.calculateHealthRating(savedProject);
    expect(rating).toBe(50);
});
test('Project with one non-stale, one potentially stale and one stale should have 33% health rating', async () => {
    const project = {
        id: 'health-rating-3',
        name: 'Health rating',
        description: 'Fancy',
    };
    const savedProject = await projectService.createProject(project, user, types_1.TEST_AUDIT_USER);
    await stores.featureToggleStore.create('health-rating-3', {
        name: 'health-rating-3-not-stale',
        description: 'new',
        stale: false,
        createdByUserId: 9999,
    });
    await stores.featureToggleStore.create('health-rating-3', {
        name: 'health-rating-3-potentially-stale',
        description: 'new too',
        type: 'release',
        stale: false,
        createdAt: new Date(Date.UTC(2020, 1, 1)),
        createdByUserId: 9999,
    });
    await stores.featureToggleStore.create('health-rating-3', {
        name: 'health-rating-3-stale',
        description: 'stale',
        stale: true,
        createdByUserId: 9999,
    });
    const rating = await projectHealthService.calculateHealthRating(savedProject);
    expect(rating).toBe(33);
});
//# sourceMappingURL=project-health-service.e2e.test.js.map