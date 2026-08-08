"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_helper_1 = require("../../../test/e2e/helpers/test-helper");
const database_init_1 = __importDefault(require("../../../test/e2e/helpers/database-init"));
const no_logger_1 = __importDefault(require("../../../test/fixtures/no-logger"));
const util_1 = require("../../util");
const api_token_1 = require("../../types/models/api-token");
let app;
let db;
let appErrorLogs = [];
beforeAll(async () => {
    db = await (0, database_init_1.default)('frontend_api_concurrency', no_logger_1.default);
    const baseLogger = (0, no_logger_1.default)();
    const appLogger = {
        ...baseLogger,
        error: (msg, ...args) => {
            appErrorLogs.push(msg);
            baseLogger.error(msg, ...args);
        },
    };
    app = await (0, test_helper_1.setupAppWithoutSupertest)(db.stores, {
        frontendApiOrigins: ['https://example.com'],
        getLogger: () => appLogger,
    }, db.rawDatabase);
});
afterEach(() => {
    app.services.frontendApiService.stopAll();
    jest.clearAllMocks();
});
afterAll(async () => {
    await app.destroy();
    await db.destroy();
});
beforeEach(async () => {
    appErrorLogs = [];
});
/**
 * This test needs to run on a new instance of the application and a clean DB
 * which is why it should be the only test of this file
 */
test('multiple parallel calls to api/frontend should not create multiple instances', async () => {
    const frontendTokenDefault = await app.services.apiTokenService.createApiTokenWithProjects({
        type: api_token_1.ApiTokenType.FRONTEND,
        projects: ['default'],
        environment: 'default',
        tokenName: `test-token-${(0, util_1.randomId)()}`,
    });
    const address = app.server.address();
    expect(address).not.toBeNull();
    expect(address).toHaveProperty('port');
    // @ts-ignore - We've just checked that we have this property
    const serverUrl = `http://localhost:${address.port}/api/frontend`;
    await Promise.all(Array.from(Array(10).keys()).map(() => fetch(serverUrl, {
        method: 'GET',
        headers: {
            Authorization: frontendTokenDefault.secret,
        },
    }).then((res) => expect(res.status).toBe(200))));
    expect(appErrorLogs).toHaveLength(0);
});
//# sourceMappingURL=frontend-api.concurrency.e2e.test.js.map