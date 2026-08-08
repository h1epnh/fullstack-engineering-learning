import type { Request, Response } from 'express';
import type { IUnleashConfig } from '../../types/option';
import type { IUnleashServices } from '../../types/services';
import type { IEvent } from '../../types/events';
import Controller from '../controller';
import { type EventsSchema } from '../../../lib/openapi/spec/events-schema';
import { type FeatureEventsSchema } from '../../../lib/openapi/spec/feature-events-schema';
import type { DeprecatedSearchEventsSchema } from '../../openapi/spec/deprecated-search-events-schema';
import type { IAuthRequest } from '../unleash-types';
import { type ProjectFlagCreatorsSchema } from '../../openapi';
export default class EventController extends Controller {
    private eventService;
    private flagResolver;
    private openApiService;
    constructor(config: IUnleashConfig, { eventService, openApiService, }: Pick<IUnleashServices, 'eventService' | 'openApiService'>);
    maybeAnonymiseEvents(events: IEvent[]): IEvent[];
    getEvents(req: Request<any, any, any, {
        project?: string;
    }>, res: Response<EventsSchema>): Promise<void>;
    getEventsForToggle(req: Request<{
        featureName: string;
    }>, res: Response<FeatureEventsSchema>): Promise<void>;
    deprecatedSearchEvents(req: Request<unknown, unknown, DeprecatedSearchEventsSchema>, res: Response<EventsSchema>): Promise<void>;
    getEventCreators(req: IAuthRequest, res: Response<ProjectFlagCreatorsSchema>): Promise<void>;
}
//# sourceMappingURL=event.d.ts.map