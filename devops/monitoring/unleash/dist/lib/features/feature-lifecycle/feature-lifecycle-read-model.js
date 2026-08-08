"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureLifecycleReadModel = void 0;
const get_current_stage_1 = require("./get-current-stage");
const calculate_stage_durations_1 = require("./calculate-stage-durations");
class FeatureLifecycleReadModel {
    constructor(db, flagResolver) {
        this.db = db;
        this.flagResolver = flagResolver;
    }
    async getStageCount() {
        const { rows } = await this.db.raw(`
            SELECT
                stage,
                COUNT(*) AS feature_count
            FROM (
                SELECT DISTINCT ON (feature)
                    feature,
                    stage,
                    created_at
                FROM
                    feature_lifecycles
                ORDER BY
                    feature, created_at DESC
            ) AS LatestStages
            GROUP BY
                stage;
        `);
        return rows.map((row) => ({
            stage: row.stage,
            count: Number(row.feature_count),
        }));
    }
    async getStageCountByProject() {
        const { rows } = await this.db.raw(`
            SELECT
                f.project,
                ls.stage,
                COUNT(*) AS feature_count
            FROM (
                SELECT DISTINCT ON (fl.feature)
                    fl.feature,
                    fl.stage,
                    fl.created_at
                FROM
                    feature_lifecycles fl
                ORDER BY
                    fl.feature, fl.created_at DESC
            ) AS ls
            JOIN
                features f ON f.name = ls.feature
            GROUP BY
                f.project,
                ls.stage;
        `);
        return rows.map((row) => ({
            stage: row.stage,
            count: Number(row.feature_count),
            project: row.project,
        }));
    }
    async findCurrentStage(feature) {
        const results = await this.db('feature_lifecycles')
            .where({ feature })
            .orderBy('created_at', 'asc');
        const stages = results.map(({ stage, status, created_at }) => ({
            stage,
            ...(status ? { status } : {}),
            enteredStageAt: created_at,
        }));
        return (0, get_current_stage_1.getCurrentStage)(stages);
    }
    async getAll() {
        const results = await this.db('feature_lifecycles as flc')
            .select('flc.feature', 'flc.stage', 'flc.created_at', 'f.project')
            .leftJoin('features as f', 'f.name', 'flc.feature')
            .orderBy('created_at', 'asc');
        return results.map(({ feature, stage, created_at, project }) => ({
            feature,
            stage,
            project,
            enteredStageAt: new Date(created_at),
        }));
    }
    async getAllWithStageDuration() {
        const featureLifeCycles = await this.getAll();
        return (0, calculate_stage_durations_1.calculateStageDurations)(featureLifeCycles);
    }
}
exports.FeatureLifecycleReadModel = FeatureLifecycleReadModel;
//# sourceMappingURL=feature-lifecycle-read-model.js.map