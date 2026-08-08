"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notfound_error_1 = __importDefault(require("../../error/notfound-error"));
const util_1 = require("../../util");
const T = {
    segments: 'segments',
    featureStrategies: 'feature_strategies',
    features: 'features',
    featureStrategySegment: 'feature_strategy_segment',
};
const COLUMNS = [
    'id',
    'name',
    'description',
    'segment_project_id',
    'created_by',
    'created_at',
    'constraints',
];
class SegmentStore {
    constructor(db, eventBus, getLogger, flagResolver) {
        this.combineUsageData = (pendingCRs, crFeatures) => {
            const changeRequestToProjectMap = pendingCRs.reduce((acc, { id, project }) => {
                acc[id] = project;
                return acc;
            }, {});
            const combinedUsageData = crFeatures.reduce((acc, segmentEvent) => {
                const { payload, changeRequestId, feature } = segmentEvent;
                const project = changeRequestToProjectMap[changeRequestId];
                for (const segmentId of payload.segments) {
                    const existingData = acc[segmentId];
                    if (existingData) {
                        acc[segmentId] = {
                            features: existingData.features.add(feature),
                            projects: existingData.projects.add(project),
                        };
                    }
                    else {
                        acc[segmentId] = {
                            features: new Set([feature]),
                            projects: new Set([project]),
                        };
                    }
                }
                return acc;
            }, {});
            return combinedUsageData;
        };
        this.db = db;
        this.eventBus = eventBus;
        this.flagResolver = flagResolver;
        this.logger = getLogger('lib/db/segment-store.ts');
    }
    async count() {
        return this.db
            .from(T.segments)
            .count('*')
            .then((res) => Number(res[0].count));
    }
    async create(segment, user) {
        const rows = await this.db(T.segments)
            .insert({
            id: segment.id,
            name: segment.name,
            description: segment.description,
            segment_project_id: segment.project || null,
            constraints: JSON.stringify(segment.constraints),
            created_by: user.username,
        })
            .returning(COLUMNS);
        return this.mapRow(rows[0]);
    }
    async update(id, segment) {
        const rows = await this.db(T.segments)
            .where({ id })
            .update({
            name: segment.name,
            description: segment.description,
            segment_project_id: segment.project || null,
            constraints: JSON.stringify(segment.constraints),
        })
            .returning(COLUMNS);
        return this.mapRow(rows[0]);
    }
    delete(id) {
        return this.db(T.segments).where({ id }).del();
    }
    async getAll(includeChangeRequestUsageData = false) {
        if (includeChangeRequestUsageData) {
            return this.getAllWithChangeRequestUsageData();
        }
        else {
            return this.getAllWithoutChangeRequestUsageData();
        }
    }
    async getAllWithoutChangeRequestUsageData() {
        const rows = await this.db
            .select([
            ...this.prefixColumns(),
            this.db.raw(`count(distinct case when ${T.features}.archived_at is null then ${T.featureStrategies}.project_name end) as used_in_projects`),
            this.db.raw(`count(distinct case when ${T.features}.archived_at is null then ${T.featureStrategies}.feature_name end) as used_in_features`),
        ])
            .from(T.segments)
            .leftJoin(T.featureStrategySegment, `${T.segments}.id`, `${T.featureStrategySegment}.segment_id`)
            .leftJoin(T.featureStrategies, `${T.featureStrategies}.id`, `${T.featureStrategySegment}.feature_strategy_id`)
            .leftJoin(T.features, `${T.featureStrategies}.feature_name`, `${T.features}.name`)
            .groupBy(this.prefixColumns())
            .orderBy('name', 'asc');
        return rows.map(this.mapRow);
    }
    async getAllWithChangeRequestUsageData() {
        const pendingCRs = await this.db
            .select('id', 'project')
            .from('change_requests')
            .whereNotIn('state', ['Applied', 'Rejected', 'Cancelled']);
        const pendingChangeRequestIds = pendingCRs.map((cr) => cr.id);
        const crFeatures = await this.db
            .select('payload', 'feature', 'change_request_id as changeRequestId')
            .from('change_request_events')
            .whereIn('change_request_id', pendingChangeRequestIds)
            .whereIn('action', ['addStrategy', 'updateStrategy'])
            .andWhereRaw("jsonb_array_length(payload -> 'segments') > 0");
        const combinedUsageData = this.combineUsageData(pendingCRs, crFeatures);
        const currentSegmentUsage = await this.db
            .select(`${T.featureStrategies}.feature_name as featureName`, `${T.featureStrategies}.project_name as projectName`, 'segment_id as segmentId')
            .from(T.featureStrategySegment)
            .leftJoin(T.featureStrategies, `${T.featureStrategies}.id`, `${T.featureStrategySegment}.feature_strategy_id`)
            .leftJoin(T.features, `${T.featureStrategies}.feature_name`, `${T.features}.name`)
            .where(`${T.features}.archived_at`, null);
        this.mergeCurrentUsageWithCombinedData(combinedUsageData, currentSegmentUsage);
        const rows = await this.db
            .select(this.prefixColumns())
            .from(T.segments)
            .leftJoin(T.featureStrategySegment, `${T.segments}.id`, `${T.featureStrategySegment}.segment_id`)
            .groupBy(this.prefixColumns())
            .orderBy('name', 'asc');
        const rowsWithUsageData = this.mapRowsWithUsageData(rows, combinedUsageData);
        return rowsWithUsageData.map(this.mapRow);
    }
    mapRowsWithUsageData(rows, combinedUsageData) {
        return rows.map((row) => {
            const usageData = combinedUsageData[row.id];
            if (usageData) {
                return {
                    ...row,
                    used_in_features: usageData.features.size,
                    used_in_projects: usageData.projects.size,
                };
            }
            else {
                return {
                    ...row,
                    used_in_features: 0,
                    used_in_projects: 0,
                };
            }
        });
    }
    mergeCurrentUsageWithCombinedData(combinedUsageData, currentSegmentUsage) {
        currentSegmentUsage.forEach(({ segmentId, featureName, projectName }) => {
            const usage = combinedUsageData[segmentId];
            if (usage) {
                usage.features.add(featureName);
                usage.projects.add(projectName);
            }
            else {
                combinedUsageData[segmentId] = {
                    features: new Set([featureName]),
                    projects: new Set([projectName]),
                };
            }
        });
    }
    async getByStrategy(strategyId) {
        const rows = await this.db
            .select(this.prefixColumns())
            .from(T.segments)
            .join(T.featureStrategySegment, `${T.featureStrategySegment}.segment_id`, `${T.segments}.id`)
            .where(`${T.featureStrategySegment}.feature_strategy_id`, '=', strategyId);
        return rows.map(this.mapRow);
    }
    deleteAll() {
        return this.db(T.segments).del();
    }
    async exists(id) {
        const result = await this.db.raw(`SELECT EXISTS(SELECT 1 FROM ${T.segments} WHERE id = ?) AS present`, [id]);
        return result.rows[0].present;
    }
    async get(id) {
        const rows = await this.db
            .select(this.prefixColumns())
            .from(T.segments)
            .where({ id });
        const row = rows[0];
        if (!row) {
            throw new notfound_error_1.default(`No segment exists with ID "${id}"`);
        }
        return this.mapRow(row);
    }
    async addToStrategy(id, strategyId) {
        await this.db(T.featureStrategySegment).insert({
            segment_id: id,
            feature_strategy_id: strategyId,
        });
    }
    async removeFromStrategy(id, strategyId) {
        await this.db(T.featureStrategySegment)
            .where({ segment_id: id, feature_strategy_id: strategyId })
            .del();
    }
    async getAllFeatureStrategySegments() {
        const rows = await this.db
            .select(['segment_id', 'feature_strategy_id'])
            .from(T.featureStrategySegment);
        return rows.map((row) => ({
            featureStrategyId: row.feature_strategy_id,
            segmentId: row.segment_id,
        }));
    }
    async existsByName(name) {
        const rows = await this.db
            .select(this.prefixColumns())
            .from(T.segments)
            .where({ name });
        return Boolean(rows[0]);
    }
    async getProjectSegmentCount(projectId) {
        const result = await this.db.raw(`SELECT COUNT(*) FROM ${T.segments} WHERE segment_project_id = ?`, [projectId]);
        return Number(result.rows[0].count);
    }
    prefixColumns() {
        return COLUMNS.map((c) => `${T.segments}.${c}`);
    }
    mapRow(row) {
        if (!row) {
            throw new notfound_error_1.default('No row');
        }
        return {
            id: row.id,
            name: row.name,
            description: row.description,
            project: row.segment_project_id || undefined,
            constraints: row.constraints,
            createdBy: row.created_by,
            createdAt: row.created_at,
            ...((0, util_1.isDefined)(row.used_in_projects) && {
                usedInProjects: Number(row.used_in_projects),
            }),
            ...((0, util_1.isDefined)(row.used_in_features) && {
                usedInFeatures: Number(row.used_in_features),
            }),
        };
    }
    destroy() { }
}
exports.default = SegmentStore;
//# sourceMappingURL=segment-store.js.map