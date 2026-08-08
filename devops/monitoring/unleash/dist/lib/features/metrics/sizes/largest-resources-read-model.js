"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LargestResourcesReadModel = void 0;
class LargestResourcesReadModel {
    constructor(db) {
        this.db = db;
    }
    async getLargestProjectEnvironments(limit) {
        const result = await this.db('feature_strategies')
            .select('project_name', 'environment')
            .sum({
            total_size: this.db.raw('pg_column_size(constraints) + pg_column_size(variants) + pg_column_size(parameters)'),
        })
            .groupBy('project_name', 'environment')
            .orderBy('total_size', 'desc')
            .limit(limit);
        return result.map((row) => ({
            project: row.project_name,
            environment: row.environment,
            size: Number(row.total_size),
        }));
    }
    async getLargestFeatureEnvironments(limit) {
        const result = await this.db('feature_strategies')
            .select('feature_name', 'environment')
            .sum({
            total_size: this.db.raw('pg_column_size(constraints) + pg_column_size(variants) + pg_column_size(parameters)'),
        })
            .groupBy('feature_name', 'environment')
            .orderBy('total_size', 'desc')
            .limit(limit);
        return result.map((row) => ({
            feature: row.feature_name,
            environment: row.environment,
            size: Number(row.total_size),
        }));
    }
}
exports.LargestResourcesReadModel = LargestResourcesReadModel;
//# sourceMappingURL=largest-resources-read-model.js.map