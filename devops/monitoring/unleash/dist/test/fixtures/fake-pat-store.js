"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-unused-vars */
class FakePatStore {
    create(pat, secret, userId) {
        throw new Error('Method not implemented.');
    }
    delete(key) {
        throw new Error('Method not implemented.');
    }
    deleteAll() {
        throw new Error('Method not implemented.');
    }
    destroy() { }
    exists(key) {
        throw new Error('Method not implemented.');
    }
    existsWithDescriptionByUser(description, userId) {
        throw new Error('Method not implemented.');
    }
    countByUser(userId) {
        throw new Error('Method not implemented.');
    }
    get(key) {
        throw new Error('Method not implemented.');
    }
    getAll(query) {
        throw new Error('Method not implemented.');
    }
    getAllByUser(userId) {
        throw new Error('Method not implemented.');
    }
    deleteForUser(id, userId) {
        throw new Error('Method not implemented.');
    }
}
exports.default = FakePatStore;
//# sourceMappingURL=fake-pat-store.js.map