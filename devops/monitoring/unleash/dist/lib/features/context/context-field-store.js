"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notfound_error_1 = __importDefault(require("../../error/notfound-error"));
const COLUMNS = [
    'name',
    'description',
    'stickiness',
    'sort_order',
    'legal_values',
    'created_at',
];
const T = {
    contextFields: 'context_fields',
    featureStrategies: 'feature_strategies',
};
const mapRow = (row) => ({
    name: row.name,
    description: row.description,
    stickiness: row.stickiness,
    sortOrder: row.sort_order,
    legalValues: row.legal_values || [],
    createdAt: row.created_at,
    ...(row.used_in_projects && {
        usedInProjects: Number(row.used_in_projects),
    }),
    ...(row.used_in_features && {
        usedInFeatures: Number(row.used_in_features),
    }),
});
class ContextFieldStore {
    constructor(db, getLogger, flagResolver) {
        this.db = db;
        this.flagResolver = flagResolver;
        this.logger = getLogger('context-field-store.ts');
    }
    prefixColumns(columns = COLUMNS) {
        return columns.map((c) => `${T.contextFields}.${c}`);
    }
    fieldToRow(data) {
        return {
            name: data.name,
            description: data.description,
            stickiness: data.stickiness || false,
            sort_order: data.sortOrder || 0,
            legal_values: JSON.stringify(data.legalValues || []),
        };
    }
    async getAll() {
        const rows = await this.db
            .select(this.prefixColumns(), 'used_in_projects', 'used_in_features')
            .countDistinct(`${T.featureStrategies}.project_name AS used_in_projects`)
            .countDistinct(`${T.featureStrategies}.feature_name AS used_in_features`)
            .from(T.contextFields)
            .joinRaw(`LEFT JOIN ${T.featureStrategies} ON EXISTS (
                        SELECT 1
                        FROM jsonb_array_elements(${T.featureStrategies}.constraints) AS elem
                        WHERE elem ->> 'contextName' = ${T.contextFields}.name
                      )`)
            .groupBy(this.prefixColumns(COLUMNS.filter((column) => column !== 'legal_values')))
            .orderBy('name', 'asc');
        return rows.map(mapRow);
    }
    async get(key) {
        const row = await this.db
            .first(COLUMNS)
            .from(T.contextFields)
            .where({ name: key });
        if (!row) {
            throw new notfound_error_1.default(`Could not find Context field with name ${key}`);
        }
        return mapRow(row);
    }
    async deleteAll() {
        await this.db(T.contextFields).del();
    }
    destroy() { }
    async exists(key) {
        const result = await this.db.raw(`SELECT EXISTS (SELECT 1 FROM ${T.contextFields} WHERE name = ?) AS present`, [key]);
        const { present } = result.rows[0];
        return present;
    }
    // TODO: write tests for the changes you made here?
    async create(contextField) {
        const [row] = await this.db(T.contextFields)
            .insert(this.fieldToRow(contextField))
            .returning('*');
        return mapRow(row);
    }
    async update(data) {
        const [row] = await this.db(T.contextFields)
            .where({ name: data.name })
            .update(this.fieldToRow(data))
            .returning('*');
        return mapRow(row);
    }
    async delete(name) {
        return this.db(T.contextFields).where({ name }).del();
    }
    async count() {
        return this.db(T.contextFields)
            .count('*')
            .then((res) => Number(res[0].count));
    }
}
exports.default = ContextFieldStore;
//# sourceMappingURL=context-field-store.js.map