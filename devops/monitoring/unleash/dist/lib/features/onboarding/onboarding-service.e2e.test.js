"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../../../test/e2e/helpers/database-init"));
const no_logger_1 = __importDefault(require("../../../test/fixtures/no-logger"));
const date_fns_1 = require("date-fns");
const test_config_1 = require("../../../test/config/test-config");
const createOnboardingService_1 = require("./createOnboardingService");
const metric_events_1 = require("../../metric-events");
let db;
let stores;
let onboardingService;
let eventBus;
let onboardingReadModel;
beforeAll(async () => {
    db = await (0, database_init_1.default)('onboarding_store', no_logger_1.default);
    const config = (0, test_config_1.createTestConfig)({
        experimental: { flags: {} },
    });
    stores = db.stores;
    eventBus = config.eventBus;
    onboardingService = (0, createOnboardingService_1.createOnboardingService)(config)(db.rawDatabase);
    onboardingService.listen();
    onboardingReadModel = db.stores.onboardingReadModel;
});
afterAll(async () => {
    await db.destroy();
});
beforeEach(async () => {
    await stores.featureToggleStore.deleteAll();
    await stores.projectStore.deleteAll();
    await stores.onboardingStore.deleteAll();
    await stores.userStore.deleteAll();
    jest.useRealTimers();
});
test('Default project should take first user created instead of project created as start time', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date());
    const { userStore, featureToggleStore, projectStore } = stores;
    // default projects are created in advance and should be ignored
    await projectStore.create({ id: 'default', name: 'irrelevant' });
    jest.advanceTimersByTime((0, date_fns_1.minutesToMilliseconds)(1));
    const user = await userStore.insert({});
    await featureToggleStore.create('default', {
        name: 'test-default',
        createdByUserId: user.id,
    });
    jest.advanceTimersByTime((0, date_fns_1.minutesToMilliseconds)(1));
    await onboardingService.insert({
        type: 'flag-created',
        flag: 'test-default',
    });
    await onboardingService.insert({ type: 'pre-live', flag: 'test-default' });
    await onboardingService.insert({ type: 'live', flag: 'test-default' });
    const { rows: projectEvents } = await db.rawDatabase.raw('SELECT * FROM onboarding_events_project');
    expect(projectEvents).toMatchObject([
        { event: 'first-flag', time_to_event: 60, project: 'default' },
        {
            event: 'first-pre-live',
            time_to_event: 60,
            project: 'default',
        },
        { event: 'first-live', time_to_event: 60, project: 'default' },
    ]);
});
test('Ignore events for existing customers', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2024, 8, 2)); // day before we added metrics
    const { userStore } = stores;
    await userStore.insert({});
    jest.setSystemTime(new Date());
    await onboardingService.insert({ type: 'first-user-login' });
    const { rows: instanceEvents } = await db.rawDatabase.raw('SELECT * FROM onboarding_events_instance');
    expect(instanceEvents).toMatchObject([]);
});
test('Ignore system user in onboarding events', async () => {
    // system users are not counted towards onboarding metrics
    await db.rawDatabase.raw('INSERT INTO users (is_system) VALUES (true)');
    await onboardingService.insert({ type: 'first-user-login' });
    const { rows: instanceEvents } = await db.rawDatabase.raw('SELECT * FROM onboarding_events_instance');
    expect(instanceEvents).toMatchObject([]);
});
test('Storing onboarding events', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date());
    const { userStore, featureToggleStore, projectStore } = stores;
    const user = await userStore.insert({});
    await projectStore.create({ id: 'test_project', name: 'irrelevant' });
    await featureToggleStore.create('test_project', {
        name: 'test',
        createdByUserId: user.id,
    });
    jest.advanceTimersByTime((0, date_fns_1.minutesToMilliseconds)(1));
    await onboardingService.insert({ type: 'first-user-login' });
    jest.advanceTimersByTime((0, date_fns_1.minutesToMilliseconds)(1));
    await onboardingService.insert({ type: 'second-user-login' });
    jest.advanceTimersByTime((0, date_fns_1.minutesToMilliseconds)(1));
    await onboardingService.insert({ type: 'flag-created', flag: 'test' });
    await onboardingService.insert({ type: 'flag-created', flag: 'test' });
    await onboardingService.insert({ type: 'flag-created', flag: 'invalid' });
    jest.advanceTimersByTime((0, date_fns_1.minutesToMilliseconds)(1));
    await onboardingService.insert({ type: 'pre-live', flag: 'test' });
    await onboardingService.insert({ type: 'pre-live', flag: 'test' });
    await onboardingService.insert({ type: 'pre-live', flag: 'invalid' });
    jest.advanceTimersByTime((0, date_fns_1.minutesToMilliseconds)(1));
    await onboardingService.insert({ type: 'live', flag: 'test' });
    jest.advanceTimersByTime((0, date_fns_1.minutesToMilliseconds)(1));
    await onboardingService.insert({ type: 'live', flag: 'test' });
    jest.advanceTimersByTime((0, date_fns_1.minutesToMilliseconds)(1));
    await onboardingService.insert({ type: 'live', flag: 'invalid' });
    const { rows: instanceEvents } = await db.rawDatabase.raw('SELECT * FROM onboarding_events_instance');
    expect(instanceEvents).toMatchObject([
        { event: 'first-user-login', time_to_event: 60 },
        { event: 'second-user-login', time_to_event: 120 },
        { event: 'first-flag', time_to_event: 180 },
        { event: 'first-pre-live', time_to_event: 240 },
        { event: 'first-live', time_to_event: 300 },
    ]);
    const { rows: projectEvents } = await db.rawDatabase.raw('SELECT * FROM onboarding_events_project');
    expect(projectEvents).toMatchObject([
        { event: 'first-flag', time_to_event: 180, project: 'test_project' },
        {
            event: 'first-pre-live',
            time_to_event: 240,
            project: 'test_project',
        },
        { event: 'first-live', time_to_event: 300, project: 'test_project' },
    ]);
});
const reachedOnboardingEvents = (count) => {
    let processedOnboardingEvents = 0;
    return new Promise((resolve) => {
        eventBus.on('onboarding-event', () => {
            processedOnboardingEvents += 1;
            if (processedOnboardingEvents === count)
                resolve('done');
        });
    });
};
test('Reacting to events', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date());
    const { userStore, featureToggleStore, projectStore } = stores;
    const user = await userStore.insert({});
    await projectStore.create({ id: 'test_project', name: 'irrelevant' });
    await featureToggleStore.create('test_project', {
        name: 'test',
        createdByUserId: user.id,
    });
    jest.advanceTimersByTime((0, date_fns_1.minutesToMilliseconds)(1));
    eventBus.emit(metric_events_1.USER_LOGIN, { loginOrder: 0 });
    eventBus.emit(metric_events_1.USER_LOGIN, { loginOrder: 1 });
    eventBus.emit(metric_events_1.STAGE_ENTERED, { stage: 'initial', feature: 'test' });
    eventBus.emit(metric_events_1.STAGE_ENTERED, { stage: 'pre-live', feature: 'test' });
    eventBus.emit(metric_events_1.STAGE_ENTERED, { stage: 'live', feature: 'test' });
    await reachedOnboardingEvents(5);
    const instanceMetrics = await onboardingReadModel.getInstanceOnboardingMetrics();
    const projectMetrics = await onboardingReadModel.getProjectsOnboardingMetrics();
    expect(instanceMetrics).toMatchObject({
        firstLogin: 60,
        secondLogin: 60,
        firstFeatureFlag: 60,
        firstPreLive: 60,
        firstLive: 60,
    });
    expect(projectMetrics).toMatchObject([
        {
            project: 'test_project',
            firstFeatureFlag: 60,
            firstPreLive: 60,
            firstLive: 60,
        },
    ]);
});
//# sourceMappingURL=onboarding-service.e2e.test.js.map