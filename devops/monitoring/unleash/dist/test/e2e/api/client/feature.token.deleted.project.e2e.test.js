"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_helper_1 = require("../../helpers/test-helper");
const database_init_1 = __importDefault(require("../../helpers/database-init"));
const no_logger_1 = __importDefault(require("../../../fixtures/no-logger"));
const api_token_1 = require("../../../../lib/types/models/api-token");
const constants_1 = require("../../../../lib/util/constants");
const types_1 = require("../../../../lib/types");
const server_impl_1 = require("../../../../lib/server-impl");
let app;
let db;
let apiTokenService;
const environment = 'testing';
const project = 'default';
const project2 = 'some';
const deletionProject = 'deletion';
const deletionTokenName = 'delete';
const feature1 = 'f1.token.access';
const feature2 = 'f2.token.access';
const feature3 = 'f3.p2.token.access';
beforeAll(async () => {
    db = await (0, database_init_1.default)('feature_api_api_access_client_deletion', no_logger_1.default);
    app = await (0, test_helper_1.setupAppWithAuth)(db.stores, {}, db.rawDatabase);
    apiTokenService = app.services.apiTokenService;
    const { featureToggleService, environmentService } = app.services;
    const { environmentStore, projectStore } = db.stores;
    await environmentStore.create({
        name: environment,
        type: 'test',
    });
    await projectStore.create({
        id: project2,
        name: 'Test Project 2',
        description: '',
        mode: 'open',
    });
    await projectStore.create({
        id: deletionProject,
        name: 'Deletion Project',
        description: '',
        mode: 'open',
    });
    await environmentService.addEnvironmentToProject(environment, project, types_1.TEST_AUDIT_USER);
    await environmentService.addEnvironmentToProject(environment, project2, types_1.TEST_AUDIT_USER);
    await featureToggleService.createFeatureToggle(project, {
        name: feature1,
        description: 'the #1 feature',
    }, types_1.TEST_AUDIT_USER);
    await featureToggleService.createStrategy({
        name: 'default',
        constraints: [],
        parameters: {},
    }, { projectId: project, featureName: feature1, environment: constants_1.DEFAULT_ENV }, types_1.TEST_AUDIT_USER);
    await featureToggleService.createStrategy({
        name: 'default',
        constraints: [],
        parameters: {},
    }, { projectId: project, featureName: feature1, environment }, types_1.TEST_AUDIT_USER);
    // create feature 2
    await featureToggleService.createFeatureToggle(project, {
        name: feature2,
    }, types_1.TEST_AUDIT_USER);
    await featureToggleService.createStrategy({
        name: 'default',
        constraints: [],
        parameters: {},
    }, { projectId: project, featureName: feature2, environment }, types_1.TEST_AUDIT_USER);
    // create feature 3
    await featureToggleService.createFeatureToggle(project2, {
        name: feature3,
    }, types_1.TEST_AUDIT_USER);
    await featureToggleService.createStrategy({
        name: 'default',
        constraints: [],
        parameters: {},
    }, { projectId: project2, featureName: feature3, environment }, types_1.TEST_AUDIT_USER);
});
afterAll(async () => {
    await app.destroy();
    await db.destroy();
});
test('doesnt return feature flags if project deleted', async () => {
    const token = await apiTokenService.createApiToken({
        type: api_token_1.ApiTokenType.CLIENT,
        tokenName: deletionTokenName,
        environment,
        project: deletionProject,
    });
    await app.services.projectService.deleteProject(deletionProject, new server_impl_1.User(types_1.TEST_AUDIT_USER), types_1.TEST_AUDIT_USER);
    await app.services.apiTokenService.fetchActiveTokens();
    await app.request
        .get('/api/client/features')
        .set('Authorization', token.secret)
        .expect('Content-Type', /json/)
        .expect(401);
});
//# sourceMappingURL=feature.token.deleted.project.e2e.test.js.map