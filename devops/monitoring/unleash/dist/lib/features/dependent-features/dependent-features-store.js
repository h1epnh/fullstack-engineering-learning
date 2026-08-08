"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependentFeaturesStore = void 0;
class DependentFeaturesStore {
    constructor(db) {
        this.db = db;
    }
    async upsert(featureDependency) {
        const serializableFeatureDependency = {
            parent: featureDependency.parent,
            child: featureDependency.child,
            enabled: featureDependency.enabled,
        };
        if ('variants' in featureDependency) {
            serializableFeatureDependency.variants = JSON.stringify(featureDependency.variants);
        }
        // TODO: remove when we support multiple parents
        await this.db('dependent_features')
            .where('child', featureDependency.child)
            .del();
        await this.db('dependent_features')
            .insert(serializableFeatureDependency)
            .onConflict(['parent', 'child'])
            .merge();
    }
    async delete(dependency) {
        await this.db('dependent_features')
            .where('parent', dependency.parent)
            .andWhere('child', dependency.child)
            .del();
    }
    async deleteAll(features) {
        if (features) {
            await this.db('dependent_features')
                .whereIn('child', features)
                .del();
        }
        else {
            await this.db('dependent_features').del();
        }
    }
}
exports.DependentFeaturesStore = DependentFeaturesStore;
//# sourceMappingURL=dependent-features-store.js.map