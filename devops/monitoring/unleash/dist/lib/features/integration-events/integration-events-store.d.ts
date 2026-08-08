import { CRUDStore, type CrudStoreConfig } from '../../db/crud/crud-store';
import type { Row } from '../../db/crud/row-type';
import type { Db } from '../../db/db';
import type { IntegrationEventSchema } from '../../openapi/spec/integration-event-schema';
export type IntegrationEventWriteModel = Omit<IntegrationEventSchema, 'id' | 'createdAt'>;
export type IntegrationEventState = IntegrationEventWriteModel['state'];
export declare class IntegrationEventsStore extends CRUDStore<IntegrationEventSchema, IntegrationEventWriteModel, Row<IntegrationEventSchema>, Row<IntegrationEventWriteModel>, string> {
    constructor(db: Db, config: CrudStoreConfig);
    getPaginatedEvents(id: number, limit: number, offset: number): Promise<IntegrationEventSchema[]>;
    cleanUpEvents(): Promise<void>;
}
//# sourceMappingURL=integration-events-store.d.ts.map