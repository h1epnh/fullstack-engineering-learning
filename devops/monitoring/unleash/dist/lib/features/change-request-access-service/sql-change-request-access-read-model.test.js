"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../../../test/e2e/helpers/database-init"));
const no_logger_1 = __importDefault(require("../../../test/fixtures/no-logger"));
const createChangeRequestAccessReadModel_1 = require("./createChangeRequestAccessReadModel");
const test_config_1 = require("../../../test/config/test-config");
let db;
let readModel;
beforeAll(async () => {
    db = await (0, database_init_1.default)('change_request_access_read_model', no_logger_1.default);
    const config = (0, test_config_1.createTestConfig)({
        getLogger: no_logger_1.default,
    });
    readModel = (0, createChangeRequestAccessReadModel_1.createChangeRequestAccessReadModel)(db.rawDatabase, config);
});
afterAll(async () => {
    await db.destroy();
});
test(`Should indicate change request enabled status`, async () => {
    // no change requests
    const defaultStatus = await readModel.isChangeRequestsEnabledForProject('default');
    expect(defaultStatus).toBe(false);
    // change request enabled in enabled environment
    await db.rawDatabase('change_request_settings').insert({
        project: 'default',
        environment: 'development',
        required_approvals: 1,
    });
    const enabledStatus = await readModel.isChangeRequestsEnabledForProject('default');
    expect(enabledStatus).toBe(true);
    // change request enabled in disabled environment
    await db.stores.projectStore.deleteEnvironmentForProject('default', 'development');
    const disabledStatus = await readModel.isChangeRequestsEnabledForProject('default');
    expect(disabledStatus).toBe(false);
});
//# sourceMappingURL=sql-change-request-access-read-model.test.js.map