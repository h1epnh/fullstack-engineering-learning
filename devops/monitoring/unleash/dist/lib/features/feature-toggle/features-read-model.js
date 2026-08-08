"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeaturesReadModel = void 0;
class FeaturesReadModel {
    constructor(db) {
        this.db = db;
    }
    async featureExists(parent) {
        const rows = await this.db('features')
            .where('name', parent)
            .andWhere('archived_at', null)
            .select('name');
        return rows.length > 0;
    }
    async featuresInTheSameProject(featureA, featureB) {
        const rows = await this.db('features')
            .countDistinct('project as count')
            .whereIn('name', [featureA, featureB]);
        return Number(rows[0].count) === 1;
    }
}
exports.FeaturesReadModel = FeaturesReadModel;
//# sourceMappingURL=features-read-model.js.map