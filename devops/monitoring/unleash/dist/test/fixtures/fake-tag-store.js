"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notfound_error_1 = __importDefault(require("../../lib/error/notfound-error"));
class FakeTagStore {
    constructor() {
        this.tags = [];
    }
    async bulkImport(tags) {
        tags.forEach((t) => this.tags.push(t));
        return tags;
    }
    async createTag(tag) {
        this.tags.push(tag);
    }
    async delete(key) {
        this.tags.splice(this.tags.findIndex((t) => t === key));
    }
    async deleteAll() {
        this.tags = [];
    }
    destroy() { }
    async exists(key) {
        return this.tags.some((t) => t === key);
    }
    async get(key) {
        const tag = this.tags.find((t) => t === key);
        if (tag) {
            return tag;
        }
        throw new notfound_error_1.default('Tag does not exist');
    }
    async getAll() {
        return this.tags;
    }
    async getTag(type, value) {
        const tag = this.tags.find((t) => t.type === type && t.value === value);
        if (tag) {
            return tag;
        }
        throw new notfound_error_1.default('Tag does not exist');
    }
    async getTagsByType(type) {
        return this.tags.filter((t) => t.type === type);
    }
}
exports.default = FakeTagStore;
//# sourceMappingURL=fake-tag-store.js.map