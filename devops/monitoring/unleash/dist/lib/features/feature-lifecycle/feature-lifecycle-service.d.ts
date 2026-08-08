import { type IAuditUser, type IEnvironmentStore, type IEventStore, type IFeatureEnvironmentStore, type IUnleashConfig } from '../../types';
import type { FeatureLifecycleView, IFeatureLifecycleStore } from './feature-lifecycle-store-type';
import type EventService from '../events/event-service';
import type { FeatureLifecycleCompletedSchema } from '../../openapi';
export declare class FeatureLifecycleService {
    private eventStore;
    private featureLifecycleStore;
    private environmentStore;
    private featureEnvironmentStore;
    private flagResolver;
    private eventBus;
    private eventService;
    private logger;
    constructor({ eventStore, featureLifecycleStore, environmentStore, featureEnvironmentStore, }: {
        eventStore: IEventStore;
        environmentStore: IEnvironmentStore;
        featureLifecycleStore: IFeatureLifecycleStore;
        featureEnvironmentStore: IFeatureEnvironmentStore;
    }, { eventService, }: {
        eventService: EventService;
    }, { flagResolver, eventBus, getLogger, }: Pick<IUnleashConfig, 'flagResolver' | 'eventBus' | 'getLogger'>);
    listen(): void;
    getFeatureLifecycle(feature: string): Promise<FeatureLifecycleView>;
    private featureInitialized;
    private stageReceivedMetrics;
    private recordStagesEntered;
    private featuresReceivedMetrics;
    featureCompleted(feature: string, projectId: string, status: FeatureLifecycleCompletedSchema, auditUser: IAuditUser): Promise<void>;
    featureUncompleted(feature: string, projectId: string, auditUser: IAuditUser): Promise<void>;
    private featureArchived;
    private featureRevived;
}
//# sourceMappingURL=feature-lifecycle-service.d.ts.map