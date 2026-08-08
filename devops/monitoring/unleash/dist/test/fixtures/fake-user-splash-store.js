"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const not_implemented_error_1 = __importDefault(require("../../lib/error/not-implemented-error"));
class FakeUserSplashStore {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getAllUserSplashes(userId) {
        return Promise.resolve([]);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getSplash(userId, splashId) {
        throw new not_implemented_error_1.default('This is not implemented yet');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateSplash(splash) {
        throw new not_implemented_error_1.default('This is not implemented yet');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    exists(key) {
        return Promise.resolve(false);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    get(key) {
        throw new not_implemented_error_1.default('This is not implemented yet');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getAll() {
        return Promise.resolve([]);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    delete(key) {
        return Promise.resolve(undefined);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    deleteAll() {
        return Promise.resolve(undefined);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    destroy() { }
}
exports.default = FakeUserSplashStore;
//# sourceMappingURL=fake-user-splash-store.js.map