"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FakeSegmentStore {
    constructor() {
        this.segments = [];
        this.currentId = 0;
    }
    async count() {
        return this.segments.length;
    }
    async create(segment) {
        const newSegment = { ...segment, id: this.currentId };
        this.currentId = this.currentId + 1;
        this.segments.push(newSegment);
        return newSegment;
    }
    async delete() {
        return;
    }
    async deleteAll() {
        return;
    }
    async exists() {
        return false;
    }
    get() {
        throw new Error('Method not implemented.');
    }
    async getAll() {
        return [];
    }
    async getByStrategy() {
        return [];
    }
    update() {
        throw new Error('Method not implemented.');
    }
    addToStrategy() {
        throw new Error('Method not implemented.');
    }
    removeFromStrategy() {
        throw new Error('Method not implemented.');
    }
    async getAllFeatureStrategySegments() {
        return [];
    }
    async existsByName(name) {
        return this.segments.some((segment) => segment.name === name);
    }
    destroy() { }
    async getProjectSegmentCount() {
        return 0;
    }
}
exports.default = FakeSegmentStore;
//# sourceMappingURL=fake-segment-store.js.map