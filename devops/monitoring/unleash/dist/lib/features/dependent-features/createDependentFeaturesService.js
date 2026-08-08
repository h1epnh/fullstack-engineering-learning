"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFakeDependentFeaturesService = exports.createDependentFeaturesService = void 0;
const dependent_features_service_1 = require("./dependent-features-service");
const dependent_features_store_1 = require("./dependent-features-store");
const dependent_features_read_model_1 = require("./dependent-features-read-model");
const fake_dependent_features_store_1 = require("./fake-dependent-features-store");
const fake_dependent_features_read_model_1 = require("./fake-dependent-features-read-model");
const createChangeRequestAccessReadModel_1 = require("../change-request-access-service/createChangeRequestAccessReadModel");
const features_read_model_1 = require("../feature-toggle/features-read-model");
const fake_features_read_model_1 = require("../feature-toggle/fakes/fake-features-read-model");
const createEventsService_1 = require("../events/createEventsService");
const createDependentFeaturesService = (config) => (db) => {
    const eventService = (0, createEventsService_1.createEventsService)(db, config);
    const dependentFeaturesStore = new dependent_features_store_1.DependentFeaturesStore(db);
    const dependentFeaturesReadModel = new dependent_features_read_model_1.DependentFeaturesReadModel(db);
    const changeRequestAccessReadModel = (0, createChangeRequestAccessReadModel_1.createChangeRequestAccessReadModel)(db, config);
    const featuresReadModel = new features_read_model_1.FeaturesReadModel(db);
    return new dependent_features_service_1.DependentFeaturesService({
        dependentFeaturesStore,
        dependentFeaturesReadModel,
        changeRequestAccessReadModel,
        featuresReadModel,
        eventService,
    });
};
exports.createDependentFeaturesService = createDependentFeaturesService;
const createFakeDependentFeaturesService = (config) => {
    const eventService = (0, createEventsService_1.createFakeEventsService)(config);
    const dependentFeaturesStore = new fake_dependent_features_store_1.FakeDependentFeaturesStore();
    const dependentFeaturesReadModel = new fake_dependent_features_read_model_1.FakeDependentFeaturesReadModel();
    const changeRequestAccessReadModel = (0, createChangeRequestAccessReadModel_1.createFakeChangeRequestAccessService)();
    const featuresReadModel = new fake_features_read_model_1.FakeFeaturesReadModel();
    return new dependent_features_service_1.DependentFeaturesService({
        dependentFeaturesStore,
        dependentFeaturesReadModel,
        changeRequestAccessReadModel,
        featuresReadModel,
        eventService,
    });
};
exports.createFakeDependentFeaturesService = createFakeDependentFeaturesService;
//# sourceMappingURL=createDependentFeaturesService.js.map