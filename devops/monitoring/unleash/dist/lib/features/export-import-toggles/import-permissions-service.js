"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportPermissionsService = void 0;
const types_1 = require("../../types");
const error_1 = require("../../error");
class ImportPermissionsService {
    async getNewTagTypes(dto) {
        const existingTagTypes = (await this.tagTypeService.getAll()).map((tagType) => tagType.name);
        const newTagTypes = dto.data.tagTypes?.filter((tagType) => !existingTagTypes.includes(tagType.name));
        return [
            ...new Map(newTagTypes.map((item) => [item.name, item])).values(),
        ];
    }
    async getNewContextFields(dto) {
        const availableContextFields = await this.contextService.getAll();
        return (dto.data.contextFields?.filter((contextField) => !availableContextFields.some((availableField) => availableField.name === contextField.name)) || []);
    }
    constructor(importTogglesStore, accessService, tagTypeService, contextService) {
        this.importTogglesStore = importTogglesStore;
        this.accessService = accessService;
        this.tagTypeService = tagTypeService;
        this.contextService = contextService;
    }
    async getMissingPermissions(dto, user, mode) {
        const [newTagTypes, newContextFields, strategiesExistForFeatures, featureEnvsWithVariants, existingFeatures,] = await Promise.all([
            this.getNewTagTypes(dto),
            this.getNewContextFields(dto),
            this.importTogglesStore.strategiesExistForFeatures(dto.data.features.map((feature) => feature.name), dto.environment),
            dto.data.featureEnvironments?.filter((featureEnvironment) => Array.isArray(featureEnvironment.variants) &&
                featureEnvironment.variants.length > 0) || Promise.resolve([]),
            this.importTogglesStore.getExistingFeatures(dto.data.features.map((feature) => feature.name)),
        ]);
        const permissions = [types_1.UPDATE_FEATURE];
        if (newTagTypes.length > 0) {
            permissions.push(types_1.CREATE_TAG_TYPE);
        }
        if (Array.isArray(newContextFields) && newContextFields.length > 0) {
            permissions.push(types_1.CREATE_CONTEXT_FIELD);
        }
        if (strategiesExistForFeatures && mode === 'regular') {
            permissions.push(types_1.DELETE_FEATURE_STRATEGY);
        }
        if (dto.data.featureStrategies.length > 0 && mode === 'regular') {
            permissions.push(types_1.CREATE_FEATURE_STRATEGY);
        }
        if (featureEnvsWithVariants.length > 0 && mode === 'regular') {
            permissions.push(types_1.UPDATE_FEATURE_ENVIRONMENT_VARIANTS);
        }
        if (existingFeatures.length < dto.data.features.length) {
            permissions.push(types_1.CREATE_FEATURE);
        }
        const displayPermissions = await this.importTogglesStore.getDisplayPermissions(permissions);
        const results = await Promise.all(displayPermissions.map((permission) => this.accessService
            .hasPermission(user, permission.name, dto.project, dto.environment)
            .then((hasPermission) => [permission, hasPermission])));
        return results
            .filter(([, hasAccess]) => !hasAccess)
            .map(([permission]) => permission.displayName);
    }
    async verifyPermissions(dto, user, mode) {
        const missingPermissions = await this.getMissingPermissions(dto, user, mode);
        if (missingPermissions.length > 0) {
            throw new error_1.PermissionError(missingPermissions);
        }
    }
}
exports.ImportPermissionsService = ImportPermissionsService;
//# sourceMappingURL=import-permissions-service.js.map