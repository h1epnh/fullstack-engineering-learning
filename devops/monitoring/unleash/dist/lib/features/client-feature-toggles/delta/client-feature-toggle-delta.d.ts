import { type IEventStore, type IFeatureToggleDeltaQuery, type IFeatureToggleQuery, type IFlagResolver, type ISegmentReadModel, type IUnleashConfig } from '../../../types';
import type ConfigurationRevisionService from '../../feature-toggle/configuration-revision-service';
import type { FeatureConfigurationDeltaClient, IClientFeatureToggleDeltaReadModel } from './client-feature-toggle-delta-read-model-type';
import EventEmitter from 'events';
import type { ClientFeaturesDeltaSchema } from '../../../openapi';
import { type DeltaEvent, type DeltaHydrationEvent } from './client-feature-toggle-delta-types';
export declare const UPDATE_DELTA = "UPDATE_DELTA";
export declare const filterEventsByQuery: (events: DeltaEvent[], requiredRevisionId: number, projects: string[], namePrefix: string) => DeltaEvent[];
export declare const filterHydrationEventByQuery: (event: DeltaHydrationEvent, projects: string[], namePrefix: string) => DeltaHydrationEvent;
export declare class ClientFeatureToggleDelta extends EventEmitter {
    private static instance;
    private clientFeatureToggleDeltaReadModel;
    private delta;
    private eventStore;
    private currentRevisionId;
    private flagResolver;
    private configurationRevisionService;
    private readonly segmentReadModel;
    private eventBus;
    private readonly logger;
    constructor(clientFeatureToggleDeltaReadModel: IClientFeatureToggleDeltaReadModel, segmentReadModel: ISegmentReadModel, eventStore: IEventStore, configurationRevisionService: ConfigurationRevisionService, flagResolver: IFlagResolver, config: IUnleashConfig);
    static getInstance(clientFeatureToggleDeltaReadModel: IClientFeatureToggleDeltaReadModel, segmentReadModel: ISegmentReadModel, eventStore: IEventStore, configurationRevisionService: ConfigurationRevisionService, flagResolver: IFlagResolver, config: IUnleashConfig): ClientFeatureToggleDelta;
    getDelta(sdkRevisionId: number | undefined, query: IFeatureToggleQuery): Promise<ClientFeaturesDeltaSchema | undefined>;
    onUpdateRevisionEvent(): Promise<void>;
    /**
     * This is used in client-feature-delta-api.e2e.test.ts, do not remove
     */
    resetDelta(): void;
    private updateFeaturesDelta;
    getChangedToggles(environment: string, toggles: string[]): Promise<FeatureConfigurationDeltaClient[]>;
    private initEnvironmentDelta;
    getClientFeatures(query: IFeatureToggleDeltaQuery): Promise<FeatureConfigurationDeltaClient[]>;
    storeFootprint(): void;
    getCacheSizeInBytes(value: any): number;
}
export type { DeltaEvent };
//# sourceMappingURL=client-feature-toggle-delta.d.ts.map