"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../../../test/e2e/helpers/database-init"));
const no_logger_1 = __importDefault(require("../../../test/fixtures/no-logger"));
const createChangeRequestSegmentUsageReadModel_1 = require("./createChangeRequestSegmentUsageReadModel");
const util_1 = require("../../../lib/util");
let db;
let user;
const CR_ID = 123456;
const CR_ID_2 = 234567;
const CR_TITLE = 'My change request';
const FLAG_NAME = 'crarm-test-flag';
let readModel;
beforeAll(async () => {
    db = await (0, database_init_1.default)('change_request_segment_usage_read_model', no_logger_1.default);
    user = await db.stores.userStore.insert({
        username: 'cr-creator',
    });
    readModel = (0, createChangeRequestSegmentUsageReadModel_1.createChangeRequestSegmentUsageReadModel)(db.rawDatabase);
    await db.stores.featureToggleStore.create('default', {
        name: FLAG_NAME,
        createdByUserId: 9999,
    });
});
afterAll(async () => {
    await db.destroy();
});
afterEach(async () => {
    await db.rawDatabase
        .table('change_requests')
        .where('id', CR_ID)
        .orWhere('id', CR_ID_2)
        .delete();
    await db.rawDatabase
        .table('change_request_events')
        .where('change_request_id', CR_ID)
        .orWhere('change_request_id', CR_ID_2)
        .delete();
});
const createCR = async (state, changeRequestId = CR_ID, changeRequestTitle = CR_TITLE) => {
    await db.rawDatabase.table('change_requests').insert({
        id: changeRequestId,
        environment: 'default',
        state,
        project: 'default',
        created_by: user.id,
        created_at: '2023-01-01 00:00:00',
        min_approvals: 1,
        title: changeRequestTitle,
    });
};
const addChangeRequestChange = async (flagName, action, change, changeRequestId) => {
    await db.rawDatabase.table('change_request_events').insert({
        feature: flagName,
        action,
        payload: change,
        created_at: '2023-01-01 00:01:00',
        change_request_id: changeRequestId,
        created_by: user.id,
    });
};
const addStrategyToCr = async (segmentId, flagName, changeRequestId = CR_ID) => {
    await addChangeRequestChange(flagName, 'addStrategy', {
        name: 'flexibleRollout',
        title: '',
        disabled: false,
        segments: [segmentId],
        variants: [],
        parameters: {
            groupId: flagName,
            rollout: '100',
            stickiness: 'default',
        },
        constraints: [],
    }, changeRequestId);
};
const updateStrategyInCr = async (strategyId, segmentId, flagName, changeRequestId = CR_ID) => {
    await addChangeRequestChange(flagName, 'updateStrategy', {
        id: strategyId,
        name: 'flexibleRollout',
        title: '',
        disabled: false,
        segments: [segmentId],
        variants: [],
        parameters: {
            groupId: flagName,
            rollout: '100',
            stickiness: 'default',
        },
        constraints: [],
    }, changeRequestId);
};
test.each([
    ['Draft', true],
    ['In review', true],
    ['Scheduled', true],
    ['Approved', true],
    ['Rejected', false],
    ['Cancelled', false],
    ['Applied', false],
])('addStrategy events in %s CRs should show up only if the CR is active', async (state, isActiveCr) => {
    await createCR(state);
    const segmentId = 3;
    await addStrategyToCr(segmentId, FLAG_NAME);
    const result = await readModel.getStrategiesUsedInActiveChangeRequests(segmentId);
    if (isActiveCr) {
        expect(result).toStrictEqual([
            {
                projectId: 'default',
                strategyName: 'flexibleRollout',
                environment: 'default',
                featureName: FLAG_NAME,
                changeRequest: { id: CR_ID, title: CR_TITLE },
            },
        ]);
    }
    else {
        expect(result).toStrictEqual([]);
    }
});
test.each([
    ['Draft', true],
    ['In review', true],
    ['Scheduled', true],
    ['Approved', true],
    ['Rejected', false],
    ['Cancelled', false],
    ['Applied', false],
])(`updateStrategy events in %s CRs should show up only if the CR is active`, async (state, isActiveCr) => {
    await createCR(state);
    const segmentId = 3;
    const strategyId = (0, util_1.randomId)();
    await updateStrategyInCr(strategyId, segmentId, FLAG_NAME);
    const result = await readModel.getStrategiesUsedInActiveChangeRequests(segmentId);
    if (isActiveCr) {
        expect(result).toMatchObject([
            {
                id: strategyId,
                projectId: 'default',
                strategyName: 'flexibleRollout',
                environment: 'default',
                featureName: FLAG_NAME,
                changeRequest: { id: CR_ID, title: CR_TITLE },
            },
        ]);
    }
    else {
        expect(result).toStrictEqual([]);
    }
});
test(`If the same strategy appears in multiple CRs with the same segment, each segment should be listed as its own entry`, async () => {
    await createCR('In review', CR_ID, CR_TITLE);
    await createCR('In review', CR_ID_2, null);
    const segmentId = 3;
    const strategyId = (0, util_1.randomId)();
    await updateStrategyInCr(strategyId, segmentId, FLAG_NAME, CR_ID);
    await updateStrategyInCr(strategyId, segmentId, FLAG_NAME, CR_ID_2);
    const result = await readModel.getStrategiesUsedInActiveChangeRequests(segmentId);
    expect(result).toHaveLength(2);
    expect(result).toContainEqual({
        id: strategyId,
        projectId: 'default',
        strategyName: 'flexibleRollout',
        environment: 'default',
        featureName: FLAG_NAME,
        changeRequest: { id: CR_ID, title: CR_TITLE },
    });
    expect(result).toContainEqual({
        id: strategyId,
        projectId: 'default',
        strategyName: 'flexibleRollout',
        environment: 'default',
        featureName: FLAG_NAME,
        changeRequest: { id: CR_ID_2, title: null },
    });
});
//# sourceMappingURL=change-request-segment-usage-read-model.test.js.map