"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const metrics_helper_1 = __importDefault(require("../../util/metrics-helper"));
const metric_events_1 = require("../../metric-events");
const notfound_error_1 = __importDefault(require("../../error/notfound-error"));
const snakeCase_1 = require("../../util/snakeCase");
const COLUMNS = [
    'type',
    'name',
    'created_at',
    'sort_order',
    'enabled',
    'protected',
];
function mapRow(row) {
    return {
        name: row.name,
        type: row.type,
        sortOrder: row.sort_order,
        enabled: row.enabled,
        protected: row.protected,
        requiredApprovals: row.required_approvals,
    };
}
function mapRowWithCounts(row) {
    return {
        ...mapRow(row),
        projectCount: row.project_count
            ? Number.parseInt(row.project_count, 10)
            : 0,
        apiTokenCount: row.api_token_count
            ? Number.parseInt(row.api_token_count, 10)
            : 0,
        enabledToggleCount: row.enabled_toggle_count
            ? Number.parseInt(row.enabled_toggle_count, 10)
            : 0,
    };
}
function mapRowWithProjectCounts(row) {
    return {
        ...mapRow(row),
        projectApiTokenCount: row.project_api_token_count
            ? Number.parseInt(row.project_api_token_count, 10)
            : 0,
        projectEnabledToggleCount: row.project_enabled_toggle_count
            ? Number.parseInt(row.project_enabled_toggle_count, 10)
            : 0,
        defaultStrategy: row.project_default_strategy
            ? row.project_default_strategy
            : undefined,
    };
}
function fieldToRow(env) {
    return {
        name: env.name,
        type: env.type,
        sort_order: env.sortOrder,
        enabled: env.enabled,
        protected: env.protected,
        required_approvals: env.requiredApprovals,
    };
}
const TABLE = 'environments';
class EnvironmentStore {
    constructor(db, eventBus, { getLogger, isOss, flagResolver, }) {
        this.db = db;
        this.logger = getLogger('db/environment-store.ts');
        this.isOss = isOss;
        this.flagResolver = flagResolver;
        this.timer = (action) => metrics_helper_1.default.wrapTimer(eventBus, metric_events_1.DB_TIME, {
            store: 'environment',
            action,
        });
    }
    allColumns() {
        return this.flagResolver.isEnabled('globalChangeRequestConfig')
            ? [...COLUMNS, 'required_approvals']
            : COLUMNS;
    }
    async importEnvironments(environments) {
        const rows = await this.db(TABLE)
            .insert(environments.map(fieldToRow))
            .returning(this.allColumns())
            .onConflict('name')
            .ignore();
        return rows.map(mapRow);
    }
    async deleteAll() {
        await this.db(TABLE).del();
    }
    count() {
        return this.db
            .from(TABLE)
            .count('*')
            .then((res) => Number(res[0].count));
    }
    getMaxSortOrder() {
        return this.db
            .from(TABLE)
            .max('sort_order')
            .then((res) => Number(res[0].max));
    }
    async get(key) {
        const stopTimer = this.timer('get');
        let keyQuery = this.db(TABLE).where({ name: key });
        if (this.isOss) {
            keyQuery = keyQuery.whereIn('name', [
                'default',
                'development',
                'production',
            ]);
        }
        const row = await keyQuery.first();
        stopTimer();
        if (row) {
            return mapRow(row);
        }
        throw new notfound_error_1.default(`Could not find environment with name: ${key}`);
    }
    async getAll(query) {
        const stopTimer = this.timer('getAll');
        let qB = this.db(TABLE)
            .select('*')
            .orderBy([
            { column: 'sort_order', order: 'asc' },
            { column: 'created_at', order: 'asc' },
        ]);
        if (query) {
            qB = qB.where(query);
        }
        if (this.isOss) {
            qB = qB.whereIn('name', ['default', 'development', 'production']);
        }
        const rows = await qB;
        stopTimer();
        return rows.map(mapRow);
    }
    async getAllWithCounts(query) {
        const stopTimer = this.timer('getAllWithCounts');
        let qB = this.db(TABLE)
            .select('*', this.db.raw('(SELECT COUNT(*) FROM project_environments WHERE project_environments.environment_name = environments.name) as project_count'), this.db.raw('(SELECT COUNT(*) FROM api_tokens WHERE api_tokens.environment = environments.name) as api_token_count'), this.db.raw('(SELECT COUNT(*) FROM feature_environments WHERE enabled=true AND feature_environments.environment = environments.name) as enabled_toggle_count'))
            .orderBy([
            { column: 'sort_order', order: 'asc' },
            { column: 'created_at', order: 'asc' },
        ]);
        if (query) {
            qB = qB.where(query);
        }
        if (this.isOss) {
            qB = qB.whereIn('name', ['default', 'development', 'production']);
        }
        const rows = await qB;
        stopTimer();
        return rows.map(mapRowWithCounts);
    }
    async getProjectEnvironments(projectId, query) {
        const stopTimer = this.timer('getProjectEnvironments');
        let qB = this.db(TABLE)
            .select('*', this.db.raw('(SELECT COUNT(*) FROM api_tokens LEFT JOIN api_token_project ON api_tokens.secret = api_token_project.secret WHERE api_tokens.environment = environments.name AND (project = :projectId OR project IS null)) as project_api_token_count', { projectId }), this.db.raw('(SELECT COUNT(*) FROM feature_environments INNER JOIN features on feature_environments.feature_name = features.name WHERE enabled=true AND feature_environments.environment = environments.name AND project = :projectId) as project_enabled_toggle_count', { projectId }), this.db.raw('(SELECT default_strategy FROM project_environments pe WHERE pe.environment_name = environments.name AND pe.project_id = :projectId) as project_default_strategy', { projectId }))
            .orderBy([
            { column: 'sort_order', order: 'asc' },
            { column: 'created_at', order: 'asc' },
        ]);
        if (query) {
            qB = qB.where(query);
        }
        if (this.isOss) {
            qB = qB.whereIn('environments.name', [
                'default',
                'production',
                'development',
            ]);
        }
        const rows = await qB;
        stopTimer();
        return rows.map(mapRowWithProjectCounts);
    }
    async exists(name) {
        const stopTimer = this.timer('exists');
        const result = await this.db.raw(`SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE name = ?) AS present`, [name]);
        stopTimer();
        const { present } = result.rows[0];
        return present;
    }
    async getByName(name) {
        const stopTimer = this.timer('getByName');
        const row = await this.db(TABLE)
            .where({ name })
            .first();
        stopTimer();
        if (!row) {
            throw new notfound_error_1.default(`Could not find environment with name ${name}`);
        }
        return mapRow(row);
    }
    async updateProperty(id, field, value) {
        await this.db(TABLE)
            .update({
            [field]: value,
        })
            .where({ name: id, protected: false });
    }
    async updateSortOrder(id, value) {
        await this.db(TABLE)
            .update({
            sort_order: value,
        })
            .where({ name: id });
    }
    async toggle(name, enabled) {
        await this.db(TABLE)
            .update({
            enabled,
        })
            .where({ name });
    }
    async update(env, name) {
        const updatedEnv = await this.db(TABLE)
            .update((0, snakeCase_1.snakeCaseKeys)(env))
            .where({ name, protected: false })
            .returning(this.allColumns());
        return mapRow(updatedEnv[0]);
    }
    async create(env) {
        const row = await this.db(TABLE)
            .insert((0, snakeCase_1.snakeCaseKeys)(env))
            .returning(this.allColumns());
        return mapRow(row[0]);
    }
    async disable(environments) {
        await this.db(TABLE)
            .update({
            enabled: false,
        })
            .whereIn('name', environments.map((env) => env.name));
    }
    async enable(environments) {
        await this.db(TABLE)
            .update({
            enabled: true,
        })
            .whereIn('name', environments.map((env) => env.name));
    }
    async delete(name) {
        await this.db(TABLE).where({ name, protected: false }).del();
    }
    destroy() { }
}
exports.default = EnvironmentStore;
//# sourceMappingURL=environment-store.js.map