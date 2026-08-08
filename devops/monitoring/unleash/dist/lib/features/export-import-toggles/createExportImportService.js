"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExportImportTogglesService = exports.deferredExportImportTogglesService = exports.createFakeExportImportTogglesService = void 0;
const export_import_service_1 = __importDefault(require("./export-import-service"));
const import_toggles_store_1 = require("./import-toggles-store");
const feature_toggle_store_1 = __importDefault(require("../feature-toggle/feature-toggle-store"));
const tag_store_1 = __importDefault(require("../../db/tag-store"));
const tag_type_store_1 = __importDefault(require("../tag-type/tag-type-store"));
const feature_tag_store_1 = __importDefault(require("../../db/feature-tag-store"));
const strategy_store_1 = __importDefault(require("../../db/strategy-store"));
const context_field_store_1 = __importDefault(require("../context/context-field-store"));
const feature_toggle_strategies_store_1 = __importDefault(require("../feature-toggle/feature-toggle-strategies-store"));
const services_1 = require("../../services");
const createAccessService_1 = require("../access/createAccessService");
const createFeatureToggleService_1 = require("../feature-toggle/createFeatureToggleService");
const feature_environment_store_1 = require("../../db/feature-environment-store");
const fake_feature_toggle_store_1 = __importDefault(require("../feature-toggle/fakes/fake-feature-toggle-store"));
const fake_tag_store_1 = __importDefault(require("../../../test/fixtures/fake-tag-store"));
const fake_tag_type_store_1 = __importDefault(require("../tag-type/fake-tag-type-store"));
const fake_feature_tag_store_1 = __importDefault(require("../../../test/fixtures/fake-feature-tag-store"));
const fake_context_field_store_1 = __importDefault(require("../context/fake-context-field-store"));
const fake_feature_strategies_store_1 = __importDefault(require("../feature-toggle/fakes/fake-feature-strategies-store"));
const fake_feature_environment_store_1 = __importDefault(require("../../../test/fixtures/fake-feature-environment-store"));
const fake_strategies_store_1 = __importDefault(require("../../../test/fixtures/fake-strategies-store"));
const createPrivateProjectChecker_1 = require("../private-project/createPrivateProjectChecker");
const dependent_features_read_model_1 = require("../dependent-features/dependent-features-read-model");
const fake_dependent_features_read_model_1 = require("../dependent-features/fake-dependent-features-read-model");
const createDependentFeaturesService_1 = require("../dependent-features/createDependentFeaturesService");
const createEventsService_1 = require("../events/createEventsService");
const segment_read_model_1 = require("../segment/segment-read-model");
const fake_segment_read_model_1 = require("../segment/fake-segment-read-model");
const createContextService_1 = require("../context/createContextService");
const createFakeExportImportTogglesService = (config) => {
    const { getLogger } = config;
    const importTogglesStore = {};
    const featureToggleStore = new fake_feature_toggle_store_1.default();
    const tagStore = new fake_tag_store_1.default();
    const tagTypeStore = new fake_tag_type_store_1.default();
    const featureTagStore = new fake_feature_tag_store_1.default();
    const strategyStore = new fake_strategies_store_1.default();
    const contextFieldStore = new fake_context_field_store_1.default();
    const featureStrategiesStore = new fake_feature_strategies_store_1.default();
    const featureEnvironmentStore = new fake_feature_environment_store_1.default();
    const { accessService } = (0, createAccessService_1.createFakeAccessService)(config);
    const { featureToggleService } = (0, createFeatureToggleService_1.createFakeFeatureToggleService)(config);
    const eventService = (0, createEventsService_1.createFakeEventsService)(config);
    const featureTagService = new services_1.FeatureTagService({
        tagStore,
        featureTagStore,
        featureToggleStore,
    }, { getLogger }, eventService);
    const contextService = (0, createContextService_1.createFakeContextService)(config);
    const strategyService = new services_1.StrategyService({ strategyStore }, { getLogger }, eventService);
    const tagTypeService = new services_1.TagTypeService({ tagTypeStore }, { getLogger }, eventService);
    const dependentFeaturesReadModel = new fake_dependent_features_read_model_1.FakeDependentFeaturesReadModel();
    const segmentReadModel = new fake_segment_read_model_1.FakeSegmentReadModel();
    const dependentFeaturesService = (0, createDependentFeaturesService_1.createFakeDependentFeaturesService)(config);
    return new export_import_service_1.default({
        importTogglesStore,
        featureStrategiesStore,
        contextFieldStore,
        featureToggleStore,
        featureTagStore,
        tagTypeStore,
        featureEnvironmentStore,
    }, config, {
        featureToggleService,
        featureTagService,
        accessService,
        eventService,
        contextService,
        strategyService,
        tagTypeService,
        dependentFeaturesService,
    }, dependentFeaturesReadModel, segmentReadModel);
};
exports.createFakeExportImportTogglesService = createFakeExportImportTogglesService;
const deferredExportImportTogglesService = (config) => {
    return (db) => {
        const { eventBus, getLogger, flagResolver } = config;
        const importTogglesStore = new import_toggles_store_1.ImportTogglesStore(db);
        const featureToggleStore = new feature_toggle_store_1.default(db, eventBus, getLogger, flagResolver);
        const tagStore = new tag_store_1.default(db, eventBus, getLogger);
        const tagTypeStore = new tag_type_store_1.default(db, eventBus, getLogger);
        const featureTagStore = new feature_tag_store_1.default(db, eventBus, getLogger);
        const strategyStore = new strategy_store_1.default(db, getLogger);
        const contextFieldStore = new context_field_store_1.default(db, getLogger, flagResolver);
        const featureStrategiesStore = new feature_toggle_strategies_store_1.default(db, eventBus, getLogger, flagResolver);
        const featureEnvironmentStore = new feature_environment_store_1.FeatureEnvironmentStore(db, eventBus, config);
        const accessService = (0, createAccessService_1.createAccessService)(db, config);
        const featureToggleService = (0, createFeatureToggleService_1.createFeatureToggleService)(db, config);
        (0, createPrivateProjectChecker_1.createPrivateProjectChecker)(db, config);
        const eventService = (0, createEventsService_1.createEventsService)(db, config);
        const featureTagService = new services_1.FeatureTagService({
            tagStore,
            featureTagStore,
            featureToggleStore,
        }, { getLogger }, eventService);
        const contextService = (0, createContextService_1.createContextService)(config)(db);
        const strategyService = new services_1.StrategyService({ strategyStore }, { getLogger }, eventService);
        const tagTypeService = new services_1.TagTypeService({ tagTypeStore }, { getLogger }, eventService);
        const dependentFeaturesReadModel = new dependent_features_read_model_1.DependentFeaturesReadModel(db);
        const segmentReadModel = new segment_read_model_1.SegmentReadModel(db);
        const dependentFeaturesService = (0, createDependentFeaturesService_1.createDependentFeaturesService)(config)(db);
        return new export_import_service_1.default({
            importTogglesStore,
            featureStrategiesStore,
            contextFieldStore,
            featureToggleStore,
            featureTagStore,
            tagTypeStore,
            featureEnvironmentStore,
        }, config, {
            featureToggleService,
            featureTagService,
            accessService,
            eventService,
            contextService,
            strategyService,
            tagTypeService,
            dependentFeaturesService,
        }, dependentFeaturesReadModel, segmentReadModel);
    };
};
exports.deferredExportImportTogglesService = deferredExportImportTogglesService;
const createExportImportTogglesService = (db, config) => {
    const unboundService = (0, exports.deferredExportImportTogglesService)(config);
    return unboundService(db);
};
exports.createExportImportTogglesService = createExportImportTogglesService;
//# sourceMappingURL=createExportImportService.js.map