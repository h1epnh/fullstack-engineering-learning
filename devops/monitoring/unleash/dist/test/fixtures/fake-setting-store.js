"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FakeSettingStore {
    constructor() {
        this.settings = new Map();
    }
    async delete(key) {
        this.settings.delete(key);
    }
    async deleteAll() {
        this.settings = new Map();
    }
    destroy() { }
    async exists(key) {
        return this.settings.has(key);
    }
    async get(key) {
        const setting = this.settings.get(key);
        if (setting) {
            return setting;
        }
        return undefined;
    }
    async getAll() {
        return Array.from(this.settings.values());
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async insert(name, content) {
        this.settings.set(name, content);
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async updateRow(name, content) {
        this.settings.set(name, content);
    }
    async postgresVersion() {
        return Promise.resolve('fake-postgres-version');
    }
}
exports.default = FakeSettingStore;
//# sourceMappingURL=fake-setting-store.js.map