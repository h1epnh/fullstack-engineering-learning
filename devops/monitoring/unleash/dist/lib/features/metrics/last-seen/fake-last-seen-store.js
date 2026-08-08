"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeLastSeenStore = void 0;
class FakeLastSeenStore {
    setLastSeen(data) {
        data.map((lastSeen) => lastSeen);
        return Promise.resolve();
    }
    cleanLastSeen() {
        return Promise.resolve();
    }
}
exports.FakeLastSeenStore = FakeLastSeenStore;
//# sourceMappingURL=fake-last-seen-store.js.map