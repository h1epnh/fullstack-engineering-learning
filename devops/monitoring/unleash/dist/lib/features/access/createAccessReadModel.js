"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFakeAccessReadModel = exports.createAccessReadModel = void 0;
const access_read_model_1 = require("./access-read-model");
const access_store_1 = require("../../db/access-store");
const fake_role_store_1 = __importDefault(require("../../../test/fixtures/fake-role-store"));
const fake_access_store_1 = __importDefault(require("../../../test/fixtures/fake-access-store"));
const createAccessReadModel = (db, config) => {
    const { eventBus, getLogger } = config;
    const accessStore = new access_store_1.AccessStore(db, eventBus, getLogger);
    return new access_read_model_1.AccessReadModel({ accessStore });
};
exports.createAccessReadModel = createAccessReadModel;
const createFakeAccessReadModel = (accessStore) => {
    const roleStore = new fake_role_store_1.default();
    const finalAccessStore = accessStore ?? new fake_access_store_1.default(roleStore);
    return new access_read_model_1.AccessReadModel({ accessStore: finalAccessStore });
};
exports.createFakeAccessReadModel = createFakeAccessReadModel;
//# sourceMappingURL=createAccessReadModel.js.map