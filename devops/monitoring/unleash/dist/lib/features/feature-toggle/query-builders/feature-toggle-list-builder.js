"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureToggleListBuilder = void 0;
const feature_toggle_store_1 = __importDefault(require("../feature-toggle-store"));
class FeatureToggleListBuilder {
    constructor(db, selectColumns) {
        this.getSelectColumns = () => {
            return this.selectColumns;
        };
        this.query = (table) => {
            this.internalQuery = this.db(table);
            return this;
        };
        this.addSelectColumn = (column) => {
            this.selectColumns.push(column);
        };
        this.withArchived = (includeArchived) => {
            this.internalQuery.modify(feature_toggle_store_1.default.filterByArchived, includeArchived);
            return this;
        };
        this.withStrategies = (filter) => {
            this.internalQuery.leftJoin(this.db('feature_strategies')
                .select('*')
                .where({ environment: filter })
                .as('fs'), 'fs.feature_name', 'features.name');
            return this;
        };
        this.withFeatureEnvironments = (filter) => {
            this.internalQuery.leftJoin(this.db('feature_environments')
                .select('feature_name', 'enabled', 'environment', 'variants', 'last_seen_at')
                .where({ environment: filter })
                .as('fe'), 'fe.feature_name', 'features.name');
            return this;
        };
        this.withFeatureStrategySegments = () => {
            this.internalQuery.leftJoin('feature_strategy_segment as fss', `fss.feature_strategy_id`, `fs.id`);
            return this;
        };
        this.withSegments = () => {
            this.internalQuery.leftJoin('segments', `segments.id`, `fss.segment_id`);
            return this;
        };
        this.withDependentFeatureToggles = () => {
            this.internalQuery.leftJoin('dependent_features as df', 'df.child', 'features.name');
            return this;
        };
        this.withFeatureTags = () => {
            this.internalQuery.leftJoin('feature_tag as ft', 'ft.feature_name', 'features.name');
            return this;
        };
        this.withLastSeenByEnvironment = (archived = false) => {
            if (archived) {
                this.internalQuery.leftJoin('last_seen_at_metrics', function () {
                    this.on('last_seen_at_metrics.feature_name', '=', 'features.name').andOnNotNull('features.archived_at');
                });
            }
            else {
                this.internalQuery.leftJoin('last_seen_at_metrics', 'last_seen_at_metrics.feature_name', 'features.name');
            }
            return this;
        };
        this.withFavorites = (userId) => {
            this.internalQuery.leftJoin(`favorite_features`, function () {
                this.on('favorite_features.feature', 'features.name').andOnVal('favorite_features.user_id', '=', userId);
            });
            return this;
        };
        this.forProject = (project) => {
            this.internalQuery.whereIn('features.project', project);
        };
        this.db = db;
        this.selectColumns = selectColumns;
    }
}
exports.FeatureToggleListBuilder = FeatureToggleListBuilder;
//# sourceMappingURL=feature-toggle-list-builder.js.map