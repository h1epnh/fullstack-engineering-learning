"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../types");
const error_1 = require("../../error");
const import_context_validation_1 = require("./import-context-validation");
const import_permissions_service_1 = require("./import-permissions-service");
const import_validation_messages_1 = require("./import-validation-messages");
const findDuplicates_1 = require("../../util/findDuplicates");
const lodash_groupby_1 = __importDefault(require("lodash.groupby"));
const allSettledWithRejection_1 = require("../../util/allSettledWithRejection");
const read_file_1 = require("../../util/read-file");
class ExportImportService {
    constructor(stores, { getLogger, flagResolver, }, { featureToggleService, strategyService, contextService, accessService, eventService, tagTypeService, featureTagService, dependentFeaturesService, }, dependentFeaturesReadModel, segmentReadModel) {
        this.isCustomStrategy = (supportedStrategies) => {
            const customStrategies = supportedStrategies
                .filter((s) => s.editable)
                .map((strategy) => strategy.name);
            return (featureStrategy) => customStrategies.includes(featureStrategy);
        };
        this.toggleStore = stores.featureToggleStore;
        this.importTogglesStore = stores.importTogglesStore;
        this.featureStrategiesStore = stores.featureStrategiesStore;
        this.featureEnvironmentStore = stores.featureEnvironmentStore;
        this.tagTypeStore = stores.tagTypeStore;
        this.featureTagStore = stores.featureTagStore;
        this.flagResolver = flagResolver;
        this.featureToggleService = featureToggleService;
        this.contextFieldStore = stores.contextFieldStore;
        this.strategyService = strategyService;
        this.contextService = contextService;
        this.accessService = accessService;
        this.eventService = eventService;
        this.tagTypeService = tagTypeService;
        this.featureTagService = featureTagService;
        this.dependentFeaturesService = dependentFeaturesService;
        this.importPermissionsService = new import_permissions_service_1.ImportPermissionsService(this.importTogglesStore, this.accessService, this.tagTypeService, this.contextService);
        this.dependentFeaturesReadModel = dependentFeaturesReadModel;
        this.segmentReadModel = segmentReadModel;
        this.logger = getLogger('services/state-service.js');
    }
    async validate(dto, user, mode = 'regular') {
        const [unsupportedStrategies, usedCustomStrategies, unsupportedContextFields, archivedFeatures, otherProjectFeatures, existingProjectFeatures, missingPermissions, duplicateFeatures, featureNameCheckResult, featureLimitResult, unsupportedSegments, unsupportedDependencies,] = await Promise.all([
            this.getUnsupportedStrategies(dto),
            this.getUsedCustomStrategies(dto),
            this.getUnsupportedContextFields(dto),
            this.getArchivedFeatures(dto),
            this.getOtherProjectFeatures(dto),
            this.getExistingProjectFeatures(dto),
            this.importPermissionsService.getMissingPermissions(dto, user, mode),
            this.getDuplicateFeatures(dto),
            this.getInvalidFeatureNames(dto),
            this.getFeatureLimit(dto),
            this.getUnsupportedSegments(dto),
            this.getMissingDependencies(dto),
        ]);
        const errors = import_validation_messages_1.ImportValidationMessages.compileErrors({
            projectName: dto.project,
            strategies: unsupportedStrategies,
            contextFields: unsupportedContextFields || [],
            otherProjectFeatures,
            duplicateFeatures,
            featureNameCheckResult,
            featureLimitResult,
            segments: unsupportedSegments,
            dependencies: unsupportedDependencies,
        });
        const warnings = import_validation_messages_1.ImportValidationMessages.compileWarnings({
            archivedFeatures,
            existingFeatures: existingProjectFeatures,
            usedCustomStrategies,
        });
        const permissions = import_validation_messages_1.ImportValidationMessages.compilePermissionErrors(missingPermissions);
        return {
            errors,
            warnings,
            permissions,
        };
    }
    async importVerify(dto, user, mode = 'regular') {
        await (0, allSettledWithRejection_1.allSettledWithRejection)([
            this.verifyStrategies(dto),
            this.verifyContextFields(dto),
            this.importPermissionsService.verifyPermissions(dto, user, mode),
            this.verifyFeatures(dto),
            this.verifySegments(dto),
            this.verifyDependencies(dto),
        ]);
    }
    async fileImportVerify(dto) {
        await (0, allSettledWithRejection_1.allSettledWithRejection)([
            this.verifyStrategies(dto),
            this.verifyContextFields(dto),
            this.verifyFeatures(dto),
            this.verifySegments(dto),
            this.verifyDependencies(dto),
        ]);
    }
    async importFeatureData(dto, auditUser) {
        await this.createOrUpdateToggles(dto, auditUser);
        await this.importToggleVariants(dto, auditUser);
        await this.importTagTypes(dto, auditUser);
        await this.importTags(dto, auditUser);
        await this.importContextFields(dto, auditUser);
    }
    async import(dto, user, auditUser) {
        const cleanedDto = await this.cleanData(dto);
        await this.importVerify(cleanedDto, user);
        await this.processImport(cleanedDto, user, auditUser);
    }
    async importFromFile(file, project, environment) {
        const content = await (0, read_file_1.readFile)(file);
        const data = JSON.parse(content);
        const dto = {
            project,
            environment,
            data,
        };
        const cleanedDto = await this.cleanData(dto);
        await this.fileImportVerify(cleanedDto);
        await this.processImport(cleanedDto, types_1.SYSTEM_USER, types_1.SYSTEM_USER_AUDIT);
    }
    async processImport(dto, user, auditUser) {
        await this.importFeatureData(dto, auditUser);
        await this.importEnvironmentData(dto, user, auditUser);
        await this.eventService.storeEvent(new types_1.FeaturesImportedEvent({
            project: dto.project,
            environment: dto.environment,
            auditUser,
        }));
    }
    async importEnvironmentData(dto, user, auditUser) {
        await this.deleteStrategies(dto);
        await this.importStrategies(dto, auditUser);
        await this.importToggleStatuses(dto, user, auditUser);
        await this.importDependencies(dto, user, auditUser);
    }
    async importDependencies(dto, user, auditUser) {
        await Promise.all((dto.data.dependencies || []).flatMap((dependency) => {
            const feature = dto.data.features.find((feature) => feature.name === dependency.feature);
            if (!feature || !feature.project) {
                return [];
            }
            const projectId = feature.project;
            return dependency.dependencies.map((parentDependency) => this.dependentFeaturesService.upsertFeatureDependency({
                child: dependency.feature,
                projectId,
            }, parentDependency, user, auditUser));
        }));
    }
    async importToggleStatuses(dto, user, auditUser) {
        await Promise.all((dto.data.featureEnvironments || []).map((featureEnvironment) => this.featureToggleService.updateEnabled(dto.project, featureEnvironment.name, dto.environment, featureEnvironment.enabled, auditUser, user)));
    }
    async importStrategies(dto, auditUser) {
        const hasFeatureName = (featureStrategy) => Boolean(featureStrategy.featureName);
        await Promise.all(dto.data.featureStrategies
            ?.filter(hasFeatureName)
            .map(({ featureName, ...restOfFeatureStrategy }) => this.featureToggleService.createStrategy(restOfFeatureStrategy, {
            featureName,
            environment: dto.environment,
            projectId: dto.project,
        }, auditUser)));
    }
    async deleteStrategies(dto) {
        return this.importTogglesStore.deleteStrategiesForFeatures(dto.data.features.map((feature) => feature.name), dto.environment);
    }
    async importTags(dto, auditUser) {
        await this.importTogglesStore.deleteTagsForFeatures(dto.data.features.map((feature) => feature.name));
        const featureTags = dto.data.featureTags || [];
        for (const tag of featureTags) {
            if (tag.tagType) {
                await this.featureTagService.addTag(tag.featureName, {
                    type: tag.tagType,
                    value: tag.tagValue,
                }, auditUser);
            }
        }
    }
    async importContextFields(dto, auditUser) {
        const newContextFields = (await this.getNewContextFields(dto)) || [];
        await Promise.all(newContextFields.map((contextField) => this.contextService.createContextField({
            name: contextField.name,
            description: contextField.description,
            legalValues: contextField.legalValues,
            stickiness: contextField.stickiness,
        }, auditUser)));
    }
    async importTagTypes(dto, auditUser) {
        const newTagTypes = await this.getNewTagTypes(dto);
        return Promise.all(newTagTypes.map((tagType) => {
            return tagType
                ? this.tagTypeService.createTagType(tagType, auditUser)
                : Promise.resolve();
        }));
    }
    async importToggleVariants(dto, auditUser) {
        const featureEnvsWithVariants = dto.data.featureEnvironments?.filter((featureEnvironment) => Array.isArray(featureEnvironment.variants) &&
            featureEnvironment.variants.length > 0) || [];
        await Promise.all(featureEnvsWithVariants.map((featureEnvironment) => {
            return featureEnvironment.featureName
                ? this.featureToggleService.legacySaveVariantsOnEnv(dto.project, featureEnvironment.featureName, dto.environment, featureEnvironment.variants, auditUser)
                : Promise.resolve();
        }));
    }
    async createOrUpdateToggles(dto, auditUser) {
        const existingFeatures = await this.getExistingProjectFeatures(dto);
        for (const feature of dto.data.features) {
            if (existingFeatures.includes(feature.name)) {
                const { archivedAt, createdAt, ...rest } = feature;
                await this.featureToggleService.updateFeatureToggle(dto.project, rest, feature.name, auditUser);
            }
            else {
                await this.featureToggleService.validateName(feature.name);
                const { archivedAt, createdAt, ...rest } = feature;
                await this.featureToggleService.createFeatureToggle(dto.project, rest, auditUser);
            }
        }
    }
    async getUnsupportedSegments(dto) {
        const supportedSegments = await this.segmentReadModel.getAll();
        const targetProject = dto.project;
        return dto.data.segments
            ? dto.data.segments
                .filter((importingSegment) => !supportedSegments.find((existingSegment) => importingSegment.name ===
                existingSegment.name &&
                (!existingSegment.project ||
                    existingSegment.project ===
                        targetProject)))
                .map((it) => it.name)
            : [];
    }
    async getMissingDependencies(dto) {
        const dependentFeatures = dto.data.dependencies?.flatMap((dependency) => dependency.dependencies.map((d) => d.feature)) || [];
        const importedFeatures = dto.data.features.map((f) => f.name);
        const missingFromImported = dependentFeatures.filter((feature) => !importedFeatures.includes(feature));
        let missingFeatures = [];
        if (missingFromImported.length) {
            const featuresFromStore = (await this.toggleStore.getAllByNames(missingFromImported)).map((f) => f.name);
            missingFeatures = missingFromImported.filter((feature) => !featuresFromStore.includes(feature));
        }
        return missingFeatures;
    }
    async verifySegments(dto) {
        const unsupportedSegments = await this.getUnsupportedSegments(dto);
        if (unsupportedSegments.length > 0) {
            throw new error_1.BadDataError(`Unsupported segments: ${unsupportedSegments.join(', ')}`);
        }
    }
    async verifyDependencies(dto) {
        const unsupportedDependencies = await this.getMissingDependencies(dto);
        if (unsupportedDependencies.length > 0) {
            throw new error_1.BadDataError(`The following dependent features are missing: ${unsupportedDependencies.join(', ')}`);
        }
    }
    async verifyContextFields(dto) {
        const unsupportedContextFields = await this.getUnsupportedContextFields(dto);
        if (Array.isArray(unsupportedContextFields)) {
            const [firstError, ...remainingErrors] = unsupportedContextFields.map((field) => {
                const description = `${field.name} is not supported.`;
                return {
                    description,
                    message: description,
                };
            });
            if (firstError !== undefined) {
                throw new error_1.BadDataError('Some of the context fields you are trying to import are not supported.', [firstError, ...remainingErrors]);
            }
        }
    }
    async verifyFeatures(dto) {
        const otherProjectFeatures = await this.getOtherProjectFeatures(dto);
        if (otherProjectFeatures.length > 0) {
            throw new error_1.BadDataError(`These features exist already in other projects: ${otherProjectFeatures.join(', ')}`);
        }
    }
    async cleanData(dto) {
        const removedFeaturesDto = await this.removeArchivedFeatures(dto);
        return this.remapSegments(removedFeaturesDto);
    }
    async remapSegments(dto) {
        const existingSegments = await this.segmentReadModel.getAll();
        const segmentMapping = new Map(dto.data.segments?.map((segment) => [
            segment.id,
            existingSegments.find((existingSegment) => existingSegment.name === segment.name)?.id,
        ]));
        return {
            ...dto,
            data: {
                ...dto.data,
                featureStrategies: dto.data.featureStrategies.map((strategy) => ({
                    ...strategy,
                    segments: strategy.segments?.map((segment) => segmentMapping.get(segment)),
                })),
            },
        };
    }
    async removeArchivedFeatures(dto) {
        const archivedFeatures = await this.getArchivedFeatures(dto);
        const featureTags = dto.data.featureTags?.filter((tag) => !archivedFeatures.includes(tag.featureName)) || [];
        return {
            ...dto,
            data: {
                ...dto.data,
                features: dto.data.features.filter((feature) => !archivedFeatures.includes(feature.name)),
                featureEnvironments: dto.data.featureEnvironments?.filter((environment) => environment.featureName &&
                    !archivedFeatures.includes(environment.featureName)),
                featureStrategies: dto.data.featureStrategies.filter((strategy) => strategy.featureName &&
                    !archivedFeatures.includes(strategy.featureName)),
                featureTags,
                tagTypes: dto.data.tagTypes?.filter((tagType) => featureTags
                    .map((tag) => tag.tagType)
                    .includes(tagType.name)),
            },
        };
    }
    async verifyStrategies(dto) {
        const unsupportedStrategies = await this.getUnsupportedStrategies(dto);
        const [firstError, ...remainingErrors] = unsupportedStrategies.map((strategy) => {
            const description = `${strategy.name} is not supported.`;
            return {
                description,
                message: description,
            };
        });
        if (firstError !== undefined) {
            throw new error_1.BadDataError('Some of the strategies you are trying to import are not supported.', [firstError, ...remainingErrors]);
        }
    }
    async getInvalidFeatureNames({ project, data, }) {
        return this.featureToggleService.checkFeatureFlagNamesAgainstProjectPattern(project, data.features.map((f) => f.name));
    }
    async getFeatureLimit({ project, data, }) {
        return this.importTogglesStore.getProjectFeaturesLimit([...new Set(data.features.map((f) => f.name))], project);
    }
    async getUnsupportedStrategies(dto) {
        const supportedStrategies = await this.strategyService.getStrategies();
        return dto.data.featureStrategies.filter((featureStrategy) => !supportedStrategies.find((strategy) => featureStrategy.name === strategy.name));
    }
    async getUsedCustomStrategies(dto) {
        const supportedStrategies = await this.strategyService.getStrategies();
        const uniqueFeatureStrategies = [
            ...new Set(dto.data.featureStrategies.map((strategy) => strategy.name)),
        ];
        return uniqueFeatureStrategies.filter(this.isCustomStrategy(supportedStrategies));
    }
    async getUnsupportedContextFields(dto) {
        const availableContextFields = await this.contextService.getAll();
        return dto.data.contextFields?.filter((contextField) => !(0, import_context_validation_1.isValidField)(contextField, availableContextFields));
    }
    async getArchivedFeatures(dto) {
        return this.importTogglesStore.getArchivedFeatures(dto.data.features.map((feature) => feature.name));
    }
    async getOtherProjectFeatures(dto) {
        const otherProjectsFeatures = await this.importTogglesStore.getFeaturesInOtherProjects(dto.data.features.map((feature) => feature.name), dto.project);
        return otherProjectsFeatures.map((it) => `${it.name} (in project ${it.project})`);
    }
    async getExistingProjectFeatures(dto) {
        return this.importTogglesStore.getFeaturesInProject(dto.data.features.map((feature) => feature.name), dto.project);
    }
    getDuplicateFeatures(dto) {
        return (0, findDuplicates_1.findDuplicates)(dto.data.features.map((feature) => feature.name));
    }
    async getNewTagTypes(dto) {
        const existingTagTypes = (await this.tagTypeService.getAll()).map((tagType) => tagType.name);
        const newTagTypes = (dto.data.tagTypes || []).filter((tagType) => !existingTagTypes.includes(tagType.name));
        return [
            ...new Map(newTagTypes.map((item) => [item.name, item])).values(),
        ];
    }
    async getNewContextFields(dto) {
        const availableContextFields = await this.contextService.getAll();
        return dto.data.contextFields?.filter((contextField) => !availableContextFields.some((availableField) => availableField.name === contextField.name));
    }
    async export(query, auditUser) {
        let featureNames = [];
        if (typeof query.tag === 'string') {
            featureNames = await this.featureTagService.listFeatures(query.tag);
        }
        else if (Array.isArray(query.features) && query.features.length) {
            featureNames = query.features;
        }
        else if (typeof query.project === 'string') {
            const allProjectFeatures = await this.toggleStore.getAll({
                project: query.project,
            });
            featureNames = allProjectFeatures.map((feature) => feature.name);
        }
        else {
            const allFeatures = await this.toggleStore.getAll();
            featureNames = allFeatures.map((feature) => feature.name);
        }
        const [features, featureEnvironments, featureStrategies, strategySegments, contextFields, featureTags, segments, tagTypes, featureDependencies,] = await Promise.all([
            this.toggleStore.getAllByNames(featureNames),
            await this.featureEnvironmentStore.getAllByFeatures(featureNames, query.environment),
            this.featureStrategiesStore.getAllByFeatures(featureNames, query.environment),
            this.segmentReadModel.getAllFeatureStrategySegments(),
            this.contextFieldStore.getAll(),
            this.featureTagStore.getAllByFeatures(featureNames),
            this.segmentReadModel.getAll(),
            this.tagTypeStore.getAll(),
            this.dependentFeaturesReadModel.getDependencies(featureNames),
        ]);
        this.addSegmentsToStrategies(featureStrategies, strategySegments);
        const filteredContextFields = contextFields
            .filter((field) => featureEnvironments.some((featureEnv) => featureEnv.variants?.some((variant) => variant.stickiness === field.name ||
            variant.overrides?.some((override) => override.contextName === field.name))) ||
            featureStrategies.some((strategy) => strategy.parameters.stickiness === field.name ||
                strategy.constraints.some((constraint) => constraint.contextName === field.name)))
            .map((item) => {
            const { usedInFeatures, usedInProjects, ...rest } = item;
            return rest;
        });
        const filteredSegments = segments.filter((segment) => featureStrategies.some((strategy) => strategy.segments?.includes(segment.id)));
        const filteredTagTypes = tagTypes.filter((tagType) => featureTags.map((tag) => tag.tagType).includes(tagType.name));
        const groupedFeatureDependencies = (0, lodash_groupby_1.default)(featureDependencies, 'feature');
        const mappedFeatureDependencies = Object.entries(groupedFeatureDependencies).map(([feature, dependencies]) => ({
            feature,
            dependencies: dependencies.map((d) => d.dependency),
        }));
        const result = {
            features: features.map((item) => {
                const { createdAt, archivedAt, lastSeenAt, ...rest } = item;
                return rest;
            }),
            featureStrategies: featureStrategies.map((item) => {
                const name = item.strategyName;
                const { createdAt, projectId, environment, strategyName, milestoneId, ...rest } = item;
                return {
                    name,
                    ...rest,
                };
            }),
            featureEnvironments: featureEnvironments.map((item) => {
                const { lastSeenAt, ...rest } = item;
                return {
                    ...rest,
                    name: item.featureName,
                };
            }),
            contextFields: filteredContextFields.map((item) => {
                const { createdAt, ...rest } = item;
                return rest;
            }),
            featureTags,
            segments: filteredSegments.map((item) => {
                const { id, name } = item;
                return {
                    id,
                    name,
                };
            }),
            tagTypes: filteredTagTypes,
            dependencies: mappedFeatureDependencies,
        };
        await this.eventService.storeEvent(new types_1.FeaturesExportedEvent({ data: result, auditUser }));
        return result;
    }
    addSegmentsToStrategies(featureStrategies, strategySegments) {
        featureStrategies.forEach((featureStrategy) => {
            featureStrategy.segments = strategySegments
                .filter((segment) => segment.featureStrategyId === featureStrategy.id)
                .map((segment) => segment.segmentId);
        });
    }
}
exports.default = ExportImportService;
module.exports = ExportImportService;
//# sourceMappingURL=export-import-service.js.map