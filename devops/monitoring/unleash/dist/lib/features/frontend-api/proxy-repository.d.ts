import EventEmitter from 'events';
import type { RepositoryInterface } from 'unleash-client/lib/repository';
import type { Segment } from 'unleash-client/lib/strategy/strategy';
import type { EnhancedFeatureInterface, FeatureInterface } from 'unleash-client/lib/feature';
import type { IApiUser } from '../../types/api-user';
import type { IUnleashConfig, IUnleashServices, IUnleashStores } from '../../types';
type Config = Pick<IUnleashConfig, 'getLogger' | 'frontendApi' | 'eventBus'>;
type Stores = Pick<IUnleashStores, 'segmentReadModel'>;
type Services = Pick<IUnleashServices, 'featureToggleService' | 'configurationRevisionService'>;
export declare class ProxyRepository extends EventEmitter implements RepositoryInterface {
    private readonly config;
    private readonly logger;
    private readonly stores;
    private readonly services;
    private readonly configurationRevisionService;
    private readonly token;
    private features;
    private segments;
    private interval;
    private timer;
    private running;
    private methodTimer;
    constructor(config: Config, stores: Stores, services: Services, token: IApiUser);
    getTogglesWithSegmentData(): EnhancedFeatureInterface[];
    getSegment(id: number): Segment | undefined;
    getToggle(name: string): FeatureInterface;
    getToggles(): FeatureInterface[];
    start(): Promise<void>;
    stop(): void;
    private dataPolling;
    private loadDataForToken;
    private randomizeDelay;
    private onUpdateRevisionEvent;
    private featuresForToken;
    private segmentsForToken;
    private environmentNameForToken;
}
export {};
//# sourceMappingURL=proxy-repository.d.ts.map