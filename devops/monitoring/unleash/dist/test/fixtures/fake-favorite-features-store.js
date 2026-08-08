"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-unused-vars */
class FakeFavoriteFeaturesStore {
    addFavoriteFeature(favorite) {
        return Promise.resolve(undefined);
    }
    delete(key) {
        return Promise.resolve(undefined);
    }
    deleteAll() {
        return Promise.resolve(undefined);
    }
    destroy() { }
    exists(key) {
        return Promise.resolve(false);
    }
    get(key) {
        return Promise.resolve(undefined);
    }
    getAll(query) {
        return Promise.resolve([]);
    }
}
exports.default = FakeFavoriteFeaturesStore;
//# sourceMappingURL=fake-favorite-features-store.js.map