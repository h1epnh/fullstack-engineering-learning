import type { Response } from 'express';
import type { IUnleashConfig } from '../../types/option';
import type { IUnleashServices } from '../../types/services';
import { type EventSearchQueryParameters } from '../../openapi/spec/event-search-query-parameters';
import { type EventSearchResponseSchema } from '../../openapi';
import Controller from '../../routes/controller';
import type { IAuthRequest } from '../../server-impl';
import type { IEnrichedEvent, IEvent } from '../../types';
export default class EventSearchController extends Controller {
    private eventService;
    private flagResolver;
    private msgFormatter;
    private openApiService;
    constructor(config: IUnleashConfig, { eventService, openApiService, }: Pick<IUnleashServices, 'eventService' | 'openApiService'>);
    searchEvents(req: IAuthRequest<any, any, any, EventSearchQueryParameters>, res: Response<EventSearchResponseSchema>): Promise<void>;
    enrichEvents(events: IEvent[]): IEvent[] | IEnrichedEvent[];
    maybeAnonymiseEvents(events: IEvent[]): IEvent[];
}
//# sourceMappingURL=event-search-controller.d.ts.map