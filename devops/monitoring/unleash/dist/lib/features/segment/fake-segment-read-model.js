"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeSegmentReadModel = void 0;
class FakeSegmentReadModel {
    constructor(segments = []) {
        this.segments = segments;
    }
    async getAll(ids) {
        return this.segments;
    }
    async getAllFeatureStrategySegments() {
        return [];
    }
    async getActive() {
        return this.segments;
    }
    async getActiveForClient() {
        return [];
    }
    async getAllForClientIds(ids) {
        return [];
    }
}
exports.FakeSegmentReadModel = FakeSegmentReadModel;
//# sourceMappingURL=fake-segment-read-model.js.map