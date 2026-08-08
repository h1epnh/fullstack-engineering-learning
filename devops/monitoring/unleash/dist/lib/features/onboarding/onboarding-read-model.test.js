"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../../../test/e2e/helpers/database-init"));
const no_logger_1 = __importDefault(require("../../../test/fixtures/no-logger"));
const types_1 = require("../../types");
const test_helper_1 = require("../../../test/e2e/helpers/test-helper");
const api_token_1 = require("../../types/models/api-token");
let db;
let onboardingReadModel;
let onBoardingStore;
let featureToggleStore;
let lastSeenStore;
let instanceService;
let app;
beforeAll(async () => {
    db = await (0, database_init_1.default)('onboarding_read_model', no_logger_1.default, {
        experimental: { flags: {} },
    });
    app = await (0, test_helper_1.setupAppWithCustomConfig)(db.stores, {
        experimental: {
            flags: {
                strictSchemaValidation: true,
            },
        },
    }, db.rawDatabase);
    onboardingReadModel = db.stores.onboardingReadModel;
    onBoardingStore = db.stores.onboardingStore;
    featureToggleStore = db.stores.featureToggleStore;
    lastSeenStore = db.stores.lastSeenStore;
    instanceService = app.services.clientInstanceService;
});
afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});
beforeEach(async () => {
    await featureToggleStore.deleteAll();
});
test('can get instance onboarding durations', async () => {
    const initialResult = await onboardingReadModel.getInstanceOnboardingMetrics();
    expect(initialResult).toMatchObject({
        firstLogin: null,
        secondLogin: null,
        firstFeatureFlag: null,
        firstPreLive: null,
        firstLive: null,
    });
    await onBoardingStore.insertInstanceEvent({
        type: 'first-user-login',
        timeToEvent: 0,
    });
    const firstLoginResult = await onboardingReadModel.getInstanceOnboardingMetrics();
    expect(firstLoginResult).toMatchObject({
        firstLogin: 0,
        secondLogin: null,
    });
    await onBoardingStore.insertInstanceEvent({
        type: 'second-user-login',
        timeToEvent: 10,
    });
    await onBoardingStore.insertInstanceEvent({
        type: 'flag-created',
        timeToEvent: 20,
    });
    await onBoardingStore.insertInstanceEvent({
        type: 'pre-live',
        timeToEvent: 30,
    });
    await onBoardingStore.insertInstanceEvent({
        type: 'live',
        timeToEvent: 40,
    });
    const secondLoginResult = await onboardingReadModel.getInstanceOnboardingMetrics();
    expect(secondLoginResult).toMatchObject({
        firstLogin: 0,
        secondLogin: 10,
        firstFeatureFlag: 20,
        firstPreLive: 30,
        firstLive: 40,
    });
});
test('can get instance onboarding durations', async () => {
    await onBoardingStore.insertProjectEvent({
        project: 'default',
        type: 'flag-created',
        timeToEvent: 20,
    });
    await onBoardingStore.insertProjectEvent({
        project: 'default',
        type: 'pre-live',
        timeToEvent: 30,
    });
    await onBoardingStore.insertProjectEvent({
        project: 'default',
        type: 'live',
        timeToEvent: 40,
    });
    const projectOnboardingResult = await onboardingReadModel.getProjectsOnboardingMetrics();
    expect(projectOnboardingResult).toMatchObject([
        {
            project: 'default',
            firstFeatureFlag: 20,
            firstPreLive: 30,
            firstLive: 40,
        },
    ]);
});
test('can get project onboarding status', async () => {
    const onboardingStartedResult = await onboardingReadModel.getOnboardingStatusForProject('default');
    expect(onboardingStartedResult).toMatchObject({
        status: 'onboarding-started',
    });
    await featureToggleStore.create('default', {
        name: 'my-flag',
        createdByUserId: types_1.SYSTEM_USER.id,
    });
    const firstFlagResult = await onboardingReadModel.getOnboardingStatusForProject('default');
    expect(firstFlagResult).toMatchObject({
        status: 'first-flag-created',
        feature: 'my-flag',
    });
    await lastSeenStore.setLastSeen([
        {
            environment: 'default',
            featureName: 'my-flag',
        },
    ]);
    const onboardedResult = await onboardingReadModel.getOnboardingStatusForProject('default');
    expect(onboardedResult).toMatchObject({
        status: 'onboarded',
    });
});
test('archived feature counts as onboarded', async () => {
    await featureToggleStore.create('default', {
        name: 'my-flag',
        createdByUserId: types_1.SYSTEM_USER.id,
    });
    await lastSeenStore.setLastSeen([
        {
            environment: 'default',
            featureName: 'my-flag',
        },
    ]);
    await featureToggleStore.archive('my-flag');
    const onboardedResult = await onboardingReadModel.getOnboardingStatusForProject('default');
    expect(onboardedResult).toMatchObject({
        status: 'onboarded',
    });
});
test('sdk register also onboards a project', async () => {
    await featureToggleStore.create('default', {
        name: 'my-flag',
        createdByUserId: types_1.SYSTEM_USER.id,
    });
    const defaultProjectToken = await app.services.apiTokenService.createApiTokenWithProjects({
        type: api_token_1.ApiTokenType.CLIENT,
        projects: ['default'],
        environment: 'default',
        tokenName: 'tester',
    });
    await app.request
        .post('/api/client/register')
        .set('Authorization', defaultProjectToken.secret)
        .send({
        appName: 'multi-project-app',
        instanceId: 'instance-1',
        strategies: ['default'],
        started: Date.now(),
        interval: 10,
    });
    await instanceService.bulkAdd();
    const onboardedResult = await onboardingReadModel.getOnboardingStatusForProject('default');
    expect(onboardedResult).toMatchObject({
        status: 'onboarded',
    });
});
//# sourceMappingURL=onboarding-read-model.test.js.map