"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeUniqueConnectionStore = void 0;
class FakeUniqueConnectionStore {
    constructor() {
        this.uniqueConnectionsRecord = {};
    }
    async insert(uniqueConnections) {
        this.uniqueConnectionsRecord[uniqueConnections.id] = {
            ...uniqueConnections,
            updatedAt: new Date(),
        };
    }
    async get(id) {
        return this.uniqueConnectionsRecord[id] || null;
    }
    async deleteAll() {
        this.uniqueConnectionsRecord = {};
    }
}
exports.FakeUniqueConnectionStore = FakeUniqueConnectionStore;
//# sourceMappingURL=fake-unique-connection-store.js.map