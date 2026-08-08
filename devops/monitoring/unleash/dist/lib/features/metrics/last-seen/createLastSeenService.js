"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFakeLastSeenService = exports.createLastSeenService = void 0;
const fake_last_seen_store_1 = require("./fake-last-seen-store");
const last_seen_service_1 = require("./last-seen-service");
const last_seen_store_1 = __importDefault(require("./last-seen-store"));
const createLastSeenService = (db, config) => {
    const lastSeenStore = new last_seen_store_1.default(db, config.eventBus, config.getLogger);
    return new last_seen_service_1.LastSeenService({ lastSeenStore }, config);
};
exports.createLastSeenService = createLastSeenService;
const createFakeLastSeenService = (config) => {
    const lastSeenStore = new fake_last_seen_store_1.FakeLastSeenStore();
    return new last_seen_service_1.LastSeenService({ lastSeenStore }, config);
};
exports.createFakeLastSeenService = createFakeLastSeenService;
//# sourceMappingURL=createLastSeenService.js.map