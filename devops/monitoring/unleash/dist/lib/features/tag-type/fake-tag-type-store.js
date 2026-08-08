"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = require("../../error");
class FakeTagTypeStore {
    constructor() {
        this.tagTypes = [];
    }
    async bulkImport(tagTypes) {
        tagTypes.forEach((tT) => this.tagTypes.push(tT));
        return tagTypes;
    }
    async createTagType(newTagType) {
        this.tagTypes.push(newTagType);
    }
    async delete(key) {
        this.tagTypes.splice(this.tagTypes.findIndex((tt) => tt.name === key), 1);
    }
    async deleteAll() {
        this.tagTypes = [];
    }
    destroy() { }
    async exists(key) {
        return this.tagTypes.some((t) => t.name === key);
    }
    async get(key) {
        const tagType = this.tagTypes.find((t) => t.name === key);
        if (tagType) {
            return tagType;
        }
        throw new error_1.NotFoundError('Could not find tag type');
    }
    async getAll() {
        return this.tagTypes;
    }
    async updateTagType(tagType) {
        await this.delete(tagType.name);
        return this.createTagType(tagType);
    }
}
exports.default = FakeTagTypeStore;
//# sourceMappingURL=fake-tag-type-store.js.map