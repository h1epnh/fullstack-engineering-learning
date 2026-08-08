"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFakeChangeRequestAccessService = exports.createChangeRequestAccessReadModel = void 0;
const sql_change_request_access_read_model_1 = require("./sql-change-request-access-read-model");
const createAccessService_1 = require("../access/createAccessService");
const fake_change_request_access_read_model_1 = require("./fake-change-request-access-read-model");
const createChangeRequestAccessReadModel = (db, config) => {
    const accessService = (0, createAccessService_1.createAccessService)(db, config);
    return new sql_change_request_access_read_model_1.ChangeRequestAccessReadModel(db, accessService);
};
exports.createChangeRequestAccessReadModel = createChangeRequestAccessReadModel;
const createFakeChangeRequestAccessService = () => {
    return new fake_change_request_access_read_model_1.FakeChangeRequestAccessReadModel();
};
exports.createFakeChangeRequestAccessService = createFakeChangeRequestAccessService;
//# sourceMappingURL=createChangeRequestAccessReadModel.js.map