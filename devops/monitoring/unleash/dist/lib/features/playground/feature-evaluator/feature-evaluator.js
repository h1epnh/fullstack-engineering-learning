"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureEvaluator = exports.Strategy = void 0;
const client_1 = __importDefault(require("./client"));
const repository_1 = __importDefault(require("./repository"));
const strategy_1 = require("./strategy");
Object.defineProperty(exports, "Strategy", { enumerable: true, get: function () { return strategy_1.Strategy; } });
const helpers_1 = require("./helpers");
const bootstrap_provider_1 = require("./repository/bootstrap-provider");
const storage_provider_in_mem_1 = __importDefault(require("./repository/storage-provider-in-mem"));
class FeatureEvaluator {
    constructor({ appName, environment = 'default', strategies = [], repository, bootstrap = { data: [] }, storageProvider = new storage_provider_in_mem_1.default(), }) {
        this.staticContext = { appName, environment };
        const bootstrapProvider = (0, bootstrap_provider_1.resolveBootstrapProvider)(bootstrap);
        this.repository =
            repository ||
                new repository_1.default({
                    appName,
                    bootstrapProvider,
                    storageProvider,
                });
        // setup client
        const supportedStrategies = strategies.concat(strategy_1.defaultStrategies);
        this.client = new client_1.default(this.repository, supportedStrategies);
    }
    async start() {
        return this.repository.start();
    }
    destroy() {
        this.repository.stop();
    }
    isEnabled(name, context = {}, fallback) {
        const enhancedContext = { ...this.staticContext, ...context };
        const fallbackFunc = (0, helpers_1.createFallbackFunction)(name, enhancedContext, fallback);
        return this.client.isEnabled(name, enhancedContext, fallbackFunc);
    }
    getVariant(name, context = {}, fallbackVariant) {
        const enhancedContext = { ...this.staticContext, ...context };
        return this.client.getVariant(name, enhancedContext, fallbackVariant);
    }
    forceGetVariant(name, forcedResults, context = {}, fallbackVariant) {
        const enhancedContext = { ...this.staticContext, ...context };
        return this.client.forceGetVariant(name, enhancedContext, forcedResults, fallbackVariant);
    }
    getFeatureToggleDefinition(toggleName) {
        return this.repository.getToggle(toggleName);
    }
    getFeatureToggleDefinitions() {
        return this.repository.getToggles();
    }
}
exports.FeatureEvaluator = FeatureEvaluator;
//# sourceMappingURL=feature-evaluator.js.map