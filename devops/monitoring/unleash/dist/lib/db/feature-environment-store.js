"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureEnvironmentStore = void 0;
const metrics_helper_1 = __importDefault(require("../util/metrics-helper"));
const metric_events_1 = require("../metric-events");
const notfound_error_1 = __importDefault(require("../error/notfound-error"));
const uuid_1 = require("uuid");
const T = {
    featureEnvs: 'feature_environments',
    featureStrategies: 'feature_strategies',
    features: 'features',
};
class FeatureEnvironmentStore {
    constructor(db, eventBus, { getLogger, isOss }) {
        this.db = db;
        this.logger = getLogger('feature-environment-store.ts');
        this.timer = (action) => metrics_helper_1.default.wrapTimer(eventBus, metric_events_1.DB_TIME, {
            store: 'feature-environments',
            action,
        });
        this.isOss = isOss;
    }
    async delete({ featureName, environment, }) {
        await this.db(T.featureEnvs)
            .where('feature_name', featureName)
            .andWhere('environment', environment)
            .del();
    }
    async deleteAll() {
        await this.db(T.featureEnvs).del();
    }
    destroy() { }
    async exists({ featureName, environment, }) {
        const result = await this.db.raw(`SELECT EXISTS (SELECT 1 FROM ${T.featureEnvs} WHERE feature_name = ? AND environment = ?) AS present`, [featureName, environment]);
        const { present } = result.rows[0];
        return present;
    }
    async get({ featureName, environment, }) {
        const md = await this.db(T.featureEnvs)
            .where('feature_name', featureName)
            .andWhere('environment', environment)
            .first();
        if (md) {
            return {
                enabled: md.enabled,
                featureName,
                environment,
                variants: md.variants,
                lastSeenAt: md.last_seen_at,
            };
        }
        throw new notfound_error_1.default(`Could not find ${featureName} in ${environment}`);
    }
    addOssFilterIfNeeded(queryBuilder) {
        if (this.isOss) {
            return queryBuilder
                .join('environments', 'environments.name', '=', `${T.featureEnvs}.environment`)
                .whereIn('environments.name', [
                'default',
                'development',
                'production',
            ]);
        }
        return queryBuilder;
    }
    async getAll(query) {
        let rows = this.db(T.featureEnvs);
        if (query) {
            rows = rows.where(query);
        }
        this.addOssFilterIfNeeded(rows);
        return (await rows).map((r) => ({
            enabled: r.enabled,
            featureName: r.feature_name,
            environment: r.environment,
            variants: r.variants,
        }));
    }
    async getAllByFeatures(features, environment) {
        let rows = this.db(T.featureEnvs)
            .whereIn('feature_name', features)
            .orderBy('feature_name', 'asc');
        if (environment) {
            rows = rows.where({ environment });
        }
        this.addOssFilterIfNeeded(rows);
        return (await rows).map((r) => ({
            enabled: r.enabled,
            featureName: r.feature_name,
            environment: r.environment,
            variants: r.variants,
            lastSeenAt: r.last_seen_at,
        }));
    }
    async disableEnvironmentIfNoStrategies(featureName, environment) {
        const result = await this.db.raw(`SELECT EXISTS (SELECT 1 FROM ${T.featureStrategies} WHERE feature_name = ? AND environment = ?) AS enabled`, [featureName, environment]);
        const { enabled } = result.rows[0];
        if (!enabled) {
            await this.db(T.featureEnvs)
                .update({ enabled: false })
                .where({ feature_name: featureName, environment });
        }
    }
    async addEnvironmentToFeature(featureName, environment, enabled = false) {
        await this.db('feature_environments')
            .insert({ feature_name: featureName, environment, enabled })
            .onConflict(['environment', 'feature_name'])
            .merge(['enabled']);
    }
    // TODO: move to project store.
    async disconnectFeatures(environment, project) {
        const featureSelector = this.db('features')
            .where({ project })
            .select('name');
        await this.db(T.featureEnvs)
            .where({ environment })
            .andWhere('feature_name', 'IN', featureSelector)
            .del();
        await this.db('feature_strategies').where({
            environment,
            project_name: project,
        });
    }
    async featureHasEnvironment(environment, featureName) {
        const result = await this.db.raw(`SELECT EXISTS (SELECT 1 FROM ${T.featureEnvs} WHERE feature_name = ? AND environment = ?)  AS present`, [featureName, environment]);
        const { present } = result.rows[0];
        return present;
    }
    async getEnvironmentsForFeature(featureName) {
        const envs = await this.db(T.featureEnvs).where('feature_name', featureName);
        if (envs) {
            return envs.map((r) => ({
                featureName: r.feature_name,
                environment: r.environment,
                variants: r.variants || [],
                enabled: r.enabled,
                lastSeenAt: r.last_seen_at,
            }));
        }
        return [];
    }
    async getEnvironmentMetaData(environment, featureName) {
        const md = await this.db(T.featureEnvs)
            .where('feature_name', featureName)
            .andWhere('environment', environment)
            .first();
        if (md) {
            return {
                enabled: md.enabled,
                featureName,
                environment,
            };
        }
        throw new notfound_error_1.default(`Could not find ${featureName} in ${environment}`);
    }
    async isEnvironmentEnabled(featureName, environment) {
        const row = await this.db(T.featureEnvs)
            .select('enabled')
            .where({ feature_name: featureName, environment })
            .first();
        return row.enabled;
    }
    async removeEnvironmentForFeature(featureName, environment) {
        await this.db(T.featureEnvs)
            .where({ feature_name: featureName, environment })
            .del();
    }
    async setEnvironmentEnabledStatus(environment, featureName, enabled) {
        return this.db(T.featureEnvs).update({ enabled }).where({
            environment,
            feature_name: featureName,
            enabled: !enabled,
        });
    }
    async connectProject(environment, projectId, idempotent) {
        const query = this.db('project_environments').insert({
            environment_name: environment,
            project_id: projectId,
        });
        if (idempotent) {
            await query.onConflict(['environment_name', 'project_id']).ignore();
        }
        else {
            await query;
        }
    }
    async connectFeatures(environment, projectId) {
        const featuresToEnable = await this.db('features')
            .select('name')
            .where({
            project: projectId,
        });
        const rows = featuresToEnable.map((f) => ({
            environment,
            feature_name: f.name,
            enabled: false,
        }));
        if (rows.length > 0) {
            await this.db('feature_environments')
                .insert(rows)
                .onConflict(['environment', 'feature_name'])
                .ignore();
        }
    }
    async disconnectProject(environment, projectId) {
        await this.db('project_environments')
            .where({ environment_name: environment, project_id: projectId })
            .del();
    }
    async connectFeatureToEnvironmentsForProject(featureName, projectId, enabledIn = {}) {
        const environmentsToEnable = await this.db('project_environments')
            .select('environment_name')
            .where({ project_id: projectId });
        await Promise.all(environmentsToEnable.map(async (env) => {
            await this.db('feature_environments')
                .insert({
                environment: env.environment_name,
                feature_name: featureName,
                enabled: enabledIn[env.environment_name] || false,
            })
                .onConflict(['environment', 'feature_name'])
                .ignore();
        }));
    }
    async copyEnvironmentFeaturesByProjects(sourceEnvironment, destinationEnvironment, projects) {
        await this.db.raw(`INSERT INTO ${T.featureEnvs} (environment, feature_name, enabled, variants)
             SELECT DISTINCT ? AS environemnt, fe.feature_name, fe.enabled, fe.variants
             FROM ${T.featureEnvs} AS fe
                      INNER JOIN ${T.features} AS f ON fe.feature_name = f.name
             WHERE fe.environment = ? AND f.project = ANY(?)`, [destinationEnvironment, sourceEnvironment, projects]);
    }
    async addVariantsToFeatureEnvironment(featureName, environment, variants) {
        return this.setVariantsToFeatureEnvironments(featureName, [environment], variants);
    }
    async setVariantsToFeatureEnvironments(featureName, environments, variants) {
        const v = variants || [];
        v.sort((a, b) => a.name.localeCompare(b.name));
        const variantsString = JSON.stringify(v);
        const records = environments.map((env) => ({
            variants: variantsString,
            enabled: false, // default value for enabled in case it's not set
            feature_name: featureName,
            environment: env,
        }));
        await this.db(T.featureEnvs)
            .insert(records)
            .onConflict(['feature_name', 'environment'])
            .merge(['variants']);
    }
    async addFeatureEnvironment(featureEnvironment) {
        const v = featureEnvironment.variants || [];
        v.sort((a, b) => a.name.localeCompare(b.name));
        await this.db(T.featureEnvs)
            .insert({
            variants: JSON.stringify(v),
            enabled: featureEnvironment.enabled,
            feature_name: featureEnvironment.featureName,
            environment: featureEnvironment.environment,
        })
            .onConflict(['feature_name', 'environment'])
            .merge(['variants', 'enabled']);
    }
    async cloneStrategies(sourceEnvironment, destinationEnvironment) {
        const sourceFeatureStrategies = await this.db('feature_strategies').where({
            environment: sourceEnvironment,
        });
        const clonedStrategyRows = sourceFeatureStrategies.map((featureStrategy) => {
            return {
                id: (0, uuid_1.v4)(),
                feature_name: featureStrategy.feature_name,
                project_name: featureStrategy.project_name,
                environment: destinationEnvironment,
                strategy_name: featureStrategy.strategy_name,
                parameters: JSON.stringify(featureStrategy.parameters),
                constraints: JSON.stringify(featureStrategy.constraints),
                sort_order: featureStrategy.sort_order,
                variants: JSON.stringify(featureStrategy.variants),
            };
        });
        if (clonedStrategyRows.length === 0) {
            return Promise.resolve();
        }
        await this.db('feature_strategies').insert(clonedStrategyRows);
        const newStrategyMapping = new Map();
        sourceFeatureStrategies.forEach((sourceStrategy, index) => {
            newStrategyMapping.set(sourceStrategy.id, clonedStrategyRows[index].id);
        });
        const segmentsToClone = await this.db('feature_strategy_segment as fss')
            .select(['id', 'segment_id'])
            .join('feature_strategies AS fs', 'fss.feature_strategy_id', 'fs.id')
            .where('environment', sourceEnvironment);
        const clonedSegmentIdRows = segmentsToClone.map((existingSegmentRow) => {
            return {
                feature_strategy_id: newStrategyMapping.get(existingSegmentRow.id),
                segment_id: existingSegmentRow.segment_id,
            };
        });
        if (clonedSegmentIdRows.length > 0) {
            await this.db('feature_strategy_segment').insert(clonedSegmentIdRows);
        }
    }
    async variantExists(featureName) {
        const result = await this.db.raw(`SELECT EXISTS (SELECT 1 FROM ${T.featureEnvs} WHERE feature_name = ? AND variants <> '[]'::jsonb) AS present`, [featureName]);
        const { present } = result.rows[0];
        return present;
    }
}
exports.FeatureEnvironmentStore = FeatureEnvironmentStore;
//# sourceMappingURL=feature-environment-store.js.map