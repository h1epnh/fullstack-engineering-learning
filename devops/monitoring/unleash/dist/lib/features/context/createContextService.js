"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFakeContextService = exports.createContextService = void 0;
const context_service_1 = __importDefault(require("./context-service"));
const context_field_store_1 = __importDefault(require("./context-field-store"));
const feature_toggle_strategies_store_1 = __importDefault(require("../feature-toggle/feature-toggle-strategies-store"));
const createEventsService_1 = require("../events/createEventsService");
const privateProjectChecker_1 = require("../private-project/privateProjectChecker");
const privateProjectStore_1 = __importDefault(require("../private-project/privateProjectStore"));
const fake_context_field_store_1 = __importDefault(require("./fake-context-field-store"));
const fake_feature_strategies_store_1 = __importDefault(require("../feature-toggle/fakes/fake-feature-strategies-store"));
const fakePrivateProjectChecker_1 = require("../private-project/fakePrivateProjectChecker");
const createContextService = (config) => (db) => {
    const { getLogger, flagResolver, eventBus, isEnterprise } = config;
    const contextFieldStore = new context_field_store_1.default(db, getLogger, flagResolver);
    const featureStrategiesStore = new feature_toggle_strategies_store_1.default(db, eventBus, getLogger, flagResolver);
    const eventService = (0, createEventsService_1.createEventsService)(db, config);
    const privateProjectStore = new privateProjectStore_1.default(db, getLogger);
    const privateProjectChecker = new privateProjectChecker_1.PrivateProjectChecker({ privateProjectStore }, { isEnterprise });
    return new context_service_1.default({ contextFieldStore, featureStrategiesStore }, {
        getLogger,
        flagResolver,
    }, eventService, privateProjectChecker);
};
exports.createContextService = createContextService;
const createFakeContextService = (config) => {
    const { getLogger, flagResolver, eventBus, isEnterprise } = config;
    const contextFieldStore = new fake_context_field_store_1.default();
    const featureStrategiesStore = new fake_feature_strategies_store_1.default();
    const eventService = (0, createEventsService_1.createFakeEventsService)(config);
    const privateProjectChecker = new fakePrivateProjectChecker_1.FakePrivateProjectChecker();
    return new context_service_1.default({ contextFieldStore, featureStrategiesStore }, {
        getLogger,
        flagResolver,
    }, eventService, privateProjectChecker);
};
exports.createFakeContextService = createFakeContextService;
//# sourceMappingURL=createContextService.js.map