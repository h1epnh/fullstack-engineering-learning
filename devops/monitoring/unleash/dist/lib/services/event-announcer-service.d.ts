import type { IUnleashConfig } from '../types/option';
import type { IUnleashStores } from '../types/stores';
export default class EventAnnouncer {
    private logger;
    private eventStore;
    private flagResolver;
    constructor({ eventStore }: Pick<IUnleashStores, 'eventStore'>, { getLogger, flagResolver, }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>);
    publishUnannouncedEvents(): Promise<void>;
}
//# sourceMappingURL=event-announcer-service.d.ts.map