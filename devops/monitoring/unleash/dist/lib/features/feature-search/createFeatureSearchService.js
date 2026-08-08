"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFakeFeatureSearchService = exports.createFeatureSearchService = void 0;
const feature_search_service_1 = require("./feature-search-service");
const fake_feature_search_store_1 = __importDefault(require("./fake-feature-search-store"));
const feature_search_store_1 = __importDefault(require("./feature-search-store"));
const createFeatureSearchService = (config) => (db) => {
    const { getLogger, eventBus, flagResolver } = config;
    const featureSearchStore = new feature_search_store_1.default(db, eventBus, getLogger, flagResolver);
    return new feature_search_service_1.FeatureSearchService({ featureSearchStore: featureSearchStore }, config);
};
exports.createFeatureSearchService = createFeatureSearchService;
const createFakeFeatureSearchService = (config) => {
    const fakeFeatureSearchStore = new fake_feature_search_store_1.default();
    return new feature_search_service_1.FeatureSearchService({
        featureSearchStore: fakeFeatureSearchStore,
    }, config);
};
exports.createFakeFeatureSearchService = createFakeFeatureSearchService;
//# sourceMappingURL=createFeatureSearchService.js.map