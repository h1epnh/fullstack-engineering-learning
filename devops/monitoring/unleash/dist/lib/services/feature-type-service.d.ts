import type { IUnleashStores } from '../types/stores';
import type { IUnleashConfig } from '../types/option';
import type { IFeatureType } from '../types/stores/feature-type-store';
import type EventService from '../features/events/event-service';
import { type IAuditUser } from '../types';
export default class FeatureTypeService {
    private featureTypeStore;
    private eventService;
    private logger;
    constructor({ featureTypeStore }: Pick<IUnleashStores, 'featureTypeStore'>, { getLogger }: Pick<IUnleashConfig, 'getLogger'>, eventService: EventService);
    getAll(): Promise<IFeatureType[]>;
    updateLifetime(id: string, newLifetimeDays: number | null, auditUser: IAuditUser): Promise<IFeatureType>;
}
//# sourceMappingURL=feature-type-service.d.ts.map