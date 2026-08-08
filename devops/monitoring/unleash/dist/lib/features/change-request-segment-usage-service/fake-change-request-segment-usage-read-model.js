"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeChangeRequestSegmentUsageReadModel = void 0;
class FakeChangeRequestSegmentUsageReadModel {
    constructor(strategiesUsedInActiveChangeRequests = []) {
        this.strategiesUsedInActiveChangeRequests =
            strategiesUsedInActiveChangeRequests;
    }
    async getStrategiesUsedInActiveChangeRequests() {
        return this.strategiesUsedInActiveChangeRequests;
    }
}
exports.FakeChangeRequestSegmentUsageReadModel = FakeChangeRequestSegmentUsageReadModel;
//# sourceMappingURL=fake-change-request-segment-usage-read-model.js.map