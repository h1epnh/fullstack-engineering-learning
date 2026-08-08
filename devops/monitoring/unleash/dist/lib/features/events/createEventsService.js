"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFakeEventsService = exports.createEventsService = void 0;
const fake_event_store_1 = __importDefault(require("../../../test/fixtures/fake-event-store"));
const fake_feature_tag_store_1 = __importDefault(require("../../../test/fixtures/fake-feature-tag-store"));
const event_store_1 = __importDefault(require("./event-store"));
const feature_tag_store_1 = __importDefault(require("../../db/feature-tag-store"));
const services_1 = require("../../services");
const createPrivateProjectChecker_1 = require("../private-project/createPrivateProjectChecker");
const createAccessReadModel_1 = require("../access/createAccessReadModel");
const createEventsService = (db, config) => {
    const eventStore = new event_store_1.default(db, config.getLogger);
    const featureTagStore = new feature_tag_store_1.default(db, config.eventBus, config.getLogger);
    const privateProjectChecker = (0, createPrivateProjectChecker_1.createPrivateProjectChecker)(db, config);
    const accessReadModel = (0, createAccessReadModel_1.createAccessReadModel)(db, config);
    return new services_1.EventService({ eventStore, featureTagStore }, config, privateProjectChecker, accessReadModel);
};
exports.createEventsService = createEventsService;
const createFakeEventsService = (config, stores) => {
    const eventStore = stores?.eventStore || new fake_event_store_1.default();
    const featureTagStore = stores?.featureTagStore || new fake_feature_tag_store_1.default();
    const fakePrivateProjectChecker = (0, createPrivateProjectChecker_1.createFakePrivateProjectChecker)();
    const fakeAccessReadModel = (0, createAccessReadModel_1.createFakeAccessReadModel)();
    return new services_1.EventService({ eventStore, featureTagStore }, config, fakePrivateProjectChecker, fakeAccessReadModel);
};
exports.createFakeEventsService = createFakeEventsService;
//# sourceMappingURL=createEventsService.js.map