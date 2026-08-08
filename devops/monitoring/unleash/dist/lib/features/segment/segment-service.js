"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SegmentService = void 0;
const types_1 = require("../../types");
const name_exists_error_1 = __importDefault(require("../../error/name-exists-error"));
const segment_schema_1 = require("../../services/segment-schema");
const bad_data_error_1 = __importDefault(require("../../error/bad-data-error"));
const error_1 = require("../../error");
const exceeds_limit_error_1 = require("../../error/exceeds-limit-error");
class SegmentService {
    constructor({ segmentStore, featureStrategiesStore, }, changeRequestAccessReadModel, changeRequestSegmentUsageReadModel, config, eventService, privateProjectChecker) {
        this.segmentStore = segmentStore;
        this.featureStrategiesStore = featureStrategiesStore;
        this.eventService = eventService;
        this.changeRequestAccessReadModel = changeRequestAccessReadModel;
        this.changeRequestSegmentUsageReadModel =
            changeRequestSegmentUsageReadModel;
        this.privateProjectChecker = privateProjectChecker;
        this.logger = config.getLogger('services/segment-service.ts');
        this.flagResolver = config.flagResolver;
        this.resourceLimits = config.resourceLimits;
        this.config = config;
    }
    async get(id) {
        const segment = await this.segmentStore.get(id);
        if (segment === undefined) {
            throw new error_1.NotFoundError(`Could find segment with id ${id}`);
        }
        return segment;
    }
    async getAll() {
        return this.segmentStore.getAll(this.config.isEnterprise);
    }
    async getByStrategy(strategyId) {
        return this.segmentStore.getByStrategy(strategyId);
    }
    async getVisibleStrategies(id, userId) {
        const allStrategies = await this.getAllStrategies(id);
        const accessibleProjects = await this.privateProjectChecker.getUserAccessibleProjects(userId);
        if (accessibleProjects.mode === 'all') {
            return allStrategies;
        }
        else {
            const filter = (strategy) => accessibleProjects.projects.includes(strategy.projectId);
            return {
                strategies: allStrategies.strategies.filter(filter),
                changeRequestStrategies: allStrategies.changeRequestStrategies.filter(filter),
            };
        }
    }
    async getAllStrategies(id) {
        const strategies = await this.featureStrategiesStore.getStrategiesBySegment(id);
        if (this.config.isEnterprise) {
            const changeRequestStrategies = await this.changeRequestSegmentUsageReadModel.getStrategiesUsedInActiveChangeRequests(id);
            return { strategies, changeRequestStrategies };
        }
        return { strategies, changeRequestStrategies: [] };
    }
    async isInUse(id) {
        const { strategies, changeRequestStrategies } = await this.getAllStrategies(id);
        return strategies.length > 0 || changeRequestStrategies.length > 0;
    }
    async validateSegmentLimit() {
        const limit = this.resourceLimits.segments;
        const segmentCount = await this.segmentStore.count();
        if (segmentCount >= limit) {
            (0, exceeds_limit_error_1.throwExceedsLimitError)(this.config.eventBus, {
                resource: 'segment',
                limit,
            });
        }
    }
    async create(data, auditUser) {
        await this.validateSegmentLimit();
        const input = await segment_schema_1.segmentSchema.validateAsync(data);
        this.validateSegmentValuesLimit(input);
        await this.validateName(input.name);
        const segment = await this.segmentStore.create(input, auditUser);
        await this.eventService.storeEvent(new types_1.SegmentCreatedEvent({
            data: segment,
            project: segment.project,
            auditUser,
        }));
        return segment;
    }
    async update(id, data, user, auditUser) {
        const input = await segment_schema_1.segmentSchema.validateAsync(data);
        await this.stopWhenChangeRequestsEnabled(input.project, user);
        return this.unprotectedUpdate(id, data, auditUser);
    }
    async unprotectedUpdate(id, data, auditUser) {
        const input = await segment_schema_1.segmentSchema.validateAsync(data);
        this.validateSegmentValuesLimit(input);
        const preData = await this.segmentStore.get(id);
        if (preData === undefined) {
            throw new error_1.NotFoundError(`Could not find segment with id ${id} to update`);
        }
        if (preData.name !== input.name) {
            await this.validateName(input.name);
        }
        await this.validateSegmentProject(id, input);
        const segment = await this.segmentStore.update(id, input);
        await this.eventService.storeEvent(new types_1.SegmentUpdatedEvent({
            data: segment,
            preData,
            project: segment.project,
            auditUser,
        }));
    }
    async delete(id, user, auditUser) {
        const segment = await this.segmentStore.get(id);
        if (segment === undefined) {
            /// Already deleted
            return;
        }
        await this.stopWhenChangeRequestsEnabled(segment.project, user);
        await this.segmentStore.delete(id);
        await this.eventService.storeEvent(new types_1.SegmentDeletedEvent({
            preData: segment,
            project: segment.project,
            auditUser,
        }));
    }
    async unprotectedDelete(id, auditUser) {
        const segment = await this.segmentStore.get(id);
        await this.segmentStore.delete(id);
        await this.eventService.storeEvent(new types_1.SegmentDeletedEvent({
            preData: segment,
            auditUser,
        }));
    }
    async cloneStrategySegments(sourceStrategyId, targetStrategyId) {
        const sourceStrategySegments = await this.getByStrategy(sourceStrategyId);
        await Promise.all(sourceStrategySegments.map((sourceStrategySegment) => {
            return this.addToStrategy(sourceStrategySegment.id, targetStrategyId);
        }));
    }
    // Used by unleash-enterprise.
    async addToStrategy(id, strategyId) {
        await this.validateStrategySegmentLimit(strategyId);
        await this.segmentStore.addToStrategy(id, strategyId);
    }
    async updateStrategySegments(strategyId, segmentIds) {
        if (segmentIds.length > this.config.strategySegmentsLimit) {
            throw new bad_data_error_1.default(`Strategies may not have more than ${this.config.strategySegmentsLimit} segments`);
        }
        const segments = await this.getByStrategy(strategyId);
        const currentSegmentIds = segments.map((segment) => segment.id);
        const segmentIdsToRemove = currentSegmentIds.filter((id) => !segmentIds.includes(id));
        await Promise.all(segmentIdsToRemove.map((segmentId) => this.removeFromStrategy(segmentId, strategyId)));
        const segmentIdsToAdd = segmentIds.filter((id) => !currentSegmentIds.includes(id));
        await Promise.all(segmentIdsToAdd.map((segmentId) => this.addToStrategy(segmentId, strategyId)));
    }
    // Used by unleash-enterprise.
    async removeFromStrategy(id, strategyId) {
        await this.segmentStore.removeFromStrategy(id, strategyId);
    }
    async validateName(name) {
        if (!name) {
            throw new bad_data_error_1.default('Segment name cannot be empty');
        }
        if (await this.segmentStore.existsByName(name)) {
            throw new name_exists_error_1.default('Segment name already exists');
        }
    }
    async validateStrategySegmentLimit(strategyId) {
        const { strategySegmentsLimit } = this.config;
        if ((await this.getByStrategy(strategyId)).length >=
            strategySegmentsLimit) {
            throw new bad_data_error_1.default(`Strategies may not have more than ${strategySegmentsLimit} segments`);
        }
    }
    validateSegmentValuesLimit(segment) {
        const { segmentValuesLimit } = this.config;
        const valuesCount = segment.constraints
            .flatMap((constraint) => constraint.values?.length ?? 0)
            .reduce((acc, length) => acc + length, 0);
        if (valuesCount > segmentValuesLimit) {
            throw new bad_data_error_1.default(`Segments may not have more than ${segmentValuesLimit} values`);
        }
    }
    async validateSegmentProject(id, segment) {
        const { strategies, changeRequestStrategies } = await this.getAllStrategies(id);
        const projectsUsed = new Set([strategies, changeRequestStrategies].flatMap((strats) => strats.map((strategy) => strategy.projectId)));
        if (segment.project &&
            (projectsUsed.size > 1 ||
                (projectsUsed.size === 1 && !projectsUsed.has(segment.project)))) {
            throw new bad_data_error_1.default(`Invalid project. Segment is being used by strategies in other projects: ${Array.from(projectsUsed).join(', ')}`);
        }
    }
    async stopWhenChangeRequestsEnabled(project, user) {
        if (!project)
            return;
        const canBypass = await this.changeRequestAccessReadModel.canBypassChangeRequestForProject(project, user);
        if (!canBypass) {
            throw new error_1.PermissionError(types_1.SKIP_CHANGE_REQUEST);
        }
    }
}
exports.SegmentService = SegmentService;
//# sourceMappingURL=segment-service.js.map