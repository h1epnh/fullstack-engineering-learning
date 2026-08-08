"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../types");
const context_schema_1 = require("../../services/context-schema");
const error_1 = require("../../error");
const feature_schema_1 = require("../../schema/feature-schema");
class ContextService {
    constructor({ contextFieldStore, featureStrategiesStore, }, { getLogger, flagResolver, }, eventService, privateProjectChecker) {
        this.privateProjectChecker = privateProjectChecker;
        this.eventService = eventService;
        this.flagResolver = flagResolver;
        this.contextFieldStore = contextFieldStore;
        this.featureStrategiesStore = featureStrategiesStore;
        this.logger = getLogger('services/context-service.js');
    }
    async getAll() {
        return this.contextFieldStore.getAll();
    }
    async getContextField(name) {
        const field = await this.contextFieldStore.get(name);
        if (field === undefined) {
            throw new error_1.NotFoundError(`Could not find context field with name ${name}`);
        }
        return field;
    }
    async getStrategiesByContextField(name, userId) {
        const strategies = await this.featureStrategiesStore.getStrategiesByContextField(name);
        const accessibleProjects = await this.privateProjectChecker.getUserAccessibleProjects(userId);
        if (accessibleProjects.mode === 'all') {
            return this.mapStrategies(strategies);
        }
        else {
            return this.mapStrategies(strategies.filter((strategy) => accessibleProjects.projects.includes(strategy.projectId)));
        }
    }
    mapStrategies(strategies) {
        return {
            strategies: strategies.map((strategy) => ({
                id: strategy.id,
                projectId: strategy.projectId,
                featureName: strategy.featureName,
                strategyName: strategy.strategyName,
                environment: strategy.environment,
            })),
        };
    }
    async createContextField(value, auditUser) {
        // validations
        await this.validateUniqueName(value);
        const contextField = await context_schema_1.contextSchema.validateAsync(value);
        // creations
        const createdField = await this.contextFieldStore.create(value);
        await this.eventService.storeEvent({
            type: types_1.CONTEXT_FIELD_CREATED,
            createdBy: auditUser.username,
            createdByUserId: auditUser.id,
            ip: auditUser.ip,
            data: contextField,
        });
        return createdField;
    }
    async updateContextField(updatedContextField, auditUser) {
        const contextField = await this.contextFieldStore.get(updatedContextField.name);
        if (contextField === undefined) {
            throw new error_1.NotFoundError(`Could not find context field with name: ${updatedContextField.name}`);
        }
        const value = await context_schema_1.contextSchema.validateAsync(updatedContextField);
        await this.contextFieldStore.update(value);
        const { createdAt, sortOrder, ...previousContextField } = contextField;
        await this.eventService.storeEvent({
            type: types_1.CONTEXT_FIELD_UPDATED,
            createdBy: auditUser.username,
            createdByUserId: auditUser.id,
            ip: auditUser.ip,
            preData: previousContextField,
            data: value,
        });
    }
    async updateLegalValue(contextFieldLegalValue, auditUser) {
        const contextField = await this.contextFieldStore.get(contextFieldLegalValue.name);
        if (contextField === undefined) {
            throw new error_1.NotFoundError(`Context field with name ${contextFieldLegalValue.name} was not found`);
        }
        const validatedLegalValue = await context_schema_1.legalValueSchema.validateAsync(contextFieldLegalValue.legalValue);
        const legalValues = contextField.legalValues
            ? [...contextField.legalValues]
            : [];
        const existingIndex = legalValues.findIndex((legalvalue) => legalvalue.value === validatedLegalValue.value);
        if (existingIndex !== -1) {
            legalValues[existingIndex] = validatedLegalValue;
        }
        else {
            legalValues.push(validatedLegalValue);
        }
        const newContextField = { ...contextField, legalValues };
        await this.contextFieldStore.update(newContextField);
        await this.eventService.storeEvent({
            type: types_1.CONTEXT_FIELD_UPDATED,
            createdBy: auditUser.username,
            createdByUserId: auditUser.id,
            ip: auditUser.ip,
            preData: contextField,
            data: newContextField,
        });
    }
    async deleteLegalValue(contextFieldLegalValue, auditUser) {
        const contextField = await this.contextFieldStore.get(contextFieldLegalValue.name);
        if (contextField === undefined) {
            throw new error_1.NotFoundError(`Could not find context field with name ${contextFieldLegalValue.name}`);
        }
        const newContextField = {
            ...contextField,
            legalValues: contextField.legalValues?.filter((legalValue) => legalValue.value !== contextFieldLegalValue.legalValue),
        };
        await this.contextFieldStore.update(newContextField);
        await this.eventService.storeEvent({
            type: types_1.CONTEXT_FIELD_UPDATED,
            createdBy: auditUser.username,
            createdByUserId: auditUser.id,
            ip: auditUser.ip,
            preData: contextField,
            data: newContextField,
        });
    }
    async deleteContextField(name, auditUser) {
        const contextField = await this.contextFieldStore.get(name);
        // delete
        await this.contextFieldStore.delete(name);
        await this.eventService.storeEvent({
            type: types_1.CONTEXT_FIELD_DELETED,
            createdBy: auditUser.username,
            createdByUserId: auditUser.id,
            ip: auditUser.ip,
            preData: contextField,
        });
    }
    async validateUniqueName({ name, }) {
        let msg;
        try {
            await this.contextFieldStore.get(name);
            msg = 'A context field with that name already exist';
        }
        catch (error) {
            // No conflict, everything ok!
            return;
        }
        // Intentional throw here!
        throw new error_1.NameExistsError(msg);
    }
    async validateName(name) {
        await feature_schema_1.nameSchema.validateAsync({ name });
        await this.validateUniqueName({ name });
    }
}
exports.default = ContextService;
module.exports = ContextService;
//# sourceMappingURL=context-service.js.map