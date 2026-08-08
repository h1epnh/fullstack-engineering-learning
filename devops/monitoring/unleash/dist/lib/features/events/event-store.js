"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("../../types/events");
const anyEventEmitter_1 = require("../../util/anyEventEmitter");
const types_1 = require("../../types");
const search_utils_1 = require("../feature-search/search-utils");
const EVENT_COLUMNS = [
    'id',
    'type',
    'created_by',
    'created_at',
    'created_by_user_id',
    'data',
    'pre_data',
    'tags',
    'feature_name',
    'project',
    'environment',
];
const TABLE = 'events';
class EventStore {
    // a new DB has to be injected per transaction
    constructor(db, getLogger) {
        // only one shared event emitter should exist across all event store instances
        this.eventEmitter = anyEventEmitter_1.sharedEventEmitter;
        this.db = db;
        this.logger = getLogger('event-store');
    }
    async store(event) {
        try {
            await this.db(TABLE)
                .insert(this.eventToDbRow(event))
                .returning(EVENT_COLUMNS);
        }
        catch (error) {
            this.logger.warn(`Failed to store "${event.type}" event: ${error}`);
        }
    }
    async count() {
        const count = await this.db(TABLE)
            .count()
            .first();
        if (!count) {
            return 0;
        }
        if (typeof count.count === 'string') {
            return Number.parseInt(count.count, 10);
        }
        else {
            return count.count;
        }
    }
    async deprecatedFilteredCount(eventSearch) {
        let query = this.db(TABLE);
        if (eventSearch.type) {
            query = query.andWhere({ type: eventSearch.type });
        }
        if (eventSearch.project) {
            query = query.andWhere({ project: eventSearch.project });
        }
        if (eventSearch.feature) {
            query = query.andWhere({ feature_name: eventSearch.feature });
        }
        const count = await query.count().first();
        if (!count) {
            return 0;
        }
        if (typeof count.count === 'string') {
            return Number.parseInt(count.count, 10);
        }
        else {
            return count.count;
        }
    }
    async searchEventsCount(params, queryParams) {
        const query = this.buildSearchQuery(params, queryParams);
        const count = await query.count().first();
        if (!count) {
            return 0;
        }
        if (typeof count.count === 'string') {
            return Number.parseInt(count.count, 10);
        }
        else {
            return count.count;
        }
    }
    async batchStore(events) {
        try {
            await this.db(TABLE).insert(events.map(this.eventToDbRow));
        }
        catch (error) {
            this.logger.warn(`Failed to store events: ${JSON.stringify(events)}`, error);
        }
    }
    async getMaxRevisionId(largerThan = 0) {
        const row = await this.db(TABLE)
            .max('id')
            .where((builder) => builder
            .whereNotNull('feature_name')
            .orWhereIn('type', [
            events_1.SEGMENT_UPDATED,
            events_1.FEATURE_IMPORT,
            events_1.FEATURES_IMPORTED,
        ]))
            .andWhere('id', '>=', largerThan)
            .first();
        return row?.max ?? 0;
    }
    async getRevisionRange(start, end) {
        const query = this.db
            .select(EVENT_COLUMNS)
            .from(TABLE)
            .where('id', '>', start)
            .andWhere('id', '<=', end)
            .andWhere((builder) => builder
            .whereNotNull('feature_name')
            .orWhereIn('type', [
            events_1.SEGMENT_UPDATED,
            events_1.FEATURE_IMPORT,
            events_1.FEATURES_IMPORTED,
            events_1.SEGMENT_CREATED,
            events_1.SEGMENT_DELETED,
        ]))
            .orderBy('id', 'asc');
        const rows = await query;
        return rows.map(this.rowToEvent);
    }
    async delete(key) {
        await this.db(TABLE).where({ id: key }).del();
    }
    async deleteAll() {
        await this.db(TABLE).del();
    }
    destroy() { }
    async exists(key) {
        const result = await this.db.raw(`SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE id = ?) AS present`, [key]);
        const { present } = result.rows[0];
        return present;
    }
    async query(operations) {
        try {
            let query = this.select();
            operations.forEach((operation) => {
                if (operation.op === 'where') {
                    query = this.where(query, operation.parameters);
                }
                if (operation.op === 'forFeatures') {
                    query = this.forFeatures(query, operation.parameters);
                }
                if (operation.op === 'beforeDate') {
                    query = this.beforeDate(query, operation.parameters);
                }
                if (operation.op === 'betweenDate') {
                    query = this.betweenDate(query, operation.parameters);
                }
            });
            const rows = await query;
            return rows.map(this.rowToEvent);
        }
        catch (e) {
            return [];
        }
    }
    async queryCount(operations) {
        try {
            let query = this.db.count().from(TABLE);
            operations.forEach((operation) => {
                if (operation.op === 'where') {
                    query = this.where(query, operation.parameters);
                }
                if (operation.op === 'forFeatures') {
                    query = this.forFeatures(query, operation.parameters);
                }
                if (operation.op === 'beforeDate') {
                    query = this.beforeDate(query, operation.parameters);
                }
                if (operation.op === 'betweenDate') {
                    query = this.betweenDate(query, operation.parameters);
                }
            });
            const queryResult = await query.first();
            return Number.parseInt(queryResult.count || 0);
        }
        catch (e) {
            return 0;
        }
    }
    where(query, parameters) {
        return query.where(parameters);
    }
    beforeDate(query, parameters) {
        return query.andWhere(parameters.dateAccessor, '>=', parameters.date);
    }
    betweenDate(query, parameters) {
        if (parameters.range && parameters.range.length === 2) {
            return query.andWhereBetween(parameters.dateAccessor, [
                parameters.range[0],
                parameters.range[1],
            ]);
        }
        return query;
    }
    select() {
        return this.db.select(EVENT_COLUMNS).from(TABLE);
    }
    forFeatures(query, parameters) {
        return query
            .where({ type: parameters.type, project: parameters.projectId })
            .whereIn('feature_name', parameters.features)
            .whereIn('environment', parameters.environments);
    }
    async get(key) {
        const row = await this.db(TABLE).where({ id: key }).first();
        return this.rowToEvent(row);
    }
    async getAll(query) {
        return this.getEvents(query);
    }
    async getEvents(query) {
        try {
            let qB = this.db
                .select(EVENT_COLUMNS)
                .from(TABLE)
                .limit(100)
                .orderBy('created_at', 'desc');
            if (query) {
                qB = qB.where(query);
            }
            const rows = await qB;
            return rows.map(this.rowToEvent);
        }
        catch (err) {
            return [];
        }
    }
    async searchEvents(params, queryParams, options) {
        const query = this.buildSearchQuery(params, queryParams)
            .select(options?.withIp ? [...EVENT_COLUMNS, 'ip'] : EVENT_COLUMNS)
            .orderBy('created_at', 'desc')
            .limit(Number(params.limit) ?? 100)
            .offset(Number(params.offset) ?? 0);
        try {
            return (await query).map((row) => options?.withIp
                ? { ...this.rowToEvent(row), ip: row.ip }
                : this.rowToEvent(row));
        }
        catch (err) {
            return [];
        }
    }
    buildSearchQuery(params, queryParams) {
        let query = this.db.from(TABLE);
        (0, search_utils_1.applyGenericQueryParams)(query, queryParams);
        if (params.query) {
            query = query.where((where) => where
                .orWhereRaw('data::text ILIKE ?', `%${params.query}%`)
                .orWhereRaw('tags::text ILIKE ?', `%${params.query}%`)
                .orWhereRaw('pre_data::text ILIKE ?', `%${params.query}%`));
        }
        return query;
    }
    async getEventCreators() {
        const query = this.db('events')
            .distinctOn('events.created_by_user_id')
            .leftJoin('users', 'users.id', '=', 'events.created_by_user_id')
            .select([
            'events.created_by_user_id as id',
            this.db.raw(`
            CASE
                WHEN events.created_by_user_id = -1337 THEN '${types_1.SYSTEM_USER.name}'
                WHEN events.created_by_user_id = -42 THEN '${types_1.ADMIN_TOKEN_USER.name}'
                ELSE COALESCE(users.name, events.created_by)
            END as name
        `),
            'users.username',
            'users.email',
        ]);
        const result = await query;
        return result
            .filter((row) => row.name || row.username || row.email)
            .map((row) => ({
            id: Number(row.id),
            name: String(row.name || row.username || row.email),
        }));
    }
    async getProjectRecentEventActivity(project) {
        const result = await this.db('events')
            .select(this.db.raw("TO_CHAR(created_at::date, 'YYYY-MM-DD') AS date"))
            .count('* AS count')
            .where('project', project)
            .andWhere('created_at', '>=', this.db.raw("NOW() - INTERVAL '1 year'"))
            .groupBy(this.db.raw("TO_CHAR(created_at::date, 'YYYY-MM-DD')"))
            .orderBy('date', 'asc');
        return result.map((row) => ({
            date: row.date,
            count: Number(row.count),
        }));
    }
    async deprecatedSearchEvents(search = {}) {
        let query = this.db
            .select(EVENT_COLUMNS)
            .from(TABLE)
            .limit(search.limit ?? 100)
            .offset(search.offset ?? 0)
            .orderBy('created_at', 'desc');
        if (search.type) {
            query = query.andWhere({
                type: search.type,
            });
        }
        if (search.project) {
            query = query.andWhere({
                project: search.project,
            });
        }
        if (search.feature) {
            query = query.andWhere({
                feature_name: search.feature,
            });
        }
        if (search.query) {
            query = query.where((where) => where
                .orWhereRaw('type::text ILIKE ?', `%${search.query}%`)
                .orWhereRaw('created_by::text ILIKE ?', `%${search.query}%`)
                .orWhereRaw('data::text ILIKE ?', `%${search.query}%`)
                .orWhereRaw('tags::text ILIKE ?', `%${search.query}%`)
                .orWhereRaw('pre_data::text ILIKE ?', `%${search.query}%`));
        }
        try {
            return (await query).map(this.rowToEvent);
        }
        catch (err) {
            return [];
        }
    }
    rowToEvent(row) {
        return {
            id: row.id,
            type: row.type,
            createdBy: row.created_by,
            createdAt: row.created_at,
            createdByUserId: row.created_by_user_id,
            data: row.data,
            preData: row.pre_data,
            tags: row.tags || [],
            featureName: row.feature_name,
            project: row.project,
            environment: row.environment,
        };
    }
    eventToDbRow(e) {
        return {
            type: e.type,
            created_by: e.createdBy ?? 'admin',
            created_by_user_id: e.createdByUserId,
            data: Array.isArray(e.data) ? JSON.stringify(e.data) : e.data,
            pre_data: Array.isArray(e.preData)
                ? JSON.stringify(e.preData)
                : e.preData,
            // @ts-expect-error workaround for json-array
            tags: JSON.stringify(e.tags),
            feature_name: e.featureName,
            project: e.project,
            environment: e.environment,
            ip: e.ip,
        };
    }
    setMaxListeners(number) {
        return this.eventEmitter.setMaxListeners(number);
    }
    on(eventName, listener) {
        return this.eventEmitter.on(eventName, listener);
    }
    emit(eventName, ...args) {
        return this.eventEmitter.emit(eventName, ...args);
    }
    off(eventName, listener) {
        return this.eventEmitter.off(eventName, listener);
    }
    async setUnannouncedToAnnounced() {
        const rows = await this.db(TABLE)
            .update({ announced: true })
            .where('announced', false)
            .returning(EVENT_COLUMNS);
        return rows.map(this.rowToEvent);
    }
    async publishUnannouncedEvents() {
        const events = await this.setUnannouncedToAnnounced();
        events.forEach((e) => this.eventEmitter.emit(e.type, e));
    }
    async setCreatedByUserId(batchSize) {
        const API_TOKEN_TABLE = 'api_tokens';
        const toUpdate = await this.db(`${TABLE} as e`)
            .joinRaw('LEFT OUTER JOIN users AS u ON e.created_by = u.username OR e.created_by = u.email')
            .joinRaw(`LEFT OUTER JOIN ${API_TOKEN_TABLE} AS t on e.created_by = t.username`)
            .whereRaw(`e.created_by_user_id IS null AND
                 e.created_by IS NOT null AND
                (u.id IS NOT null OR
                  t.username IS NOT null OR
                  e.created_by in ('unknown', 'migration', 'init-api-tokens')
                )`)
            .orderBy('e.created_at', 'desc')
            .limit(batchSize)
            .select(['e.*', 'u.id AS userid', 't.username']);
        const updatePromises = toUpdate.map(async (row) => {
            if (row.created_by === 'unknown' ||
                row.created_by === 'migration' ||
                (row.created_by === 'init-api-tokens' &&
                    row.type === 'api-token-created')) {
                return this.db(TABLE)
                    .update({ created_by_user_id: types_1.SYSTEM_USER_ID })
                    .where({ id: row.id });
            }
            if (row.userid) {
                return this.db(TABLE)
                    .update({ created_by_user_id: row.userid })
                    .where({ id: row.id });
            }
            if (row.username) {
                return this.db(TABLE)
                    .update({ created_by_user_id: types_1.ADMIN_TOKEN_USER.id })
                    .where({ id: row.id });
            }
            this.logger.warn(`Could not find user for event ${row.id}`);
            return Promise.resolve();
        });
        await Promise.all(updatePromises);
        return toUpdate.length;
    }
}
exports.default = EventStore;
//# sourceMappingURL=event-store.js.map