import type { Logger } from '../logger';
import type { IAddonConfig, IAddonDefinition } from '../types/model';
import type { IEvent } from '../types/events';
import type { IntegrationEventsService } from '../features/integration-events/integration-events-service';
import type { IntegrationEventWriteModel } from '../features/integration-events/integration-events-store';
import type EventEmitter from 'events';
import type { IFlagResolver } from '../types';
export default abstract class Addon {
    logger: Logger;
    _name: string;
    _definition: IAddonDefinition;
    integrationEventsService: IntegrationEventsService;
    eventBus: EventEmitter;
    flagResolver: IFlagResolver;
    constructor(definition: IAddonDefinition, { getLogger, integrationEventsService, flagResolver, eventBus, }: IAddonConfig);
    get name(): string;
    get definition(): IAddonDefinition;
    fetchRetry(url: string, options?: any, retries?: number): Promise<Response>;
    abstract handleEvent(event: IEvent, parameters: any, integrationId: number): Promise<void>;
    registerEvent(integrationEvent: IntegrationEventWriteModel): Promise<void>;
    destroy?(): void;
}
//# sourceMappingURL=addon.d.ts.map