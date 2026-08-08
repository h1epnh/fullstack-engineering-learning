"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependentFeaturesService = void 0;
const error_1 = require("../../error");
const types_1 = require("../../types");
class DependentFeaturesService {
    constructor({ featuresReadModel, dependentFeaturesReadModel, dependentFeaturesStore, eventService, changeRequestAccessReadModel, }) {
        this.dependentFeaturesStore = dependentFeaturesStore;
        this.dependentFeaturesReadModel = dependentFeaturesReadModel;
        this.changeRequestAccessReadModel = changeRequestAccessReadModel;
        this.featuresReadModel = featuresReadModel;
        this.eventService = eventService;
    }
    async cloneDependencies({ featureName, newFeatureName, projectId, }, auditUser) {
        const parents = await this.dependentFeaturesReadModel.getParents(featureName);
        await Promise.all(parents.map((parent) => this.unprotectedUpsertFeatureDependency({ child: newFeatureName, projectId }, {
            feature: parent.feature,
            enabled: parent.enabled,
            variants: parent.variants,
        }, auditUser)));
    }
    async upsertFeatureDependency({ child, projectId }, dependentFeature, user, auditUser) {
        await this.stopWhenChangeRequestsEnabled(projectId, user);
        return this.unprotectedUpsertFeatureDependency({ child, projectId }, dependentFeature, auditUser);
    }
    async unprotectedUpsertFeatureDependency({ child, projectId }, dependentFeature, auditUser) {
        const { enabled, feature: parent, variants } = dependentFeature;
        if (child === parent) {
            throw new error_1.InvalidOperationError('A feature flag cannot depend on itself.');
        }
        const [grandchildren, grandparents, parentExists, sameProject] = await Promise.all([
            this.dependentFeaturesReadModel.getChildren([child]),
            this.dependentFeaturesReadModel.getParents(parent),
            this.featuresReadModel.featureExists(parent),
            this.featuresReadModel.featuresInTheSameProject(child, parent),
        ]);
        if (grandchildren.length > 0) {
            throw new error_1.InvalidOperationError('Transitive dependency detected. Cannot add a dependency to the feature that other features depend on.');
        }
        if (grandparents.length > 0) {
            throw new error_1.InvalidOperationError('Transitive dependency detected. Cannot add a dependency to the feature that has parent dependency.');
        }
        if (!parentExists) {
            throw new error_1.InvalidOperationError(`No active feature ${parent} exists`);
        }
        if (!sameProject) {
            throw new error_1.InvalidOperationError('Parent and child features should be in the same project');
        }
        const featureDependency = enabled === false
            ? {
                parent,
                child,
                enabled,
            }
            : {
                parent,
                child,
                enabled: true,
                variants,
            };
        await this.dependentFeaturesStore.upsert(featureDependency);
        await this.eventService.storeEvent(new types_1.FeatureDependencyAddedEvent({
            project: projectId,
            featureName: child,
            auditUser,
            data: {
                feature: parent,
                enabled: featureDependency.enabled,
                ...(variants !== undefined && { variants }),
            },
        }));
    }
    async deleteFeatureDependency(dependency, projectId, user, auditUser) {
        await this.stopWhenChangeRequestsEnabled(projectId, user);
        return this.unprotectedDeleteFeatureDependency(dependency, projectId, auditUser);
    }
    async unprotectedDeleteFeatureDependency(dependency, projectId, auditUser) {
        await this.dependentFeaturesStore.delete(dependency);
        await this.eventService.storeEvent(new types_1.FeatureDependencyRemovedEvent({
            project: projectId,
            featureName: dependency.child,
            auditUser,
            data: { feature: dependency.parent },
        }));
    }
    async deleteFeaturesDependencies(features, projectId, user, auditUser) {
        await this.stopWhenChangeRequestsEnabled(projectId, user);
        return this.unprotectedDeleteFeaturesDependencies(features, projectId, auditUser);
    }
    async unprotectedDeleteFeaturesDependencies(features, projectId, auditUser) {
        const dependencies = await this.dependentFeaturesReadModel.getDependencies(features);
        const featuresWithDependencies = dependencies.map((dependency) => dependency.feature);
        if (featuresWithDependencies.length > 0) {
            await this.dependentFeaturesStore.deleteAll(featuresWithDependencies);
            await this.eventService.storeEvents(featuresWithDependencies.map((feature) => new types_1.FeatureDependenciesRemovedEvent({
                project: projectId,
                featureName: feature,
                auditUser,
            })));
        }
    }
    async getPossibleParentFeatures(feature) {
        return this.dependentFeaturesReadModel.getPossibleParentFeatures(feature);
    }
    async getPossibleParentVariants(parentFeature) {
        return this.dependentFeaturesReadModel.getPossibleParentVariants(parentFeature);
    }
    async checkDependenciesExist() {
        return this.dependentFeaturesReadModel.hasAnyDependencies();
    }
    async stopWhenChangeRequestsEnabled(project, user) {
        const canBypass = await this.changeRequestAccessReadModel.canBypassChangeRequestForProject(project, user);
        if (!canBypass) {
            throw new error_1.PermissionError(types_1.SKIP_CHANGE_REQUEST);
        }
    }
}
exports.DependentFeaturesService = DependentFeaturesService;
//# sourceMappingURL=dependent-features-service.js.map