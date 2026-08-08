"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notfound_error_1 = __importDefault(require("../../lib/error/notfound-error"));
class FakeFeatureEnvironmentStore {
    constructor() {
        this.featureEnvironments = [];
    }
    async addEnvironmentToFeature(featureName, environment, enabled) {
        this.featureEnvironments.push({ environment, enabled, featureName });
    }
    async addVariantsToFeatureEnvironment(featureName, environment, variants) {
        this.setVariantsToFeatureEnvironments(featureName, [environment], variants);
    }
    async setVariantsToFeatureEnvironments(featureName, environments, variants) {
        this.featureEnvironments
            .filter((fe) => fe.featureName === featureName &&
            environments.includes(fe.environment))
            .forEach((fe) => {
            fe.variants = variants;
        });
    }
    async delete(key) {
        this.featureEnvironments.splice(this.featureEnvironments.findIndex((fE) => fE.environment === key.environment &&
            fE.featureName === key.featureName), 1);
    }
    async deleteAll() {
        this.featureEnvironments = [];
    }
    destroy() { }
    async disconnectFeatures(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    environment, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    project) {
        return Promise.resolve(undefined);
    }
    async exists(key) {
        return this.featureEnvironments.some((fE) => fE.featureName === key.featureName &&
            fE.environment === key.environment);
    }
    async featureHasEnvironment(environment, featureName) {
        return this.exists({ environment, featureName });
    }
    async get(key) {
        const featureEnvironment = this.featureEnvironments.find((fE) => fE.environment === key.environment &&
            fE.featureName === key.featureName);
        if (featureEnvironment) {
            return featureEnvironment;
        }
        throw new notfound_error_1.default(`Could not find environment ${key.environment} for feature: ${key.featureName}`);
    }
    async getAll() {
        return this.featureEnvironments;
    }
    getEnvironmentMetaData(environment, featureName) {
        return this.get({ environment, featureName });
    }
    async isEnvironmentEnabled(featureName, environment) {
        try {
            const fE = await this.get({ featureName, environment });
            return fE.enabled;
        }
        catch (e) {
            return false;
        }
    }
    async removeEnvironmentForFeature(featureName, environment) {
        return this.delete({ featureName, environment });
    }
    async setEnvironmentEnabledStatus(environment, featureName, enabled) {
        const fE = await this.get({ environment, featureName });
        if (fE.enabled !== enabled) {
            fE.enabled = enabled;
            return 1;
        }
        else {
            return 0;
        }
    }
    async connectProject(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    environment, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    projectId) {
        return Promise.resolve(undefined);
    }
    async connectFeatures(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    environment, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    projectId) {
        return Promise.reject(new Error('Not implemented'));
    }
    async disconnectProject(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    environment, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    projectId) {
        return Promise.reject(new Error('Not implemented'));
    }
    async connectFeatureToEnvironmentsForProject(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    featureName, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    projectId) {
        return Promise.resolve();
    }
    disableEnvironmentIfNoStrategies(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    featureName, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    environment) {
        return Promise.reject(new Error('Not implemented'));
    }
    copyEnvironmentFeaturesByProjects(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sourceEnvironment, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    destinationEnvironment, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    projects) {
        throw new Error('Method not implemented.');
    }
    cloneStrategies(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sourceEnvironment, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    destinationEnvironment) {
        throw new Error('Method not implemented.');
    }
    async addFeatureEnvironment(featureEnvironment) {
        this.featureEnvironments.push(featureEnvironment);
        return Promise.resolve();
    }
    getEnvironmentsForFeature(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    featureName) {
        throw new Error('Method not implemented.');
    }
    async getAllByFeatures(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    features, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    environment) {
        return this.featureEnvironments.filter((featureEnv) => (environment ? featureEnv.environment === environment : true) &&
            features.includes(featureEnv.featureName));
    }
    async variantExists(featureName) {
        return this.featureEnvironments.some((featureEnvironment) => featureEnvironment.featureName === featureName &&
            featureEnvironment.variants &&
            featureEnvironment.variants.length > 0);
    }
}
exports.default = FakeFeatureEnvironmentStore;
//# sourceMappingURL=fake-feature-environment-store.js.map