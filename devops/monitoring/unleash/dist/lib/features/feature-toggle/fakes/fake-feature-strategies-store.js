"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_crypto_1 = require("node:crypto");
const notfound_error_1 = __importDefault(require("../../../error/notfound-error"));
const util_1 = require("../../../util");
class FakeFeatureStrategiesStore {
    constructor() {
        this.environmentAndFeature = new Map();
        this.projectToEnvironment = [];
        this.featureStrategies = [];
        this.featureToggles = [];
    }
    async createStrategyFeatureEnv(strategyConfig) {
        const newStrat = { ...strategyConfig, id: (0, node_crypto_1.randomUUID)() };
        this.featureStrategies.push(newStrat);
        return Promise.resolve(newStrat);
    }
    async getStrategiesByContextField(contextFieldName) {
        const strategies = this.featureStrategies.filter((strategy) => strategy.constraints.some((constraint) => constraint.contextName === contextFieldName));
        return Promise.resolve(strategies);
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async createFeature(feature) {
        this.featureToggles.push({
            project: feature.project || 'default',
            createdAt: new Date(),
            archived: false,
            ...feature,
        });
        return Promise.resolve();
    }
    async deleteFeatureStrategies() {
        this.featureStrategies = [];
        return Promise.resolve();
    }
    async hasStrategy(id) {
        return this.featureStrategies.some((s) => s.id === id);
    }
    async get(id) {
        return this.featureStrategies.find((s) => s.id === id);
    }
    async exists(key) {
        return this.featureStrategies.some((s) => s.id === key);
    }
    async delete(key) {
        this.featureStrategies.splice(this.featureStrategies.findIndex((s) => s.id === key), 1);
    }
    async deleteAll() {
        this.featureStrategies = [];
    }
    // FIXME: implement
    async updateSortOrder(id, sortOrder) {
        const found = this.featureStrategies.find((item) => item.id === id);
        if (found) {
            found.sortOrder = sortOrder;
        }
    }
    destroy() {
        throw new Error('Method not implemented.');
    }
    async removeAllStrategiesForFeatureEnv(feature_name, environment) {
        const toRemove = this.featureStrategies.filter((fS) => fS.featureName === feature_name &&
            fS.environment === environment);
        this.featureStrategies = this.featureStrategies.filter((f) => !toRemove.some((r) => r.featureName === f.featureName &&
            r.environment === f.environment));
        return Promise.resolve();
    }
    async getAll() {
        return Promise.resolve(this.featureStrategies);
    }
    async getStrategiesForFeatureEnv(project_name, feature_name, environment) {
        const rows = this.featureStrategies.filter((fS) => fS.projectId === project_name &&
            fS.featureName === feature_name &&
            fS.environment === environment);
        return Promise.resolve(rows);
    }
    async getFeatureToggleForEnvironment(featureName, 
    // eslint-disable-next-line
    environment) {
        const toggle = this.featureToggles.find((f) => f.name === featureName);
        if (toggle) {
            return { ...toggle, environments: [] };
        }
        throw new notfound_error_1.default(`Could not find feature with name ${featureName}`);
    }
    async getFeatureToggleWithEnvs(featureName, userId, archived = false) {
        const toggle = this.featureToggles.find((f) => f.name === featureName && f.archived === archived);
        if (toggle) {
            return { ...toggle, environments: [] };
        }
        throw new notfound_error_1.default(`Could not find feature with name ${featureName}`);
    }
    getFeatureToggleWithVariantEnvs(featureName, userId, archived) {
        return this.getFeatureToggleWithEnvs(featureName, userId, archived);
    }
    async getFeatures(featureQuery, archived = false) {
        const rows = this.featureToggles.filter((toggle) => {
            if (featureQuery?.namePrefix) {
                if (featureQuery?.project) {
                    return ((toggle.name.startsWith(featureQuery.namePrefix) &&
                        featureQuery.project.some((project) => project.includes(toggle.project))) ||
                        featureQuery.project.includes(util_1.ALL_PROJECTS));
                }
                return toggle.name.startsWith(featureQuery.namePrefix);
            }
            if (featureQuery?.project) {
                return (featureQuery.project.some((project) => project.includes(toggle.project)) || featureQuery.project.includes(util_1.ALL_PROJECTS));
            }
            return toggle.archived === archived;
        });
        const clientRows = rows.map((t) => ({
            ...t,
            enabled: true,
            strategies: [],
            description: t.description || undefined,
            type: t.type || 'Release',
            stale: t.stale || false,
            variants: [],
            tags: [],
        }));
        return Promise.resolve(clientRows);
    }
    async getStrategyById(id) {
        const strat = this.featureStrategies.find((fS) => fS.id === id);
        if (strat) {
            return Promise.resolve(strat);
        }
        return Promise.reject(new notfound_error_1.default(`Could not find strategy with id ${id}`));
    }
    async connectEnvironmentAndFeature(feature_name, environment, enabled = false) {
        if (!this.environmentAndFeature.has(environment)) {
            this.environmentAndFeature.set(environment, []);
        }
        this.environmentAndFeature
            .get(environment)
            .push({ feature: feature_name, enabled });
        return Promise.resolve();
    }
    async removeEnvironmentForFeature(feature_name, environment) {
        this.environmentAndFeature.set(environment, this.environmentAndFeature
            .get(environment)
            .filter((e) => e.featureName !== feature_name));
        return Promise.resolve();
    }
    async disconnectEnvironmentFromProject(environment, project) {
        this.projectToEnvironment = this.projectToEnvironment.filter((f) => f.projectName !== project && f.environment !== environment);
        return Promise.resolve();
    }
    async updateStrategy(id, updates) {
        this.featureStrategies = this.featureStrategies.map((f) => {
            if (f.id === id) {
                return { ...f, ...updates };
            }
            return f;
        });
        return Promise.resolve(this.featureStrategies.find((f) => f.id === id));
    }
    async deleteConfigurationsForProjectAndEnvironment(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    projectId, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    environment) {
        return Promise.resolve();
    }
    async isEnvironmentEnabled(featureName, environment) {
        const enabled = this.environmentAndFeature
            .get(environment)
            ?.find((f) => f.featureName === featureName)?.enabled || false;
        return Promise.resolve(enabled);
    }
    async setProjectForStrategiesBelongingToFeature(featureName, newProjectId) {
        this.featureStrategies = this.featureStrategies.map((f) => {
            if (f.featureName === featureName) {
                f.projectId = newProjectId;
            }
            return f;
        });
        return Promise.resolve(undefined);
    }
    async setEnvironmentEnabledStatus(environment, featureName, enabled) {
        return Promise.resolve(enabled);
    }
    getStrategiesBySegment() {
        throw new Error('Method not implemented.');
    }
    getFeatureOverview(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    params) {
        return Promise.resolve([]);
    }
    getAllByFeatures(features, environment) {
        return Promise.resolve(this.featureStrategies.filter((strategy) => features.includes(strategy.featureName) &&
            strategy.environment === environment));
    }
    getCustomStrategiesInUseCount() {
        return Promise.resolve(3);
    }
}
exports.default = FakeFeatureStrategiesStore;
module.exports = FakeFeatureStrategiesStore;
//# sourceMappingURL=fake-feature-strategies-store.js.map