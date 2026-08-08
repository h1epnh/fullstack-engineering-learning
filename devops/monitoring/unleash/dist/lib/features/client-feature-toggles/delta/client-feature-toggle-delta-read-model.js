"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../../util");
const internals_1 = require("../../../internals");
const metrics_helper_1 = __importDefault(require("../../../util/metrics-helper"));
const feature_toggle_store_1 = __importDefault(require("../../feature-toggle/feature-toggle-store"));
const sortStrategies_1 = require("../../../util/sortStrategies");
class ClientFeatureToggleDeltaReadModel {
    constructor(db, eventBus) {
        this.db = db;
        this.timer = (action) => metrics_helper_1.default.wrapTimer(eventBus, internals_1.DB_TIME, {
            store: 'client-feature-toggle-delta-read-model',
            action,
        });
    }
    async getAll(featureQuery) {
        const environment = featureQuery.environment;
        const stopTimer = this.timer(`getAll`);
        const selectColumns = [
            'features.name as name',
            'features.description as description',
            'features.type as type',
            'features.project as project',
            'features.stale as stale',
            'features.impression_data as impression_data',
            'features.created_at as created_at',
            'fe.variants as variants',
            'fe.enabled as enabled',
            'fe.environment as environment',
            'fs.id as strategy_id',
            'fs.strategy_name as strategy_name',
            'fs.title as strategy_title',
            'fs.disabled as strategy_disabled',
            'fs.parameters as parameters',
            'fs.constraints as constraints',
            'fs.sort_order as sort_order',
            'fs.milestone_id as milestone_id',
            'fs.variants as strategy_variants',
            'segments.id as segment_id',
            'segments.constraints as segment_constraints',
            'df.parent as parent',
            'df.variants as parent_variants',
            'df.enabled as parent_enabled',
        ];
        let query = this.db('features')
            .modify(feature_toggle_store_1.default.filterByArchived, false)
            .leftJoin(this.db('feature_strategies')
            .select('*')
            .where({ environment })
            .as('fs'), 'fs.feature_name', 'features.name')
            .leftJoin(this.db('feature_environments')
            .select('feature_name', 'enabled', 'environment', 'variants')
            .where({ environment })
            .as('fe'), 'fe.feature_name', 'features.name')
            .leftJoin('feature_strategy_segment as fss', `fss.feature_strategy_id`, `fs.id`)
            .leftJoin('segments', `segments.id`, `fss.segment_id`)
            .leftJoin('dependent_features as df', 'df.child', 'features.name');
        if (featureQuery?.toggleNames && featureQuery?.toggleNames.length > 0) {
            query = query.whereIn('features.name', featureQuery.toggleNames);
        }
        query = query.select(selectColumns);
        if (featureQuery) {
            if (featureQuery.tag) {
                const tagQuery = this.db
                    .from('feature_tag')
                    .select('feature_name')
                    .whereIn(['tag_type', 'tag_value'], featureQuery.tag);
                query = query.whereIn('features.name', tagQuery);
            }
            if (featureQuery.project &&
                !featureQuery.project.includes(util_1.ALL_PROJECTS)) {
                query = query.whereIn('project', featureQuery.project);
            }
            if (featureQuery.namePrefix) {
                query = query.where('features.name', 'like', `${featureQuery.namePrefix}%`);
            }
        }
        const rows = await query;
        stopTimer();
        const featureToggles = rows.reduce((acc, r) => {
            const feature = acc[r.name] ?? {
                strategies: [],
            };
            if (this.isUnseenStrategyRow(feature, r) && !r.strategy_disabled) {
                feature.strategies?.push(this.rowToStrategy(r));
            }
            if (featureQuery?.inlineSegmentConstraints && r.segment_id) {
                this.addSegmentToStrategy(feature, r);
            }
            else if (!featureQuery?.inlineSegmentConstraints &&
                r.segment_id) {
                this.addSegmentIdsToStrategy(feature, r);
            }
            if (r.parent) {
                feature.dependencies = feature.dependencies || [];
                feature.dependencies.push({
                    feature: r.parent,
                    enabled: r.parent_enabled,
                    ...(r.parent_enabled
                        ? { variants: r.parent_variants }
                        : {}),
                });
            }
            feature.impressionData = r.impression_data;
            feature.enabled = !!r.enabled;
            feature.name = r.name;
            feature.description = r.description;
            feature.project = r.project;
            feature.stale = r.stale;
            feature.type = r.type;
            feature.variants = r.variants || [];
            feature.project = r.project;
            acc[r.name] = feature;
            return acc;
        }, {});
        const features = Object.values(featureToggles);
        // strip away unwanted properties
        const cleanedFeatures = features.map(({ strategies, ...rest }) => ({
            ...rest,
            strategies: strategies
                ?.sort(sortStrategies_1.sortStrategies)
                .map(({ id, title, sortOrder, milestoneId, ...strategy }) => ({
                ...strategy,
            })),
        }));
        return cleanedFeatures;
    }
    addSegmentIdsToStrategy(feature, row) {
        const strategy = feature.strategies?.find((s) => s?.id === row.strategy_id);
        if (!strategy) {
            return;
        }
        if (!strategy.segments) {
            strategy.segments = [];
        }
        strategy.segments.push(row.segment_id);
    }
    rowToStrategy(row) {
        const strategy = {
            id: row.strategy_id,
            name: row.strategy_name,
            title: row.strategy_title,
            constraints: row.constraints || [],
            parameters: (0, util_1.mapValues)(row.parameters || {}, util_1.ensureStringValue),
            sortOrder: row.sort_order,
            milestoneId: row.milestone_id,
        };
        strategy.variants = row.strategy_variants || [];
        return strategy;
    }
    isUnseenStrategyRow(feature, row) {
        return (row.strategy_id &&
            !feature.strategies?.find((s) => s?.id === row.strategy_id));
    }
    addSegmentToStrategy(feature, row) {
        feature.strategies
            ?.find((s) => s?.id === row.strategy_id)
            ?.constraints?.push(...row.segment_constraints);
    }
}
exports.default = ClientFeatureToggleDeltaReadModel;
//# sourceMappingURL=client-feature-toggle-delta-read-model.js.map