"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notfound_error_1 = __importDefault(require("../../error/notfound-error"));
const util_1 = require("../../util");
const metrics_helper_1 = __importDefault(require("../../util/metrics-helper"));
const metric_events_1 = require("../../metric-events");
const search_utils_1 = require("../feature-search/search-utils");
const COLUMNS = [
    'id',
    'name',
    'description',
    'created_at',
    'health',
    'updated_at',
];
const TABLE = 'projects';
const SETTINGS_COLUMNS = [
    'project_mode',
    'default_stickiness',
    'feature_limit',
    'feature_naming_pattern',
    'feature_naming_example',
    'feature_naming_description',
];
const SETTINGS_TABLE = 'project_settings';
const PROJECT_ENVIRONMENTS = 'project_environments';
class ProjectStore {
    constructor(db, eventBus, { getLogger, flagResolver, isOss, }) {
        this.db = db;
        this.logger = getLogger('project-store.ts');
        this.timer = (action) => metrics_helper_1.default.wrapTimer(eventBus, metric_events_1.DB_TIME, {
            store: 'project',
            action,
        });
        this.flagResolver = flagResolver;
        this.isOss = isOss;
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    fieldToRow(data) {
        return {
            id: data.id,
            name: data.name,
            description: data.description,
        };
    }
    destroy() { }
    async isFeatureLimitReached(id) {
        const result = await this.db.raw(`SELECT EXISTS(SELECT 1
                           FROM project_settings
                                    LEFT JOIN features ON project_settings.project = features.project
                           WHERE project_settings.project = ?
                             AND features.archived_at IS NULL
                           GROUP BY project_settings.project
                           HAVING project_settings.feature_limit <= COUNT(features.project)) AS present`, [id]);
        const { present } = result.rows[0];
        return present;
    }
    async getAll(query = {}) {
        let projects = this.db
            .select(COLUMNS)
            .from(TABLE)
            .where(query)
            .orderBy('name', 'asc');
        projects = projects.where(`${TABLE}.archived_at`, null);
        if (this.isOss) {
            projects = projects.where('id', 'default');
        }
        const rows = await projects;
        return rows.map(this.mapRow);
    }
    async get(id) {
        const extraColumns = ['archived_at'];
        return this.db
            .first([...COLUMNS, ...SETTINGS_COLUMNS, ...extraColumns])
            .from(TABLE)
            .leftJoin(SETTINGS_TABLE, `${SETTINGS_TABLE}.project`, `${TABLE}.id`)
            .where({ id })
            .then(this.mapRow);
    }
    async exists(id) {
        const result = await this.db.raw(`SELECT EXISTS(SELECT 1 FROM ${TABLE} WHERE id = ?) AS present`, [id]);
        const { present } = result.rows[0];
        return present;
    }
    async hasProject(id) {
        const result = await this.db.raw(`SELECT EXISTS(SELECT 1 FROM ${TABLE} WHERE id = ?) AS present`, [id]);
        const { present } = result.rows[0];
        return present;
    }
    async hasActiveProject(id) {
        const result = await this.db.raw(`SELECT EXISTS(SELECT 1 FROM ${TABLE} WHERE id = ? and archived_at IS NULL) AS present`, [id]);
        const { present } = result.rows[0];
        return present;
    }
    async updateHealth(healthUpdate) {
        await this.db(TABLE).where({ id: healthUpdate.id }).update({
            health: healthUpdate.health,
            updated_at: new Date(),
        });
    }
    async create(project) {
        const row = await this.db(TABLE)
            .insert({ ...this.fieldToRow(project), created_at: new Date() })
            .returning('*');
        const settingsRow = await this.db(SETTINGS_TABLE)
            .insert({
            project: project.id,
            default_stickiness: project.defaultStickiness,
            feature_limit: project.featureLimit,
            project_mode: project.mode,
        })
            .returning('*');
        return this.mapRow({ ...row[0], ...settingsRow[0] });
    }
    async hasProjectSettings(projectId) {
        const result = await this.db.raw(`SELECT EXISTS(SELECT 1 FROM ${SETTINGS_TABLE} WHERE project = ?) AS present`, [projectId]);
        const { present } = result.rows[0];
        return present;
    }
    async update(data) {
        try {
            await this.db(TABLE)
                .where({ id: data.id })
                .update(this.fieldToRow(data));
            if (data.defaultStickiness !== undefined ||
                data.featureLimit !== undefined) {
                if (await this.hasProjectSettings(data.id)) {
                    await this.db(SETTINGS_TABLE)
                        .where({ project: data.id })
                        .update({
                        default_stickiness: data.defaultStickiness,
                        feature_limit: data.featureLimit,
                    });
                }
                else {
                    await this.db(SETTINGS_TABLE).insert({
                        project: data.id,
                        default_stickiness: data.defaultStickiness,
                        feature_limit: data.featureLimit,
                        project_mode: 'open',
                    });
                }
            }
        }
        catch (err) {
            this.logger.error('Could not update project, error: ', err);
        }
    }
    async updateProjectEnterpriseSettings(data) {
        try {
            if (await this.hasProjectSettings(data.id)) {
                await this.db(SETTINGS_TABLE)
                    .where({ project: data.id })
                    .update({
                    project_mode: data.mode,
                    feature_naming_pattern: data.featureNaming?.pattern,
                    feature_naming_example: data.featureNaming?.example,
                    feature_naming_description: data.featureNaming?.description,
                });
            }
            else {
                await this.db(SETTINGS_TABLE).insert({
                    project: data.id,
                    project_mode: data.mode,
                    feature_naming_pattern: data.featureNaming?.pattern,
                    feature_naming_example: data.featureNaming?.example,
                    feature_naming_description: data.featureNaming?.description,
                });
            }
        }
        catch (err) {
            this.logger.error('Could not update project settings, error: ', err);
        }
    }
    async importProjects(projects, environments) {
        const rows = await this.db(TABLE)
            .insert(projects.map(this.fieldToRow))
            .returning(COLUMNS)
            .onConflict('id')
            .ignore();
        if (environments && rows.length > 0) {
            environments.forEach((env) => {
                projects.forEach(async (project) => {
                    await this.addEnvironmentToProject(project.id, env.name);
                });
            });
            return rows.map(this.mapRow);
        }
        return [];
    }
    async addDefaultEnvironment(projects) {
        const environments = projects.map((project) => ({
            project_id: project.id,
            environment_name: util_1.DEFAULT_ENV,
        }));
        await this.db('project_environments')
            .insert(environments)
            .onConflict(['project_id', 'environment_name'])
            .ignore();
    }
    async deleteAll() {
        await this.db(TABLE).del();
    }
    async delete(id) {
        try {
            await this.db(TABLE).where({ id }).del();
        }
        catch (err) {
            this.logger.error('Could not delete project, error: ', err);
        }
    }
    async archive(id) {
        const now = new Date();
        await this.db(TABLE).where({ id }).update({ archived_at: now });
    }
    async revive(id) {
        await this.db(TABLE).where({ id }).update({ archived_at: null });
    }
    async getProjectLinksForEnvironments(environments) {
        const rows = await this.db('project_environments')
            .select(['project_id', 'environment_name'])
            .whereIn('environment_name', environments);
        return rows.map(this.mapLinkRow);
    }
    async deleteEnvironmentForProject(id, environment) {
        await this.db('project_environments')
            .where({
            project_id: id,
            environment_name: environment,
        })
            .del();
    }
    async addEnvironmentToProject(id, environment) {
        await this.db('project_environments')
            .insert({
            project_id: id,
            environment_name: environment,
        })
            .onConflict(['project_id', 'environment_name'])
            .ignore();
    }
    async addEnvironmentToProjects(environment, projects) {
        const rows = await Promise.all(projects.map(async (projectId) => {
            return {
                project_id: projectId,
                environment_name: environment,
            };
        }));
        await this.db('project_environments')
            .insert(rows)
            .onConflict(['project_id', 'environment_name'])
            .ignore();
    }
    async getEnvironmentsForProject(id) {
        const rows = await this.db(PROJECT_ENVIRONMENTS)
            .where({
            project_id: id,
        })
            .innerJoin('environments', 'project_environments.environment_name', 'environments.name')
            .orderBy('environments.sort_order', 'asc')
            .orderBy('project_environments.environment_name', 'asc')
            .returning([
            'project_environments.environment_name',
            'project_environments.default_strategy',
        ]);
        return rows.map(this.mapProjectEnvironmentRow);
    }
    async getMembersCountByProject(projectId) {
        const members = await this.db
            .from((db) => {
            db.select('user_id')
                .from('role_user')
                .leftJoin('roles', 'role_user.role_id', 'roles.id')
                .where((builder) => builder
                .where('project', projectId)
                .whereNot('type', 'root'))
                .union((queryBuilder) => {
                queryBuilder
                    .select('user_id')
                    .from('group_role')
                    .leftJoin('group_user', 'group_user.group_id', 'group_role.group_id')
                    .where('project', projectId);
            })
                .as('query');
        })
            .count()
            .first();
        return Number(members.count);
    }
    async getMembersCountByProjectAfterDate(projectId, date) {
        const members = await this.db
            .from((db) => {
            db.select('user_id')
                .from('role_user')
                .leftJoin('roles', 'role_user.role_id', 'roles.id')
                .where((builder) => builder
                .where('project', projectId)
                .whereNot('type', 'root')
                .andWhere('role_user.created_at', '>=', date))
                .union((queryBuilder) => {
                queryBuilder
                    .select('user_id')
                    .from('group_role')
                    .leftJoin('group_user', 'group_user.group_id', 'group_role.group_id')
                    .where('project', projectId)
                    .andWhere('group_role.created_at', '>=', date);
            })
                .as('query');
        })
            .count()
            .first();
        return Number(members.count);
    }
    async getApplicationsByProject(params) {
        const { project, limit, sortOrder, searchParams, offset } = params;
        const validatedSortOrder = sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : 'asc';
        const query = this.db
            .with('applications', (qb) => {
            qb.select('project', 'app_name', 'environment')
                .distinct()
                .from('client_metrics_env as cme')
                .leftJoin('features as f', 'cme.feature_name', 'f.name')
                .where('project', project);
        })
            .with('ranked', (qb) => {
            (0, search_utils_1.applySearchFilters)(qb, searchParams, [
                'a.app_name',
                'a.environment',
                'ci.instance_id',
                'ci.sdk_version',
            ]);
            qb.select('a.app_name', 'a.environment', 'ci.instance_id', 'ci.sdk_version', this.db.raw(`DENSE_RANK() OVER (ORDER BY a.app_name ${validatedSortOrder}) AS rank`))
                .from('applications as a')
                .innerJoin('client_applications as ca', 'a.app_name', 'ca.app_name')
                .leftJoin('client_instances as ci', function () {
                this.on('ci.app_name', '=', 'a.app_name').andOn('ci.environment', '=', 'a.environment');
            });
        })
            .with('final_ranks', this.db.raw('select row_number() over (order by min(rank)) as final_rank from ranked group by app_name'))
            .with('total', this.db.raw('select count(*) as total from final_ranks'))
            .select('*')
            .from('ranked')
            .joinRaw('CROSS JOIN total')
            .whereBetween('rank', [offset + 1, offset + limit]);
        const rows = await query;
        if (rows.length !== 0) {
            const applications = this.getAggregatedApplicationsData(rows);
            return {
                applications,
                total: Number(rows[0].total) || 0,
            };
        }
        return {
            applications: [],
            total: 0,
        };
    }
    async getDefaultStrategy(projectId, environment) {
        const rows = await this.db(PROJECT_ENVIRONMENTS)
            .select('default_strategy')
            .where({
            project_id: projectId,
            environment_name: environment,
        });
        return rows.length > 0 ? rows[0].default_strategy : null;
    }
    async updateDefaultStrategy(projectId, environment, strategy) {
        const rows = await this.db(PROJECT_ENVIRONMENTS)
            .update({
            default_strategy: strategy,
        })
            .where({
            project_id: projectId,
            environment_name: environment,
        })
            .returning('default_strategy');
        return rows[0].default_strategy;
    }
    async count() {
        let count = this.db.from(TABLE).count('*');
        count = count.where(`${TABLE}.archived_at`, null);
        return count.then((res) => Number(res[0].count));
    }
    async getProjectModeCounts() {
        let query = this.db
            .select(this.db.raw(`COALESCE(${SETTINGS_TABLE}.project_mode, 'open') as mode`))
            .count(`${TABLE}.id as count`)
            .from(`${TABLE}`)
            .leftJoin(`${SETTINGS_TABLE}`, `${TABLE}.id`, `${SETTINGS_TABLE}.project`)
            .groupBy(this.db.raw(`COALESCE(${SETTINGS_TABLE}.project_mode, 'open')`));
        query = query.where(`${TABLE}.archived_at`, null);
        const result = await query;
        return result.map(this.mapProjectModeCount);
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    mapProjectModeCount(row) {
        return {
            mode: row.mode,
            count: Number(row.count),
        };
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    mapLinkRow(row) {
        return {
            environmentName: row.environment_name,
            projectId: row.project_id,
        };
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    mapRow(row) {
        if (!row) {
            throw new notfound_error_1.default('No project found');
        }
        return {
            id: row.id,
            name: row.name,
            description: row.description,
            createdAt: row.created_at,
            health: row.health ?? 100,
            updatedAt: row.updated_at || new Date(),
            ...(row.archived_at ? { archivedAt: row.archived_at } : {}),
            mode: row.project_mode || 'open',
            defaultStickiness: row.default_stickiness || 'default',
            featureLimit: row.feature_limit,
            featureNaming: {
                pattern: row.feature_naming_pattern,
                example: row.feature_naming_example,
                description: row.feature_naming_description,
            },
        };
    }
    mapProjectEnvironmentRow(row) {
        return {
            environment: row.environment_name,
            defaultStrategy: row.default_strategy === null
                ? undefined
                : row.default_strategy,
        };
    }
    getAggregatedApplicationsData(rows) {
        const entriesMap = new Map();
        rows.forEach((row) => {
            const { app_name, environment, instance_id, sdk_version } = row;
            let entry = entriesMap.get(app_name);
            if (!entry) {
                entry = {
                    name: app_name,
                    environments: [],
                    instances: [],
                    sdks: [],
                };
                entriesMap.set(app_name, entry);
            }
            if (!entry.environments.includes(environment)) {
                entry.environments.push(environment);
            }
            if (!entry.instances.includes(instance_id)) {
                entry.instances.push(instance_id);
            }
            if (sdk_version) {
                const sdkParts = sdk_version.split(':');
                const sdkName = sdkParts[0];
                const sdkVersion = sdkParts[1] || '';
                let sdk = entry.sdks.find((sdk) => sdk.name === sdkName);
                if (!sdk) {
                    sdk = {
                        name: sdkName,
                        versions: [],
                    };
                    entry.sdks.push(sdk);
                }
                if (sdkVersion && !sdk.versions.includes(sdkVersion)) {
                    sdk.versions.push(sdkVersion);
                }
            }
        });
        entriesMap.forEach((entry) => {
            entry.environments.sort();
            entry.instances.sort();
            entry.sdks.forEach((sdk) => {
                sdk.versions.sort();
            });
            entry.sdks.sort((a, b) => a.name.localeCompare(b.name));
        });
        return Array.from(entriesMap.values());
    }
}
exports.default = ProjectStore;
//# sourceMappingURL=project-store.js.map