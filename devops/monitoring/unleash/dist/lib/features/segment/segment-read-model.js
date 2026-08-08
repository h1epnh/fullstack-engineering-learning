"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SegmentReadModel = void 0;
const notfound_error_1 = __importDefault(require("../../error/notfound-error"));
const COLUMNS = [
    'id',
    'name',
    'description',
    'segment_project_id',
    'created_by',
    'created_at',
    'constraints',
];
class SegmentReadModel {
    constructor(db) {
        this.db = db;
    }
    prefixColumns() {
        return COLUMNS.map((c) => `segments.${c}`);
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
        };
    }
    async getAll(ids) {
        let query = this.db
            .select(this.prefixColumns())
            .from('segments')
            .orderBy('segments.name', 'asc');
        if (ids && ids.length > 0) {
            query = query.whereIn('id', ids);
        }
        const rows = await query;
        return rows.map(this.mapRow);
    }
    async getAllFeatureStrategySegments() {
        const rows = await this.db
            .select(['segment_id', 'feature_strategy_id'])
            .from('feature_strategy_segment');
        return rows.map((row) => ({
            featureStrategyId: row.feature_strategy_id,
            segmentId: row.segment_id,
        }));
    }
    async getActive() {
        const query = this.db
            .distinct(this.prefixColumns())
            .from('segments')
            .orderBy('name', 'asc')
            .join('feature_strategy_segment', 'feature_strategy_segment.segment_id', 'segments.id');
        const rows = await query;
        return rows.map(this.mapRow);
    }
    async getActiveForClient() {
        const fullSegments = await this.getActive();
        return fullSegments.map((segments) => ({
            id: segments.id,
            name: segments.name,
            constraints: segments.constraints,
        }));
    }
    async getAllForClientIds(ids) {
        if (ids?.length === 0) {
            return [];
        }
        const fullSegments = await this.getAll(ids);
        return fullSegments.map((segments) => ({
            id: segments.id,
            name: segments.name,
            constraints: segments.constraints,
        }));
    }
}
exports.SegmentReadModel = SegmentReadModel;
//# sourceMappingURL=segment-read-model.js.map