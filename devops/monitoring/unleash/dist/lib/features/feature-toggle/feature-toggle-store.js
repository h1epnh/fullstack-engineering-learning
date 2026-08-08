"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const metrics_helper_1 = __importDefault(require("../../util/metrics-helper"));
const metric_events_1 = require("../../metric-events");
const notfound_error_1 = __importDefault(require("../../error/notfound-error"));
const error_1 = require("../../error");
const util_1 = require("../../../lib/util");
const feature_toggle_list_builder_1 = require("./query-builders/feature-toggle-list-builder");
const types_1 = require("../../../lib/types");
const feature_toggle_row_converter_1 = require("./converters/feature-toggle-row-converter");
const FEATURE_COLUMNS = [
    'name',
    'description',
    'type',
    'project',
    'stale',
    'created_at',
    'impression_data',
    'last_seen_at',
    'archived_at',
];
const commonSelectColumns = [
    'features.name as name',
    'features.description as description',
    'features.type as type',
    'features.project as project',
    'features.stale as stale',
    'features.impression_data as impression_data',
    'features.last_seen_at as last_seen_at',
    'features.created_at as created_at',
];
const TABLE = 'features';
const FEATURE_ENVIRONMENTS_TABLE = 'feature_environments';
class FeatureToggleStore {
    constructor(db, eventBus, getLogger, flagResolver) {
        this.getBaseFeatureQuery = (archived, environment) => {
            const builder = new feature_toggle_list_builder_1.FeatureToggleListBuilder(this.db, [
                ...commonSelectColumns,
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
            ]);
            builder
                .query('features')
                .withArchived(archived)
                .withStrategies(environment)
                .withFeatureEnvironments(environment)
                .withFeatureStrategySegments()
                .withSegments();
            return builder;
        };
        this.db = db;
        this.logger = getLogger('feature-toggle-store.ts');
        this.featureToggleRowConverter = new feature_toggle_row_converter_1.FeatureToggleRowConverter(flagResolver);
        this.flagResolver = flagResolver;
        this.timer = (action) => metrics_helper_1.default.wrapTimer(eventBus, metric_events_1.DB_TIME, {
            store: 'feature-toggle',
            action,
        });
    }
    async count(query = { archived: false }) {
        const { archived, ...rest } = query;
        return this.db
            .from(TABLE)
            .count('*')
            .where(rest)
            .modify(FeatureToggleStore.filterByArchived, archived)
            .then((res) => Number(res[0].count));
    }
    async deleteAll() {
        await this.db(TABLE).del();
    }
    destroy() { }
    async get(name) {
        return this.db
            .first(FEATURE_COLUMNS)
            .from(TABLE)
            .where({ name })
            .then(this.rowToFeature);
    }
    async getFeatureToggleList(featureQuery, userId, archived = false, includeDisabledStrategies = false) {
        const environment = featureQuery?.environment || util_1.DEFAULT_ENV;
        const builder = this.getBaseFeatureQuery(archived, environment).withFeatureTags();
        builder.addSelectColumn('ft.tag_value as tag_value');
        builder.addSelectColumn('ft.tag_type as tag_type');
        builder.withLastSeenByEnvironment(archived);
        builder.addSelectColumn('last_seen_at_metrics.last_seen_at as env_last_seen_at');
        builder.addSelectColumn('last_seen_at_metrics.environment as last_seen_at_env');
        if (userId) {
            builder.withFavorites(userId);
            builder.addSelectColumn(this.db.raw('favorite_features.feature is not null as favorite'));
        }
        const rows = await builder.internalQuery.select(builder.getSelectColumns());
        return this.featureToggleRowConverter.buildFeatureToggleListFromRows(rows, featureQuery, includeDisabledStrategies);
    }
    async getPlaygroundFeatures(featureQuery) {
        const environment = featureQuery?.environment || util_1.DEFAULT_ENV;
        const archived = false;
        const builder = this.getBaseFeatureQuery(archived, environment);
        builder.withDependentFeatureToggles();
        builder.addSelectColumn('df.parent as parent');
        builder.addSelectColumn('df.variants as parent_variants');
        builder.addSelectColumn('df.enabled as parent_enabled');
        if (featureQuery?.project) {
            builder.forProject(featureQuery.project);
        }
        const rows = await builder.internalQuery.select(builder.getSelectColumns());
        return this.featureToggleRowConverter.buildPlaygroundFeaturesFromRows(rows, featureQuery);
    }
    async getAll(query = { archived: false }) {
        const { archived, ...rest } = query;
        const rows = await this.db
            .select(FEATURE_COLUMNS)
            .from(TABLE)
            .where(rest)
            .modify(FeatureToggleStore.filterByArchived, archived);
        return rows.map(this.rowToFeature);
    }
    async getArchivedFeatures(project) {
        const builder = new feature_toggle_list_builder_1.FeatureToggleListBuilder(this.db, [
            ...commonSelectColumns,
            'features.archived_at as archived_at',
        ]);
        const archived = true;
        builder.query('features').withLastSeenByEnvironment(archived);
        builder.addSelectColumn('last_seen_at_metrics.last_seen_at as env_last_seen_at');
        builder.addSelectColumn('last_seen_at_metrics.environment as last_seen_at_env');
        let rows;
        if (project) {
            rows = await builder.internalQuery
                .select(builder.getSelectColumns())
                .where({ project })
                .whereNotNull('archived_at');
        }
        else {
            rows = await builder.internalQuery
                .select(builder.getSelectColumns())
                .whereNotNull('archived_at');
        }
        return this.featureToggleRowConverter.buildArchivedFeatureToggleListFromRows(rows);
    }
    async getFeatureTypeCounts({ projectId, archived, }) {
        const query = this.db(TABLE)
            .select('type')
            .count('type')
            .groupBy('type');
        query
            .where({
            project: projectId,
        })
            .modify(FeatureToggleStore.filterByArchived, archived);
        const result = await query;
        return result.map((row) => ({
            type: row.type,
            count: Number(row.count),
        }));
    }
    async getAllByNames(names) {
        const query = this.db(TABLE).orderBy('name', 'asc');
        query.whereIn('name', names);
        const rows = await query;
        return rows.map(this.rowToFeature);
    }
    async countByDate(queryModifiers) {
        const { project, archived, dateAccessor } = queryModifiers;
        const query = this.db
            .count()
            .from(TABLE)
            .where({ project })
            .modify(FeatureToggleStore.filterByArchived, archived);
        if (queryModifiers.date) {
            query.andWhere(dateAccessor, '>=', queryModifiers.date);
        }
        if (queryModifiers.range && queryModifiers.range.length === 2) {
            query.andWhereBetween(dateAccessor, [
                queryModifiers.range[0],
                queryModifiers.range[1],
            ]);
        }
        const queryResult = await query.first();
        return Number.parseInt(queryResult.count || 0);
    }
    /**
     * Get projectId from feature filtered by name. Used by Rbac middleware
     * @deprecated
     * @param name
     */
    async getProjectId(name) {
        return this.db
            .first(['project'])
            .from(TABLE)
            .where({ name })
            .then((r) => (r ? r.project : undefined))
            .catch((e) => {
            this.logger.error(e);
            return undefined;
        });
    }
    async exists(name) {
        const result = await this.db.raw('SELECT EXISTS (SELECT 1 FROM features WHERE name = ?) AS present', [name]);
        const { present } = result.rows[0];
        return present;
    }
    async setLastSeen(data) {
        const now = new Date();
        const environmentArrays = this.mapMetricDataToEnvBuckets(data);
        try {
            for (const env of Object.keys(environmentArrays)) {
                const toggleNames = environmentArrays[env].sort();
                await this.db(FEATURE_ENVIRONMENTS_TABLE)
                    .update({ last_seen_at: now })
                    .where('environment', env)
                    .whereIn('feature_name', this.db(FEATURE_ENVIRONMENTS_TABLE)
                    .select('feature_name')
                    .whereIn('feature_name', toggleNames)
                    .forUpdate()
                    .skipLocked());
                // Updating the toggle's last_seen_at also for backwards compatibility
                await this.db(TABLE)
                    .update({ last_seen_at: now })
                    .whereIn('name', this.db(TABLE)
                    .select('name')
                    .whereIn('name', toggleNames)
                    .forUpdate()
                    .skipLocked());
            }
        }
        catch (err) {
            this.logger.error('Could not update lastSeen, error: ', err);
        }
    }
    mapMetricDataToEnvBuckets(data) {
        return data.reduce((acc, feature) => {
            const { environment, featureName } = feature;
            if (!acc[environment]) {
                acc[environment] = [];
            }
            acc[environment].push(featureName);
            return acc;
        }, {});
    }
    rowToFeature(row) {
        if (!row) {
            throw new notfound_error_1.default('No feature flag found');
        }
        return {
            name: row.name,
            description: row.description,
            type: row.type,
            project: row.project,
            stale: row.stale || false,
            createdAt: row.created_at,
            lastSeenAt: row.last_seen_at,
            impressionData: row.impression_data || false,
            archivedAt: row.archived_at || undefined,
            archived: row.archived_at != null,
        };
    }
    rowToEnvVariants(variantRows) {
        if (!variantRows.length) {
            return [];
        }
        const sortedVariants = variantRows[0].variants || [];
        sortedVariants.sort((a, b) => a.name.localeCompare(b.name));
        return sortedVariants;
    }
    insertToRow(project, data) {
        const row = {
            name: data.name,
            description: data.description || null,
            type: data.type,
            project,
            archived_at: data.archived ? new Date() : null,
            stale: data.stale || false,
            created_at: data.createdAt,
            impression_data: data.impressionData || false,
            created_by_user_id: data.createdByUserId,
        };
        if (!row.created_at) {
            delete row.created_at;
        }
        return row;
    }
    dtoToUpdateRow(project, data) {
        const row = {
            name: data.name,
            description: data.description || null,
            type: data.type,
            project,
            archived_at: data.archived ? new Date() : null,
            stale: data.stale,
            impression_data: data.impressionData,
        };
        return row;
    }
    async create(project, data) {
        try {
            const row = await this.db(TABLE)
                .insert(this.insertToRow(project, data))
                .returning(FEATURE_COLUMNS);
            return this.rowToFeature(row[0]);
        }
        catch (err) {
            this.logger.error('Could not insert feature, error: ', err);
            if (typeof err.detail === 'string' &&
                err.detail.includes('already exists')) {
                throw new error_1.NameExistsError(`Feature ${data.name} already exists`);
            }
            throw err;
        }
    }
    async update(project, data) {
        const row = await this.db(TABLE)
            .where({ name: data.name })
            .update(this.dtoToUpdateRow(project, data))
            .returning(FEATURE_COLUMNS);
        return this.rowToFeature(row[0]);
    }
    async archive(name) {
        const now = new Date();
        const row = await this.db(TABLE)
            .where({ name })
            .update({ archived_at: now })
            .returning(FEATURE_COLUMNS);
        return this.rowToFeature(row[0]);
    }
    async batchArchive(names) {
        const now = new Date();
        const rows = await this.db(TABLE)
            .whereIn('name', names)
            .update({ archived_at: now })
            .returning(FEATURE_COLUMNS);
        return rows.map((row) => this.rowToFeature(row));
    }
    async batchStale(names, stale) {
        const rows = await this.db(TABLE)
            .whereIn('name', names)
            .update({ stale })
            .returning(FEATURE_COLUMNS);
        return rows.map((row) => this.rowToFeature(row));
    }
    async delete(name) {
        await this.db(TABLE)
            .where({ name }) // Feature flag must be archived to allow deletion
            .whereNotNull('archived_at')
            .del();
    }
    async batchDelete(names) {
        await this.db(TABLE)
            .whereIn('name', names)
            .whereNotNull('archived_at')
            .del();
    }
    async revive(name) {
        const row = await this.db(TABLE)
            .where({ name })
            .update({ archived_at: null })
            .returning(FEATURE_COLUMNS);
        return this.rowToFeature(row[0]);
    }
    async batchRevive(names) {
        const rows = await this.db(TABLE)
            .whereIn('name', names)
            .update({ archived_at: null })
            .returning(FEATURE_COLUMNS);
        return rows.map((row) => this.rowToFeature(row));
    }
    async disableAllEnvironmentsForFeatures(names) {
        await this.db(FEATURE_ENVIRONMENTS_TABLE)
            .whereIn('feature_name', names)
            .update({ enabled: false });
    }
    async getVariants(featureName) {
        if (!(await this.exists(featureName))) {
            throw new notfound_error_1.default('No feature flag found');
        }
        const row = await this.db(`${TABLE} as f`)
            .select('fe.variants')
            .join(`${FEATURE_ENVIRONMENTS_TABLE} as fe`, 'fe.feature_name', 'f.name')
            .where({ name: featureName })
            .limit(1);
        return this.rowToEnvVariants(row);
    }
    async getVariantsForEnv(featureName, environment) {
        const row = await this.db(`${TABLE} as f`)
            .select('fev.variants')
            .join(`${FEATURE_ENVIRONMENTS_TABLE} as fev`, 'fev.feature_name', 'f.name')
            .where({ name: featureName })
            .andWhere({ environment });
        return this.rowToEnvVariants(row);
    }
    async saveVariants(project, featureName, newVariants) {
        const variantsString = JSON.stringify(newVariants);
        await this.db('feature_environments')
            .update('variants', variantsString)
            .where('feature_name', featureName);
        const row = await this.db(TABLE).select(FEATURE_COLUMNS).where({
            project: project,
            name: featureName,
        });
        const flag = this.rowToFeature(row[0]);
        flag.variants = newVariants;
        return flag;
    }
    async updatePotentiallyStaleFeatures(currentTime) {
        const query = this.db.raw(`SELECT name,
                    project,
                    potentially_stale,
                    (? > (features.created_at + ((SELECT feature_types.lifetime_days
                                                  FROM feature_types
                                                  WHERE feature_types.id = features.type) *
                                                 INTERVAL '1 day'))) as current_staleness
             FROM features
             WHERE NOT stale = true
               AND archived_at IS NULL`, [currentTime || this.db.fn.now()]);
        const featuresToUpdate = (await query).rows
            .filter(({ potentially_stale, current_staleness }) => (potentially_stale ?? false) !==
            (current_staleness ?? false))
            .map(({ current_staleness, name, project }) => ({
            potentiallyStale: current_staleness ?? false,
            name,
            project,
        }));
        await this.db(TABLE)
            .update('potentially_stale', true)
            .whereIn('name', featuresToUpdate
            .filter((feature) => feature.potentiallyStale === true)
            .map((feature) => feature.name));
        await this.db(TABLE)
            .update('potentially_stale', false)
            .whereIn('name', featuresToUpdate
            .filter((feature) => feature.potentiallyStale !== true)
            .map((feature) => feature.name));
        return featuresToUpdate;
    }
    async isPotentiallyStale(featureName) {
        const result = await this.db(TABLE)
            .first(['potentially_stale'])
            .from(TABLE)
            .where({ name: featureName });
        return result?.potentially_stale ?? false;
    }
    async setCreatedByUserId(batchSize) {
        const EVENTS_TABLE = 'events';
        const USERS_TABLE = 'users';
        const API_TOKEN_TABLE = 'api_tokens';
        const toUpdate = await this.db(`${TABLE} as f`)
            .joinRaw(`JOIN ${EVENTS_TABLE} AS ev ON ev.feature_name = f.name`)
            .joinRaw(`LEFT OUTER JOIN ${USERS_TABLE} AS u on ev.created_by = u.username OR ev.created_by = u.email`)
            .joinRaw(`LEFT OUTER JOIN ${API_TOKEN_TABLE} AS t on ev.created_by = t.username`)
            .whereRaw(`f.created_by_user_id IS null AND
                ev.type = 'feature-created' AND
                (u.id IS NOT null OR t.username IS NOT null)`)
            .orderBy('f.created_at', 'desc')
            .limit(batchSize)
            .select(['f.*', 'ev.created_by', 'u.id', 't.username']);
        const updatePromises = toUpdate.map((row) => {
            const id = row.id || types_1.ADMIN_TOKEN_USER.id;
            return this.db(TABLE)
                .update({ created_by_user_id: id })
                .where({ name: row.name });
        });
        await Promise.all(updatePromises);
        return toUpdate.length;
    }
}
FeatureToggleStore.filterByArchived = (queryBuilder, archived) => {
    return archived
        ? queryBuilder.whereNotNull('archived_at')
        : queryBuilder.whereNull('archived_at');
};
exports.default = FeatureToggleStore;
module.exports = FeatureToggleStore;
//# sourceMappingURL=feature-toggle-store.js.map