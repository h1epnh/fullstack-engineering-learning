import type { IUnleashConfig } from '../types/option';
import type { IUnleashStores } from '../types/stores';
import type EventService from '../features/events/event-service';
import type { IAuditUser } from '../types';
export default class SettingService {
    private config;
    private logger;
    private settingStore;
    private eventService;
    constructor({ settingStore }: Pick<IUnleashStores, 'settingStore'>, config: IUnleashConfig, eventService: EventService);
    /**
     * @deprecated use getWithDefault instead
     */
    get<T>(id: string, defaultValue?: T): Promise<T | undefined>;
    getWithDefault<T>(id: string, defaultValue: T): Promise<T>;
    insert(id: string, value: object, auditUser: IAuditUser, hideEventDetails?: boolean): Promise<void>;
    delete(id: string, auditUser: IAuditUser): Promise<void>;
    deleteAll(): Promise<void>;
}
//# sourceMappingURL=setting-service.d.ts.map