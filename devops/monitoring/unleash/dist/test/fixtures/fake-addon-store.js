"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notfound_error_1 = __importDefault(require("../../lib/error/notfound-error"));
class FakeAddonStore {
    constructor() {
        this.addons = [];
        this.highestId = 0;
    }
    async delete(key) {
        this.addons.splice(this.addons.findIndex((a) => a.id === key), 1);
    }
    async deleteAll() {
        this.addons = [];
    }
    destroy() { }
    async exists(key) {
        return this.addons.some((a) => a.id === key);
    }
    async get(key) {
        const addon = this.addons.find((a) => a.id === key);
        if (addon) {
            return addon;
        }
        throw new notfound_error_1.default(`Could not find addon with id ${key}`);
    }
    async getAll() {
        return this.addons;
    }
    async insert(addon) {
        const ins = {
            id: this.highestId++,
            createdAt: new Date(),
            description: null,
            ...addon,
        };
        this.addons.push(ins);
        return ins;
    }
    async update(id, addon) {
        await this.delete(id);
        const inserted = {
            id,
            createdAt: new Date(),
            description: null,
            ...addon,
        };
        this.addons.push(inserted);
        return inserted;
    }
}
exports.default = FakeAddonStore;
//# sourceMappingURL=fake-addon-store.js.map