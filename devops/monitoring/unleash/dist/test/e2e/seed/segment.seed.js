"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../helpers/database-init"));
const no_logger_1 = __importDefault(require("../../fixtures/no-logger"));
const assert_1 = __importDefault(require("assert"));
const random_id_1 = require("../../../lib/util/random-id");
const test_helper_1 = require("../helpers/test-helper");
const types_1 = require("../../../lib/types");
// The number of items to insert.
const seedSegmentSpec = {
    featuresCount: 100,
    segmentsPerFeature: 5,
    constraintsPerSegment: 1,
    valuesPerConstraint: 100,
};
// The database schema to populate.
const seedSchema = 'seed';
const fetchSegments = (app) => {
    return app.services.segmentService.getAll();
};
const createSegment = (app, postData) => {
    return app.services.segmentService.create(postData, types_1.TEST_AUDIT_USER);
};
const createFeatureToggle = (app, postData, expectStatusCode = 201) => {
    return app.request
        .post('/api/admin/features')
        .send(postData)
        .expect(expectStatusCode)
        .then((res) => res.body);
};
const addSegmentToStrategy = (app, segmentId, strategyId) => {
    return app.services.segmentService.addToStrategy(segmentId, strategyId);
};
const mockFeatureToggle = (overrides) => {
    return {
        name: (0, random_id_1.randomId)(),
        strategies: [{ name: (0, random_id_1.randomId)(), constraints: [], parameters: {} }],
        ...overrides,
    };
};
const seedConstraints = (spec) => {
    return Array.from({ length: spec.constraintsPerSegment }).map(() => ({
        values: Array.from({ length: spec.valuesPerConstraint }).map(() => (0, random_id_1.randomId)().substring(0, 16)),
        operator: 'IN',
        contextName: 'x',
    }));
};
const seedSegments = (spec) => {
    return Array.from({ length: spec.segmentsPerFeature }).map((v, i) => {
        return {
            name: `${seedSchema}_segment_${i}`,
            constraints: seedConstraints(spec),
        };
    });
};
const seedFeatures = (spec) => {
    return Array.from({ length: spec.featuresCount }).map((v, i) => {
        return mockFeatureToggle({
            name: `${seedSchema}_feature_${i}`,
        });
    });
};
const seedSegmentsDatabase = async (app, spec) => {
    await Promise.all(seedSegments(spec).map((seed) => {
        return createSegment(app, seed);
    }));
    const features = await Promise.all(seedFeatures(spec).map(async (seed) => {
        return createFeatureToggle(app, seed);
    }));
    const segments = await fetchSegments(app);
    (0, assert_1.default)(features.length === spec.featuresCount);
    (0, assert_1.default)(segments.length === spec.segmentsPerFeature);
    const addSegment = (feature, segment) => {
        return addSegmentToStrategy(app, segment.id, feature.strategies[0].id);
    };
    for (const feature of features) {
        await Promise.all(segments.map((segment) => addSegment(feature, segment)));
    }
};
const main = async () => {
    const db = await (0, database_init_1.default)(seedSchema, no_logger_1.default);
    const app = await (0, test_helper_1.setupApp)(db.stores);
    await seedSegmentsDatabase(app, seedSegmentSpec);
    await app.destroy();
    await db.destroy();
};
main().catch(console.error);
//# sourceMappingURL=segment.seed.js.map