import type { IUnleashConfig } from '../../types/option';
import type { IUnleashStores } from '../../types/stores';
import type { IEventSearchParams } from '../../types/stores/event-store';
import type { IBaseEvent, IEventList } from '../../types/events';
import type { DeprecatedSearchEventsSchema } from '../../openapi/spec/deprecated-search-events-schema';
import type EventEmitter from 'events';
import type { IApiUser, IUser } from '../../types';
import type { IQueryParam } from '../feature-toggle/types/feature-toggle-strategies-store-type';
import type { IPrivateProjectChecker } from '../private-project/privateProjectCheckerType';
import type { ProjectAccess } from '../private-project/privateProjectStore';
import type { IAccessReadModel } from '../access/access-read-model-type';
export default class EventService {
    private logger;
    private eventStore;
    private featureTagStore;
    private accessReadModel;
    private privateProjectChecker;
    private eventBus;
    private isEnterprise;
    constructor({ eventStore, featureTagStore, }: Pick<IUnleashStores, 'eventStore' | 'featureTagStore'>, { getLogger, eventBus, isEnterprise, }: Pick<IUnleashConfig, 'getLogger' | 'eventBus' | 'isEnterprise'>, privateProjectChecker: IPrivateProjectChecker, accessReadModel: IAccessReadModel);
    getEvents(): Promise<IEventList>;
    deprecatedSearchEvents(search: DeprecatedSearchEventsSchema): Promise<IEventList>;
    searchEvents(search: IEventSearchParams, userId: number): Promise<IEventList>;
    onEvent(eventName: string | symbol, listener: (...args: any[]) => void): Promise<EventEmitter>;
    private enhanceEventsWithTags;
    isAdminToken(user: IUser | IApiUser): boolean;
    storeEvent(event: IBaseEvent): Promise<void>;
    storeEvents(events: IBaseEvent[]): Promise<void>;
    setEventCreatedByUserId(): Promise<void>;
    convertToDbParams: (params: IEventSearchParams) => IQueryParam[];
    getEventCreators(): Promise<{
        id: number;
        name: string;
    }[]>;
    getProjectFilterForNonAdmins(userId: number): Promise<IQueryParam[]>;
}
export declare const filterAccessibleProjects: (projectParam: string | undefined, projectAccess: ProjectAccess) => string | undefined;
//# sourceMappingURL=event-service.d.ts.map