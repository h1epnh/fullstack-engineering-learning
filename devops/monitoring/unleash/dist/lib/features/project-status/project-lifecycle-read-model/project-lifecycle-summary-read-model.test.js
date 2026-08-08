"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const date_fns_1 = require("date-fns");
const database_init_1 = __importDefault(require("../../../../test/e2e/helpers/database-init"));
const no_logger_1 = __importDefault(require("../../../../test/fixtures/no-logger"));
const project_lifecycle_summary_read_model_1 = require("./project-lifecycle-summary-read-model");
const util_1 = require("../../../util");
let db;
let readModel;
beforeAll(async () => {
    db = await (0, database_init_1.default)('project_lifecycle_summary_read_model_serial', no_logger_1.default);
    readModel = new project_lifecycle_summary_read_model_1.ProjectLifecycleSummaryReadModel(db.rawDatabase, db.stores.featureToggleStore);
});
afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});
afterEach(async () => {
    await db.stores.projectStore.deleteAll();
    await db.stores.featureToggleStore.deleteAll();
    await db.stores.featureLifecycleStore.deleteAll();
});
const updateFeatureStageDate = async (flagName, stage, newDate) => {
    await db
        .rawDatabase('feature_lifecycles')
        .where({ feature: flagName, stage: stage })
        .update({ created_at: newDate });
};
describe('Average time calculation', () => {
    test('it calculates the average time for each stage', async () => {
        const project = await db.stores.projectStore.create({
            name: 'project',
            id: (0, util_1.randomId)(),
        });
        const now = new Date();
        const flags = [
            { name: (0, util_1.randomId)(), offsets: [2, 5, 6, 10] },
            { name: (0, util_1.randomId)(), offsets: [1, null, 4, 7] },
            { name: (0, util_1.randomId)(), offsets: [12, 25, 0, 9] },
            { name: (0, util_1.randomId)(), offsets: [1, 2, 3, null] },
        ];
        for (const { name, offsets } of flags) {
            const created = await db.stores.featureToggleStore.create(project.id, {
                name,
                createdByUserId: 1,
            });
            await db.stores.featureLifecycleStore.insert([
                {
                    feature: name,
                    stage: 'initial',
                },
            ]);
            const stages = ['pre-live', 'live', 'completed', 'archived'];
            for (const [index, stage] of stages.entries()) {
                const offset = offsets[index];
                if (offset === null) {
                    continue;
                }
                const offsetFromInitial = offsets
                    .slice(0, index + 1)
                    .reduce((a, b) => (a ?? 0) + (b ?? 0), 0);
                await db.stores.featureLifecycleStore.insert([
                    {
                        feature: created.name,
                        stage: stage,
                    },
                ]);
                await updateFeatureStageDate(created.name, stage, (0, date_fns_1.addMinutes)((0, date_fns_1.addDays)(now, offsetFromInitial), 1 * (index + 1)));
            }
        }
        const result = await readModel.getAverageTimeInEachStage(project.id);
        expect(result).toMatchObject({
            initial: 4, // (2 + 1 + 12 + 1) / 4 = 4
            'pre-live': 9, // (5 + 4 + 25 + 2) / 4 = 9
            live: 3, // (6 + 0 + 3) / 3 = 3
            completed: 9, // (10 + 7 + 9) / 3 ~= 8.67 ~= 9
        });
    });
    test('it returns `null` if it has no data for something', async () => {
        const project = await db.stores.projectStore.create({
            name: 'project',
            id: (0, util_1.randomId)(),
        });
        const result1 = await readModel.getAverageTimeInEachStage(project.id);
        expect(result1).toMatchObject({
            initial: null,
            'pre-live': null,
            live: null,
            completed: null,
        });
        const flag = await db.stores.featureToggleStore.create(project.id, {
            name: (0, util_1.randomId)(),
            createdByUserId: 1,
        });
        await db.stores.featureLifecycleStore.insert([
            {
                feature: flag.name,
                stage: 'initial',
            },
        ]);
        await db.stores.featureLifecycleStore.insert([
            {
                feature: flag.name,
                stage: 'pre-live',
            },
        ]);
        await updateFeatureStageDate(flag.name, 'pre-live', (0, date_fns_1.addDays)(new Date(), 5));
        const result2 = await readModel.getAverageTimeInEachStage(project.id);
        expect(result2).toMatchObject({
            initial: 5,
            'pre-live': null,
            live: null,
            completed: null,
        });
    });
    test('it ignores flags in other projects', async () => {
        const project = await db.stores.projectStore.create({
            name: 'project',
            id: (0, util_1.randomId)(),
        });
        const flag = await db.stores.featureToggleStore.create(project.id, {
            name: (0, util_1.randomId)(),
            createdByUserId: 1,
        });
        await db.stores.featureLifecycleStore.insert([
            {
                feature: flag.name,
                stage: 'initial',
            },
        ]);
        await db.stores.featureLifecycleStore.insert([
            {
                feature: flag.name,
                stage: 'pre-live',
            },
        ]);
        await updateFeatureStageDate(flag.name, 'pre-live', (0, date_fns_1.addDays)(new Date(), 5));
        const result = await readModel.getAverageTimeInEachStage('some-other-project');
        expect(result).toMatchObject({
            initial: null,
            'pre-live': null,
            live: null,
            completed: null,
        });
    });
});
describe('count current flags in each stage', () => {
    test('it counts the number of flags in each stage for the given project', async () => {
        const project = await db.stores.projectStore.create({
            name: 'project',
            id: (0, util_1.randomId)(),
        });
        const flags = [
            {
                name: (0, util_1.randomId)(),
                stages: ['initial', 'live'],
            },
            {
                name: (0, util_1.randomId)(),
                stages: ['initial'],
            },
            {
                name: (0, util_1.randomId)(),
                stages: ['initial', 'pre-live', 'live', 'completed'],
            },
            { name: (0, util_1.randomId)(), stages: ['initial', 'pre-live', 'live'] },
        ];
        for (const { name, stages } of flags) {
            const flag = await db.stores.featureToggleStore.create(project.id, {
                name,
                createdByUserId: 1,
            });
            const time = Date.now();
            for (const [index, stage] of stages.entries()) {
                await db.stores.featureLifecycleStore.insert([
                    {
                        feature: flag.name,
                        stage: stage,
                    },
                ]);
                await db
                    .rawDatabase('feature_lifecycles')
                    .where({
                    feature: flag.name,
                    stage: stage,
                })
                    .update({
                    created_at: (0, date_fns_1.addMinutes)(time, index),
                });
            }
        }
        const otherProject = await db.stores.projectStore.create({
            name: 'project',
            id: (0, util_1.randomId)(),
        });
        const flagInOtherProject = await db.stores.featureToggleStore.create(otherProject.id, {
            name: (0, util_1.randomId)(),
            createdByUserId: 1,
        });
        await db.stores.featureLifecycleStore.insert([
            {
                feature: flagInOtherProject.name,
                stage: 'initial',
            },
            {
                feature: flagInOtherProject.name,
                stage: 'pre-live',
            },
        ]);
        const result = await readModel.getCurrentFlagsInEachStage(project.id);
        expect(result).toMatchObject({
            initial: 1,
            'pre-live': 0,
            live: 2,
            completed: 1,
            archived: 0,
        });
    });
    test('if a flag is archived, but does not have the corresponding lifecycle stage, we still count it as archived and exclude it from other stages', async () => {
        const project = await db.stores.projectStore.create({
            name: 'project',
            id: (0, util_1.randomId)(),
        });
        const flag = await db.stores.featureToggleStore.create(project.id, {
            name: (0, util_1.randomId)(),
            createdByUserId: 1,
        });
        await db.stores.featureLifecycleStore.insert([
            {
                feature: flag.name,
                stage: 'initial',
            },
        ]);
        await db.stores.featureToggleStore.archive(flag.name);
        const result = await readModel.getCurrentFlagsInEachStage(project.id);
        expect(result).toMatchObject({
            initial: 0,
            archived: 1,
        });
    });
    test('the archived count is based on the features table (source of truth), not the lifecycle table', async () => {
        const project = await db.stores.projectStore.create({
            name: 'project',
            id: (0, util_1.randomId)(),
        });
        const flag = await db.stores.featureToggleStore.create(project.id, {
            name: (0, util_1.randomId)(),
            createdByUserId: 1,
        });
        await db.stores.featureToggleStore.archive(flag.name);
        const result = await readModel.getCurrentFlagsInEachStage(project.id);
        expect(result).toMatchObject({
            initial: 0,
            archived: 1,
        });
    });
});
//# sourceMappingURL=project-lifecycle-summary-read-model.test.js.map