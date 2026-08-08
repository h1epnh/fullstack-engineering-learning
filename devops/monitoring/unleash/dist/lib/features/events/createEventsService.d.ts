import type { Db } from '../../db/db';
import { EventService } from '../../services';
import type { IEventStore, IFeatureTagStore, IUnleashConfig } from '../../types';
export declare const createEventsService: (db: Db, config: IUnleashConfig) => EventService;
export declare const createFakeEventsService: (config: IUnleashConfig, stores?: {
    eventStore?: IEventStore;
    featureTagStore?: IFeatureTagStore;
}) => EventService;
//# sourceMappingURL=createEventsService.d.ts.map