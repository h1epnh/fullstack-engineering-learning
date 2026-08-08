"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFakeChangeRequestSegmentUsageReadModel = exports.createChangeRequestSegmentUsageReadModel = void 0;
const sql_change_request_segment_usage_read_model_1 = require("./sql-change-request-segment-usage-read-model");
const fake_change_request_segment_usage_read_model_1 = require("./fake-change-request-segment-usage-read-model");
const createChangeRequestSegmentUsageReadModel = (db) => {
    return new sql_change_request_segment_usage_read_model_1.ChangeRequestSegmentUsageReadModel(db);
};
exports.createChangeRequestSegmentUsageReadModel = createChangeRequestSegmentUsageReadModel;
const createFakeChangeRequestSegmentUsageReadModel = () => {
    return new fake_change_request_segment_usage_read_model_1.FakeChangeRequestSegmentUsageReadModel();
};
exports.createFakeChangeRequestSegmentUsageReadModel = createFakeChangeRequestSegmentUsageReadModel;
//# sourceMappingURL=createChangeRequestSegmentUsageReadModel.js.map