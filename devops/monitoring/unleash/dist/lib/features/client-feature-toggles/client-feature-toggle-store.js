"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const metrics_helper_1 = __importDefault(require("../../util/metrics-helper"));
const metric_events_1 = require("../../metric-events");
const util_1 = require("../../util");
const feature_toggle_store_1 = __importDefault(require("../feature-toggle/feature-toggle-store"));
const sortStrategies_1 = require("../../util/sortStrategies");
class FeatureToggleClientStore {
    constructor(db, eventBus, { getLogger, flagResolver, }) {
        this.db = db;
        this.logger = getLogger('feature-toggle-client-store.ts');
        this.timer = (action) => metrics_helper_1.default.wrapTimer(eventBus, metric_events_1.DB_TIME, {
            store: 'client-feature-toggle',
            action,
        });
        this.flagResolver = flagResolver;
    }
    async getAll({ featureQuery, archived, requestType, userId, }) {
        const isAdmin = requestType === 'admin';
        const isPlayground = requestType === 'playground';
        const environment = featureQuery?.environment || util_1.DEFAULT_ENV;
        const stopTimer = this.timer(`getAllBy${requestType}`);
        let selectColumns = [
            'features.name as name',
            'features.description as description',
            'features.type as type',
            'features.project as project',
            'features.stale as stale',
            'features.impression_data as impression_data',
            'features.last_seen_at as last_seen_at',
            'features.created_at as created_at',
            'fe.variants as variants',
            'fe.last_seen_at as env_last_seen_at',
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
            .modify(feature_toggle_store_1.default.filterByArchived, archived)
            .leftJoin(this.db('feature_strategies')
            .select('*')
            .where({ environment })
            .as('fs'), 'fs.feature_name', 'features.name')
            .leftJoin(this.db('feature_environments')
            .select('feature_name', 'enabled', 'environment', 'variants', 'last_seen_at')
            .where({ environment })
            .as('fe'), 'fe.feature_name', 'features.name')
            .leftJoin('feature_strategy_segment as fss', `fss.feature_strategy_id`, `fs.id`)
            .leftJoin('segments', `segments.id`, `fss.segment_id`)
            .leftJoin('dependent_features as df', 'df.child', 'features.name');
        if (isAdmin) {
            query = query.leftJoin('feature_tag as ft', 'ft.feature_name', 'features.name');
            selectColumns = [
                ...selectColumns,
                'ft.tag_value as tag_value',
                'ft.tag_type as tag_type',
            ];
            if (userId) {
                query = query.leftJoin(`favorite_features`, function () {
                    this.on('favorite_features.feature', 'features.name').andOnVal('favorite_features.user_id', '=', userId);
                });
                selectColumns = [
                    ...selectColumns,
                    this.db.raw('favorite_features.feature is not null as favorite'),
                ];
            }
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
            if (this.isNewTag(feature, r)) {
                this.addTag(feature, r);
            }
            if (featureQuery?.inlineSegmentConstraints && r.segment_id) {
                this.addSegmentToStrategy(feature, r);
            }
            else if (!featureQuery?.inlineSegmentConstraints &&
                r.segment_id) {
                this.addSegmentIdsToStrategy(feature, r);
            }
            if (r.parent && !isAdmin) {
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
            feature.lastSeenAt = r.last_seen_at;
            feature.variants = r.variants || [];
            feature.project = r.project;
            if (isAdmin) {
                feature.favorite = r.favorite;
                feature.lastSeenAt = r.last_seen_at;
                feature.createdAt = r.created_at;
            }
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
                ...(isPlayground && title ? { title } : {}),
                // We should not send strategy IDs from the client API,
                // as this breaks old versions of the Go SDK (at least).
                ...(isAdmin || isPlayground ? { id } : {}),
            })),
        }));
        return cleanedFeatures;
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
    static rowToTag(row) {
        return {
            value: row.tag_value,
            type: row.tag_type,
        };
    }
    isUnseenStrategyRow(feature, row) {
        return (row.strategy_id &&
            !feature.strategies?.find((s) => s?.id === row.strategy_id));
    }
    addTag(feature, row) {
        const tags = feature.tags || [];
        const newTag = FeatureToggleClientStore.rowToTag(row);
        feature.tags = [...tags, newTag];
    }
    isNewTag(feature, row) {
        return (row.tag_type &&
            row.tag_value &&
            !feature.tags?.some((tag) => tag?.type === row.tag_type && tag?.value === row.tag_value));
    }
    addSegmentToStrategy(feature, row) {
        feature.strategies
            ?.find((s) => s?.id === row.strategy_id)
            ?.constraints?.push(...row.segment_constraints);
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
    async getClient(featureQuery) {
        return this.getAll({
            featureQuery,
            archived: false,
            requestType: 'client',
        });
    }
    async getFrontendApiClient(featureQuery) {
        return this.getAll({
            featureQuery,
            archived: false,
            requestType: 'frontend',
        });
    }
    async getPlayground(featureQuery) {
        return this.getAll({
            featureQuery,
            archived: false,
            requestType: 'playground',
        });
    }
}
exports.default = FeatureToggleClientStore;
module.exports = FeatureToggleClientStore;
//# sourceMappingURL=client-feature-toggle-store.js.map