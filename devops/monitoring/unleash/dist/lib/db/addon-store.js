"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const metrics_helper_1 = __importDefault(require("../util/metrics-helper"));
const metric_events_1 = require("../metric-events");
const notfound_error_1 = __importDefault(require("../error/notfound-error"));
const COLUMNS = [
    'id',
    'provider',
    'enabled',
    'description',
    'parameters',
    'events',
    'projects',
    'environments',
    'created_at',
];
const TABLE = 'addons';
class AddonStore {
    constructor(db, eventBus, getLogger) {
        this.db = db;
        this.logger = getLogger('addons-store.ts');
        this.timer = (action) => metrics_helper_1.default.wrapTimer(eventBus, metric_events_1.DB_TIME, {
            store: 'addons',
            action,
        });
    }
    destroy() { }
    async getAll(query = {}) {
        const stopTimer = this.timer('getAll');
        const rows = await this.db.select(COLUMNS).where(query).from(TABLE);
        stopTimer();
        return rows.map(this.rowToAddon);
    }
    async get(id) {
        const stopTimer = this.timer('get');
        return this.db
            .first(COLUMNS)
            .from(TABLE)
            .where({ id })
            .then((row) => {
            stopTimer();
            if (!row) {
                throw new notfound_error_1.default('Could not find addon');
            }
            else {
                return this.rowToAddon(row);
            }
        });
    }
    async insert(addon) {
        const stopTimer = this.timer('insert');
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const rows = await this.db(TABLE).insert(this.addonToRow(addon), [
            'id',
            'created_at',
        ]);
        stopTimer();
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const { id, created_at } = rows[0];
        return this.rowToAddon({ id, createdAt: created_at, ...addon });
    }
    async update(id, addon) {
        const rows = await this.db(TABLE)
            .where({ id })
            .update(this.addonToRow(addon))
            .returning(COLUMNS);
        if (!rows) {
            throw new notfound_error_1.default('Could not find addon');
        }
        return this.rowToAddon(rows[0]);
    }
    async delete(id) {
        const rows = await this.db(TABLE).where({ id }).del();
        if (!rows) {
            throw new notfound_error_1.default('Could not find addon');
        }
    }
    async deleteAll() {
        await this.db(TABLE).del();
    }
    async exists(id) {
        const stopTimer = this.timer('exists');
        const result = await this.db.raw(`SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE id = ?) AS present`, [id]);
        const { present } = result.rows[0];
        stopTimer();
        return present;
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    rowToAddon(row) {
        return {
            id: row.id,
            provider: row.provider,
            enabled: row.enabled,
            description: row.description ?? null,
            parameters: row.parameters,
            events: row.events,
            projects: row.projects || [],
            environments: row.environments || [],
            createdAt: row.created_at,
        };
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    addonToRow(addon) {
        return {
            provider: addon.provider,
            enabled: addon.enabled,
            description: addon.description,
            parameters: JSON.stringify(addon.parameters),
            events: JSON.stringify(addon.events),
            projects: JSON.stringify(addon.projects || []),
            environments: JSON.stringify(addon.environments || []),
        };
    }
}
exports.default = AddonStore;
//# sourceMappingURL=addon-store.js.map