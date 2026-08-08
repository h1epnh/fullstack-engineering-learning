import { type IBaseEvent, type IEvent } from '../../types/events';
import type { LogProvider } from '../../logger';
import type { IEventSearchParams, IEventStore } from '../../types/stores/event-store';
import type { ITag } from '../../types/model';
import type { Db } from '../../db/db';
import type { Knex } from 'knex';
import type EventEmitter from 'events';
import type { DeprecatedSearchEventsSchema, ProjectActivitySchema } from '../../openapi';
import type { IQueryParam } from '../feature-toggle/types/feature-toggle-strategies-store-type';
export type IQueryOperations = IWhereOperation | IBeforeDateOperation | IBetweenDatesOperation | IForFeaturesOperation;
interface IWhereOperation {
    op: 'where';
    parameters: {
        [key: string]: string;
    };
}
interface IBeforeDateOperation {
    op: 'beforeDate';
    parameters: {
        dateAccessor: string;
        date: string;
    };
}
interface IBetweenDatesOperation {
    op: 'betweenDate';
    parameters: {
        dateAccessor: string;
        range: string[];
    };
}
interface IForFeaturesOperation {
    op: 'forFeatures';
    parameters: IForFeaturesParams;
}
interface IForFeaturesParams {
    type: string;
    projectId: string;
    environments: string[];
    features: string[];
}
export interface IEventTable {
    id: number;
    type: string;
    created_by: string;
    created_at: Date;
    created_by_user_id: number;
    data?: any;
    pre_data?: any;
    feature_name?: string;
    project?: string;
    environment?: string;
    tags: ITag[];
    ip?: string;
}
declare class EventStore implements IEventStore {
    private db;
    private eventEmitter;
    private logger;
    constructor(db: Db, getLogger: LogProvider);
    store(event: IBaseEvent): Promise<void>;
    count(): Promise<number>;
    deprecatedFilteredCount(eventSearch: DeprecatedSearchEventsSchema): Promise<number>;
    searchEventsCount(params: IEventSearchParams, queryParams: IQueryParam[]): Promise<number>;
    batchStore(events: IBaseEvent[]): Promise<void>;
    getMaxRevisionId(largerThan?: number): Promise<number>;
    getRevisionRange(start: number, end: number): Promise<IEvent[]>;
    delete(key: number): Promise<void>;
    deleteAll(): Promise<void>;
    destroy(): void;
    exists(key: number): Promise<boolean>;
    query(operations: IQueryOperations[]): Promise<IEvent[]>;
    queryCount(operations: IQueryOperations[]): Promise<number>;
    where(query: Knex.QueryBuilder, parameters: {
        [key: string]: string;
    }): Knex.QueryBuilder;
    beforeDate(query: Knex.QueryBuilder, parameters: {
        dateAccessor: string;
        date: string;
    }): Knex.QueryBuilder;
    betweenDate(query: Knex.QueryBuilder, parameters: {
        dateAccessor: string;
        range: string[];
    }): Knex.QueryBuilder;
    select(): Knex.QueryBuilder;
    forFeatures(query: Knex.QueryBuilder, parameters: IForFeaturesParams): Knex.QueryBuilder;
    get(key: number): Promise<IEvent>;
    getAll(query?: Object): Promise<IEvent[]>;
    getEvents(query?: Object): Promise<IEvent[]>;
    searchEvents(params: IEventSearchParams, queryParams: IQueryParam[], options?: {
        withIp?: boolean;
    }): Promise<IEvent[]>;
    private buildSearchQuery;
    getEventCreators(): Promise<Array<{
        id: number;
        name: string;
    }>>;
    getProjectRecentEventActivity(project: string): Promise<ProjectActivitySchema>;
    deprecatedSearchEvents(search?: DeprecatedSearchEventsSchema): Promise<IEvent[]>;
    rowToEvent(row: IEventTable): IEvent;
    eventToDbRow(e: IBaseEvent): Omit<IEventTable, 'id' | 'created_at'>;
    setMaxListeners(number: number): EventEmitter;
    on(eventName: string | symbol, listener: (...args: any[]) => void): EventEmitter;
    emit(eventName: string | symbol, ...args: any[]): boolean;
    off(eventName: string | symbol, listener: (...args: any[]) => void): EventEmitter;
    setUnannouncedToAnnounced(): Promise<IEvent[]>;
    publishUnannouncedEvents(): Promise<void>;
    setCreatedByUserId(batchSize: number): Promise<number | undefined>;
}
export default EventStore;
//# sourceMappingURL=event-store.d.ts.map