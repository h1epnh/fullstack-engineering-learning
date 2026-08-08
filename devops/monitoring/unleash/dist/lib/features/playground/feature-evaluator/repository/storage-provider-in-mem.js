"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class InMemStorageProvider {
    constructor() {
        this.store = new Map();
    }
    async set(key, data) {
        this.store.set(key, data);
        return Promise.resolve();
    }
    async get(key) {
        return Promise.resolve(this.store.get(key));
    }
}
exports.default = InMemStorageProvider;
//# sourceMappingURL=storage-provider-in-mem.js.map