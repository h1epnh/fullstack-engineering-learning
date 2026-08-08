import type { IUnleashConfig } from '../../types';
import type { IntegrationEventsStore, IntegrationEventWriteModel } from './integration-events-store';
import type { IntegrationEventSchema } from '../../openapi/spec/integration-event-schema';
export declare class IntegrationEventsService {
    private readonly logger;
    private integrationEventsStore;
    private flagResolver;
    constructor({ integrationEventsStore, }: {
        integrationEventsStore: IntegrationEventsStore;
    }, { getLogger, flagResolver, }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>);
    getPaginatedEvents(id: number, limit: number, offset: number): Promise<IntegrationEventSchema[]>;
    registerEvent(integrationEvent: IntegrationEventWriteModel): Promise<IntegrationEventSchema>;
    cleanUpEvents(): Promise<void>;
}
//# sourceMappingURL=integration-events-service.d.ts.map