"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_helper_1 = require("../../helpers/test-helper");
const client_metrics_json_1 = __importDefault(require("../../../examples/client-metrics.json"));
const database_init_1 = __importDefault(require("../../helpers/database-init"));
const no_logger_1 = __importDefault(require("../../../fixtures/no-logger"));
const api_token_1 = require("../../../../lib/types/models/api-token");
let app;
let db;
beforeAll(async () => {
    db = await (0, database_init_1.default)('metrics_api_e2e_access_client', no_logger_1.default);
    app = await (0, test_helper_1.setupAppWithAuth)(db.stores, undefined, db.rawDatabase);
});
afterAll(async () => {
    await app.destroy();
    await db.destroy();
});
test('should enrich metrics with environment from api-token', async () => {
    const { apiTokenService } = app.services;
    const { environmentStore, clientMetricsStoreV2 } = db.stores;
    await environmentStore.create({
        name: 'some',
        type: 'test',
    });
    const token = await apiTokenService.createApiToken({
        type: api_token_1.ApiTokenType.CLIENT,
        tokenName: 'test',
        environment: 'some',
        project: '*',
    });
    await app.request
        .post('/api/client/metrics')
        .set('Authorization', token.secret)
        .send(client_metrics_json_1.default)
        .expect(202);
    await app.services.clientMetricsServiceV2.bulkAdd();
    const all = await clientMetricsStoreV2.getAll();
    expect(all[0].environment).toBe('some');
});
//# sourceMappingURL=metrics.access.e2e.test.js.map