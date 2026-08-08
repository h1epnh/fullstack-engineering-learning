"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../../../test/e2e/helpers/database-init"));
const test_helper_1 = require("../../../test/e2e/helpers/test-helper");
const no_logger_1 = __importDefault(require("../../../test/fixtures/no-logger"));
let app;
let db;
beforeAll(async () => {
    db = await (0, database_init_1.default)('projects_insights', no_logger_1.default);
    app = await (0, test_helper_1.setupAppWithCustomConfig)(db.stores, {
        experimental: {
            flags: {
                strictSchemaValidation: true,
            },
        },
    }, db.rawDatabase);
});
afterAll(async () => {
    await app.destroy();
    await db.destroy();
});
test('project insights happy path', async () => {
    const { body } = await app.request
        .get('/api/admin/projects/default/insights')
        .expect('Content-Type', /json/)
        .expect(200);
    expect(body).toMatchObject({
        stats: {
            avgTimeToProdCurrentWindow: 0,
            createdCurrentWindow: 0,
            createdPastWindow: 0,
            archivedCurrentWindow: 0,
            archivedPastWindow: 0,
            projectActivityCurrentWindow: 0,
            projectActivityPastWindow: 0,
            projectMembersAddedCurrentWindow: 0,
        },
        leadTime: { features: [], projectAverage: 0 },
        featureTypeCounts: [],
        health: {
            activeCount: 0,
            potentiallyStaleCount: 0,
            staleCount: 0,
            rating: 100,
        },
    });
});
//# sourceMappingURL=projects-insights.e2e.test.js.map