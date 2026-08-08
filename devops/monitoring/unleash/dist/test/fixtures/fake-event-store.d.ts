import type { IEventStore } from '../../lib/types/stores/event-store';
import type { IBaseEvent, IEvent } from '../../lib/types/events';
import type { IQueryOperations } from '../../lib/features/events/event-store';
import type { DeprecatedSearchEventsSchema, ProjectActivitySchema } from '../../lib/openapi';
import type EventEmitter from 'events';
declare class FakeEventStore implements IEventStore {
    events: IEvent[];
    private eventEmitter;
    constructor();
    getRevisionRange(start: number, end: number): Promise<IEvent[]>;
    getProjectRecentEventActivity(project: string): Promise<ProjectActivitySchema>;
    getEventCreators(): Promise<{
        id: number;
        name: string;
    }[]>;
    getMaxRevisionId(): Promise<number>;
    store(event: IBaseEvent): Promise<void>;
    batchStore(events: IBaseEvent[]): Promise<void>;
    getEvents(): Promise<IEvent[]>;
    delete(key: number): Promise<void>;
    deleteAll(): Promise<void>;
    count(): Promise<number>;
    searchEventsCount(): Promise<number>;
    deprecatedFilteredCount(search: DeprecatedSearchEventsSchema): Promise<number>;
    destroy(): void;
    exists(key: number): Promise<boolean>;
    get(key: number): Promise<IEvent>;
    getAll(): Promise<IEvent[]>;
    deprecatedSearchEvents(): Promise<IEvent[]>;
    searchEvents(): Promise<IEvent[]>;
    query(operations: IQueryOperations[]): Promise<IEvent[]>;
    queryCount(operations: IQueryOperations[]): Promise<number>;
    setMaxListeners(number: number): EventEmitter;
    on(eventName: string | symbol, listener: (...args: any[]) => void): EventEmitter;
    emit(eventName: string | symbol, ...args: any[]): boolean;
    off(eventName: string | symbol, listener: (...args: any[]) => void): EventEmitter;
    publishUnannouncedEvents(): Promise<void>;
    setCreatedByUserId(batchSize: number): Promise<number | undefined>;
}
export default FakeEventStore;
//# sourceMappingURL=fake-event-store.d.ts.map