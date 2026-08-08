"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const metrics_helper_1 = __importDefault(require("../../util/metrics-helper"));
const metric_events_1 = require("../../metric-events");
const notfound_error_1 = __importDefault(require("../../error/notfound-error"));
const feature_toggle_store_1 = __importDefault(require("./feature-toggle-store"));
const util_1 = require("../../util");
const date_fns_1 = require("date-fns");
const deepmerge_1 = __importDefault(require("deepmerge"));
const COLUMNS = [
    'id',
    'feature_name',
    'project_name',
    'environment',
    'strategy_name',
    'title',
    'parameters',
    'constraints',
    'variants',
    'created_at',
    'disabled',
];
const T = {
    features: 'features',
    featureStrategies: 'feature_strategies',
    featureStrategySegment: 'feature_strategy_segment',
    featureEnvs: 'feature_environments',
    strategies: 'strategies',
    projectSettings: 'project_settings',
};
function mapRow(row) {
    return {
        id: row.id,
        featureName: row.feature_name,
        projectId: row.project_name,
        environment: row.environment,
        strategyName: row.strategy_name,
        title: row.title,
        parameters: (0, util_1.mapValues)(row.parameters || {}, util_1.ensureStringValue),
        constraints: row.constraints || [],
        variants: row.variants || [],
        createdAt: row.created_at,
        sortOrder: row.sort_order,
        milestoneId: row.milestone_id,
        disabled: row.disabled,
    };
}
function mapInput(input) {
    return {
        id: input.id,
        feature_name: input.featureName,
        project_name: input.projectId,
        environment: input.environment,
        strategy_name: input.strategyName,
        title: input.title,
        parameters: input.parameters,
        constraints: JSON.stringify(input.constraints || []),
        variants: JSON.stringify(input.variants || []),
        created_at: input.createdAt,
        sort_order: input.sortOrder ?? 9999,
        disabled: input.disabled,
    };
}
const sortEnvironments = (overview) => {
    return Object.values(overview).map((data) => ({
        ...data,
        environments: data.environments
            .filter((f) => f.name)
            .sort((a, b) => {
            if (a.sortOrder === b.sortOrder) {
                return a.name.localeCompare(b.name);
            }
            return a.sortOrder - b.sortOrder;
        }),
    }));
};
function mapStrategyUpdate(input) {
    const update = {};
    if (input.name !== null) {
        update.strategy_name = input.name;
    }
    if (input.parameters !== null) {
        update.parameters = input.parameters;
    }
    if (input.title !== null) {
        update.title = input.title;
    }
    if (input.disabled !== null) {
        update.disabled = input.disabled;
    }
    update.constraints = JSON.stringify(input.constraints || []);
    update.variants = JSON.stringify(input.variants || []);
    return update;
}
function mergeAll(objects) {
    return deepmerge_1.default.all(objects.filter((i) => i));
}
const defaultParameters = (params, stickiness) => {
    if (params.strategyName === 'flexibleRollout') {
        return {
            rollout: '100',
            stickiness,
            groupId: params.featureName,
        };
    }
    else {
        /// We don't really have good defaults for the other kinds of known strategies, so return an empty map.
        return {};
    }
};
const parametersWithDefaults = (params, stickiness) => {
    return mergeAll([defaultParameters(params, stickiness), params.parameters]);
};
class FeatureStrategiesStore {
    constructor(db, eventBus, getLogger, flagResolver) {
        this.db = db;
        this.logger = getLogger('feature-toggle-strategies-store.ts');
        this.timer = (action) => metrics_helper_1.default.wrapTimer(eventBus, metric_events_1.DB_TIME, {
            store: 'feature-toggle-strategies',
            action,
        });
        this.flagResolver = flagResolver;
    }
    async delete(key) {
        await this.db(T.featureStrategies).where({ id: key }).del();
    }
    async deleteAll() {
        await this.db(T.featureStrategies).delete();
    }
    destroy() { }
    async exists(key) {
        const result = await this.db.raw(`SELECT EXISTS(SELECT 1 FROM ${T.featureStrategies} WHERE id = ?) AS present`, [key]);
        const { present } = result.rows[0];
        return present;
    }
    async get(key) {
        const row = await this.db(T.featureStrategies)
            .where({ id: key })
            .first();
        if (!row) {
            throw new notfound_error_1.default(`Could not find strategy with id=${key}`);
        }
        return mapRow(row);
    }
    async nextSortOrder(featureName, environment) {
        const [{ max }] = await this.db(T.featureStrategies)
            .max('sort_order as max')
            .where({
            feature_name: featureName,
            environment,
        });
        return Number.isInteger(max) ? max + 1 : 0;
    }
    async getDefaultStickiness(projectName) {
        const defaultFromDb = await this.db(T.projectSettings)
            .select('default_stickiness')
            .where('project', projectName)
            .first();
        return defaultFromDb?.default_stickiness || 'default';
    }
    async createStrategyFeatureEnv(strategyConfig) {
        const sortOrder = strategyConfig.sortOrder ??
            (await this.nextSortOrder(strategyConfig.featureName, strategyConfig.environment));
        const stickiness = await this.getDefaultStickiness(strategyConfig.projectId);
        strategyConfig.parameters = parametersWithDefaults(strategyConfig, stickiness);
        const strategyRow = mapInput({
            id: (0, uuid_1.v4)(),
            ...strategyConfig,
            sortOrder,
        });
        const rows = await this.db(T.featureStrategies)
            .insert(strategyRow)
            .returning('*');
        return mapRow(rows[0]);
    }
    async removeAllStrategiesForFeatureEnv(featureName, environment) {
        await this.db('feature_strategies')
            .where({
            feature_name: featureName,
            environment,
        })
            .del();
    }
    async getAll() {
        const stopTimer = this.timer('getAll');
        const rows = await this.db
            .select(COLUMNS)
            .from(T.featureStrategies);
        stopTimer();
        return rows.map(mapRow);
    }
    async getAllByFeatures(features, environment) {
        const query = this.db
            .select(COLUMNS)
            .from(T.featureStrategies)
            .whereIn('feature_name', features)
            .orderBy('feature_name', 'asc');
        if (environment) {
            query.where('environment', environment);
        }
        const rows = await query;
        return rows.map(mapRow);
    }
    async getStrategiesForFeatureEnv(projectId, featureName, environment) {
        const stopTimer = this.timer('getForFeature');
        const rows = await this.db(T.featureStrategies)
            .where({
            project_name: projectId,
            feature_name: featureName,
            environment,
        })
            .orderByRaw('CASE WHEN milestone_id IS NOT NULL THEN 0 ELSE 1 END ASC')
            .orderBy([
            {
                column: 'sort_order',
                order: 'asc',
            },
            {
                column: 'created_at',
                order: 'asc',
            },
        ]);
        stopTimer();
        return rows.map(mapRow);
    }
    async getFeatureToggleWithEnvs(featureName, userId, archived = false) {
        return this.loadFeatureToggleWithEnvs({
            featureName,
            archived,
            withEnvironmentVariants: false,
            userId,
        });
    }
    async getFeatureToggleWithVariantEnvs(featureName, userId, archived = false) {
        return this.loadFeatureToggleWithEnvs({
            featureName,
            archived,
            withEnvironmentVariants: true,
            userId,
        });
    }
    async loadFeatureToggleWithEnvs({ featureName, archived, withEnvironmentVariants, userId, }) {
        const stopTimer = this.timer('getFeatureAdmin');
        const query = this.db.with('metrics', (queryBuilder) => {
            queryBuilder
                .sum('yes as yes')
                .sum('no as no')
                .select(['client_metrics_env.environment'])
                .from('client_metrics_env')
                .where('client_metrics_env.timestamp', '>=', this.db.raw("NOW() - INTERVAL '1 hour'"))
                .andWhere('client_metrics_env.feature_name', featureName)
                .groupBy(['client_metrics_env.environment']);
        });
        query
            .from('features_view')
            .where('name', featureName)
            .modify(feature_toggle_store_1.default.filterByArchived, archived);
        let selectColumns = ['features_view.*', 'yes', 'no'];
        // add metrics
        query.leftJoin('metrics', 'metrics.environment', 'features_view.environment');
        query.leftJoin('last_seen_at_metrics', function () {
            this.on('last_seen_at_metrics.environment', '=', 'features_view.environment_name').andOn('last_seen_at_metrics.feature_name', '=', 'features_view.name');
        });
        // Override feature view for now
        selectColumns.push('last_seen_at_metrics.last_seen_at as env_last_seen_at');
        if (userId) {
            query.leftJoin(`favorite_features`, function () {
                this.on('favorite_features.feature', 'features_view.name').andOnVal('favorite_features.user_id', '=', userId);
            });
            selectColumns = [
                ...selectColumns,
                this.db.raw('favorite_features.feature is not null as favorite'),
            ];
        }
        const rows = await query.select(selectColumns);
        stopTimer();
        if (rows.length > 0) {
            const featureToggle = rows.reduce((acc, r) => {
                if (acc.environments === undefined) {
                    acc.environments = {};
                }
                acc.name = r.name;
                acc.favorite = r.favorite;
                acc.impressionData = r.impression_data;
                acc.description = r.description;
                acc.project = r.project;
                acc.stale = r.stale;
                acc.createdAt = r.created_at;
                if (r.user_id) {
                    const name = r.user_name ||
                        r.user_username ||
                        r.user_email ||
                        'unknown';
                    acc.createdBy = {
                        id: r.user_id,
                        name,
                        imageUrl: (0, util_1.generateImageUrl)({
                            id: r.user_id,
                            email: r.user_email,
                            username: name,
                        }),
                    };
                }
                acc.type = r.type;
                if (!acc.environments[r.environment]) {
                    acc.environments[r.environment] = {
                        name: r.environment,
                        lastSeenAt: r.env_last_seen_at,
                    };
                }
                if (acc.lastSeenAt == null ||
                    (0, date_fns_1.isAfter)(new Date(r.env_last_seen_at), new Date(acc.lastSeenAt))) {
                    acc.lastSeenAt = r.env_last_seen_at;
                }
                const env = acc.environments[r.environment];
                const variants = r.variants || [];
                variants.sort((a, b) => a.name.localeCompare(b.name));
                if (withEnvironmentVariants) {
                    env.variants = variants;
                }
                // this code sets variants at the feature level (should be deprecated with variants per environment)
                const currentVariants = new Map(acc.variants?.map((v) => [v.name, v]));
                variants.forEach((variant) => {
                    currentVariants.set(variant.name, variant);
                });
                acc.variants = Array.from(currentVariants.values());
                env.enabled = r.enabled;
                env.yes = Number(r.yes) || 0;
                env.no = Number(r.no) || 0;
                env.type = r.environment_type;
                env.sortOrder = r.environment_sort_order;
                if (!env.strategies) {
                    env.strategies = [];
                }
                if (r.strategy_id) {
                    const found = env.strategies.find((strategy) => strategy.id === r.strategy_id);
                    if (!found) {
                        env.strategies.push(FeatureStrategiesStore.getAdminStrategy(r));
                    }
                }
                if (r.segments) {
                    this.addSegmentIdsToStrategy(env, r);
                }
                acc.environments[r.environment] = env;
                return acc;
            }, {});
            featureToggle.environments = Object.values(featureToggle.environments).sort((a, b) => {
                // @ts-expect-error
                return a.sortOrder - b.sortOrder;
            });
            featureToggle.environments = featureToggle.environments.map((e) => {
                e.strategies = e.strategies.sort((a, b) => a.sortOrder - b.sortOrder);
                return e;
            });
            featureToggle.archived = archived;
            return featureToggle;
        }
        throw new notfound_error_1.default(`Could not find feature flag with name ${featureName}`);
    }
    addSegmentIdsToStrategy(featureToggle, row) {
        const strategy = featureToggle.strategies?.find((s) => s?.id === row.strategy_id);
        if (!strategy) {
            return;
        }
        if (!strategy.segments) {
            strategy.segments = [];
        }
        strategy.segments.push(row.segments);
    }
    static getEnvironment(r) {
        return {
            name: r.environment,
            enabled: r.enabled,
            type: r.environment_type,
            sortOrder: r.environment_sort_order,
            variantCount: r.variants?.length || 0,
            lastSeenAt: r.env_last_seen_at,
            hasStrategies: r.has_strategies,
            hasEnabledStrategies: r.has_enabled_strategies,
        };
    }
    addTag(featureToggle, row) {
        const tags = featureToggle.tags || [];
        const newTag = FeatureStrategiesStore.rowToTag(row);
        featureToggle.tags = [...tags, newTag];
    }
    isNewTag(featureToggle, row) {
        return (row.tag_type &&
            row.tag_value &&
            !featureToggle.tags?.some((tag) => tag.type === row.tag_type && tag.value === row.tag_value));
    }
    static rowToTag(r) {
        return {
            value: r.tag_value,
            type: r.tag_type,
        };
    }
    async getFeatureOverview({ projectId, archived, userId, tag, namePrefix, }) {
        const stopTimer = this.timer('getFeatureOverview');
        let query = this.db('features').where({ project: projectId });
        if (tag) {
            const tagQuery = this.db
                .from('feature_tag')
                .select('feature_name')
                .whereIn(['tag_type', 'tag_value'], tag);
            query = query.whereIn('features.name', tagQuery);
        }
        if (namePrefix?.trim()) {
            let namePrefixQuery = namePrefix;
            if (!namePrefix.endsWith('%')) {
                namePrefixQuery = `${namePrefixQuery}%`;
            }
            query = query.whereILike('features.name', namePrefixQuery);
        }
        query = query
            .modify(feature_toggle_store_1.default.filterByArchived, archived)
            .leftJoin('feature_environments', 'feature_environments.feature_name', 'features.name')
            .leftJoin('environments', 'feature_environments.environment', 'environments.name')
            .leftJoin('feature_tag as ft', 'ft.feature_name', 'features.name');
        query.leftJoin('last_seen_at_metrics', function () {
            this.on('last_seen_at_metrics.environment', '=', 'environments.name').andOn('last_seen_at_metrics.feature_name', '=', 'features.name');
        });
        let selectColumns = [
            'features.name as feature_name',
            'features.description as description',
            'features.type as type',
            'features.created_at as created_at',
            'features.stale as stale',
            'features.last_seen_at as last_seen_at',
            'features.impression_data as impression_data',
            'feature_environments.enabled as enabled',
            'feature_environments.environment as environment',
            'feature_environments.variants as variants',
            'environments.type as environment_type',
            'environments.sort_order as environment_sort_order',
            'ft.tag_value as tag_value',
            'ft.tag_type as tag_type',
        ];
        selectColumns.push('last_seen_at_metrics.last_seen_at as env_last_seen_at');
        if (userId) {
            query = query.leftJoin(`favorite_features`, function () {
                this.on('favorite_features.feature', 'features.name').andOnVal('favorite_features.user_id', '=', userId);
            });
            selectColumns = [
                ...selectColumns,
                this.db.raw('favorite_features.feature is not null as favorite'),
            ];
        }
        selectColumns = [
            ...selectColumns,
            this.db.raw('EXISTS (SELECT 1 FROM feature_strategies WHERE feature_strategies.feature_name = features.name AND feature_strategies.environment = feature_environments.environment) as has_strategies'),
            this.db.raw('EXISTS (SELECT 1 FROM feature_strategies WHERE feature_strategies.feature_name = features.name AND feature_strategies.environment = feature_environments.environment AND (feature_strategies.disabled IS NULL OR feature_strategies.disabled = false)) as has_enabled_strategies'),
        ];
        query = query.select(selectColumns);
        const rows = await query;
        stopTimer();
        if (rows.length > 0) {
            const overview = this.getFeatureOverviewData(rows);
            return sortEnvironments(overview);
        }
        return [];
    }
    getAggregatedSearchData(rows) {
        return rows.reduce((acc, row) => {
            if (acc[row.feature_name]) {
                const environmentExists = acc[row.feature_name].environments.some((existingEnvironment) => existingEnvironment.name === row.environment);
                if (!environmentExists) {
                    acc[row.feature_name].environments.push(FeatureStrategiesStore.getEnvironment(row));
                }
                const segmentExists = acc[row.feature_name].segments.includes(row.segment_name);
                if (row.segment_name && !segmentExists) {
                    acc[row.feature_name].segments.push(row.segment_name);
                }
                if (this.isNewTag(acc[row.feature_name], row)) {
                    this.addTag(acc[row.feature_name], row);
                }
            }
            else {
                acc[row.feature_name] = {
                    type: row.type,
                    description: row.description,
                    project: row.project,
                    favorite: row.favorite,
                    name: row.feature_name,
                    createdAt: row.created_at,
                    stale: row.stale,
                    impressionData: row.impression_data,
                    lastSeenAt: row.last_seen_at,
                    environments: [FeatureStrategiesStore.getEnvironment(row)],
                    segments: row.segment_name ? [row.segment_name] : [],
                };
                if (this.isNewTag(acc[row.feature_name], row)) {
                    this.addTag(acc[row.feature_name], row);
                }
            }
            const featureRow = acc[row.feature_name];
            if ((0, date_fns_1.isAfter)(new Date(row.env_last_seen_at), new Date(featureRow.lastSeenAt))) {
                featureRow.lastSeenAt = row.env_last_seen_at;
            }
            return acc;
        }, {});
    }
    getFeatureOverviewData(rows) {
        return rows.reduce((acc, row) => {
            if (acc[row.feature_name]) {
                const environmentExists = acc[row.feature_name].environments.some((existingEnvironment) => existingEnvironment.name === row.environment);
                if (!environmentExists) {
                    acc[row.feature_name].environments.push(FeatureStrategiesStore.getEnvironment(row));
                }
                if (this.isNewTag(acc[row.feature_name], row)) {
                    this.addTag(acc[row.feature_name], row);
                }
            }
            else {
                acc[row.feature_name] = {
                    type: row.type,
                    description: row.description,
                    favorite: row.favorite,
                    name: row.feature_name,
                    createdAt: row.created_at,
                    stale: row.stale,
                    impressionData: row.impression_data,
                    lastSeenAt: row.last_seen_at,
                    environments: [FeatureStrategiesStore.getEnvironment(row)],
                };
                if (this.isNewTag(acc[row.feature_name], row)) {
                    this.addTag(acc[row.feature_name], row);
                }
            }
            const featureRow = acc[row.feature_name];
            if ((0, date_fns_1.isAfter)(new Date(row.env_last_seen_at), new Date(featureRow.lastSeenAt))) {
                featureRow.lastSeenAt = row.env_last_seen_at;
            }
            return acc;
        }, {});
    }
    async getStrategyById(id) {
        const strat = await this.db(T.featureStrategies).where({ id }).first();
        if (strat) {
            return mapRow(strat);
        }
        throw new notfound_error_1.default(`Could not find strategy with id: ${id}`);
    }
    async updateSortOrder(id, sortOrder) {
        await this.db(T.featureStrategies)
            .where({ id })
            .update({ sort_order: sortOrder });
    }
    async updateStrategy(id, updates) {
        const update = mapStrategyUpdate(updates);
        const row = await this.db(T.featureStrategies)
            .where({ id })
            .update(update)
            .returning('*');
        return mapRow(row[0]);
    }
    static getAdminStrategy(r, includeId = true) {
        const strategy = {
            name: r.strategy_name,
            constraints: r.constraints || [],
            variants: r.strategy_variants || [],
            parameters: r.parameters,
            segments: [],
            sortOrder: r.sort_order,
            id: r.strategy_id,
            title: r.strategy_title,
            disabled: r.strategy_disabled || false,
        };
        if (!includeId) {
            delete strategy.id;
        }
        return strategy;
    }
    async deleteConfigurationsForProjectAndEnvironment(projectId, environment) {
        await this.db(T.featureStrategies)
            .where({
            project_name: projectId,
            environment,
        })
            .del();
    }
    async setProjectForStrategiesBelongingToFeature(featureName, newProjectId) {
        await this.db(T.featureStrategies)
            .where({ feature_name: featureName })
            .update({ project_name: newProjectId });
    }
    async getStrategiesBySegment(segmentId) {
        const stopTimer = this.timer('getStrategiesBySegment');
        const rows = await this.db
            .select(this.prefixColumns())
            .from(T.featureStrategies)
            .join(T.featureStrategySegment, `${T.featureStrategySegment}.feature_strategy_id`, `${T.featureStrategies}.id`)
            .join(T.features, `${T.features}.name`, `${T.featureStrategies}.feature_name`)
            .where(`${T.featureStrategySegment}.segment_id`, '=', segmentId)
            .andWhere(`${T.features}.archived_at`, 'IS', null);
        stopTimer();
        return rows.map(mapRow);
    }
    async getStrategiesByContextField(contextFieldName) {
        const stopTimer = this.timer('getStrategiesByContextField');
        const rows = await this.db
            .select(this.prefixColumns())
            .from(T.featureStrategies)
            .where(this.db.raw("EXISTS (SELECT 1 FROM jsonb_array_elements(constraints) AS elem WHERE elem ->> 'contextName' = ?)", contextFieldName));
        stopTimer();
        return rows.map(mapRow);
    }
    prefixColumns() {
        return COLUMNS.map((c) => `${T.featureStrategies}.${c}`);
    }
    async getCustomStrategiesInUseCount() {
        const stopTimer = this.timer('getCustomStrategiesInUseCount');
        const notBuiltIn = '0';
        const columns = [
            this.db.raw('count(fes.strategy_name) as times_used'),
            'fes.strategy_name',
        ];
        const rows = await this.db(`${T.strategies} as str`)
            .select(columns)
            .join(`${T.featureStrategies} as fes`, 'fes.strategy_name', 'str.name')
            .where(`str.built_in`, '=', notBuiltIn)
            .groupBy('strategy_name');
        stopTimer();
        return rows.length;
    }
}
module.exports = FeatureStrategiesStore;
exports.default = FeatureStrategiesStore;
//# sourceMappingURL=feature-toggle-strategies-store.js.map