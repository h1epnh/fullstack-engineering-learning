"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFakePrivateProjectChecker = exports.createPrivateProjectChecker = void 0;
const privateProjectStore_1 = __importDefault(require("./privateProjectStore"));
const privateProjectChecker_1 = require("./privateProjectChecker");
const fakePrivateProjectChecker_1 = require("./fakePrivateProjectChecker");
const createPrivateProjectChecker = (db, config) => {
    const { getLogger } = config;
    const privateProjectStore = new privateProjectStore_1.default(db, getLogger);
    return new privateProjectChecker_1.PrivateProjectChecker({
        privateProjectStore: privateProjectStore,
    }, config);
};
exports.createPrivateProjectChecker = createPrivateProjectChecker;
const createFakePrivateProjectChecker = () => {
    return new fakePrivateProjectChecker_1.FakePrivateProjectChecker();
};
exports.createFakePrivateProjectChecker = createFakePrivateProjectChecker;
//# sourceMappingURL=createPrivateProjectChecker.js.map