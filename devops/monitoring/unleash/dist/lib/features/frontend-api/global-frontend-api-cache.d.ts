import EventEmitter from 'events';
import type { Segment } from 'unleash-client/lib/strategy/strategy';
import type { FeatureInterface } from 'unleash-client/lib/feature';
import type { IApiUser } from '../../types/api-user';
import type { ISegmentReadModel, IUnleashConfig } from '../../types';
import type { IClientFeatureToggleReadModel } from './client-feature-toggle-read-model-type';
type Config = Pick<IUnleashConfig, 'getLogger' | 'flagResolver' | 'eventBus'>;
export type GlobalFrontendApiCacheState = 'starting' | 'ready' | 'updated';
export declare class GlobalFrontendApiCache extends EventEmitter {
    private readonly config;
    private readonly logger;
    private readonly clientFeatureToggleReadModel;
    private readonly segmentReadModel;
    private readonly configurationRevisionService;
    private featuresByEnvironment;
    private segments;
    private status;
    private timer;
    constructor(config: Config, segmentReadModel: ISegmentReadModel, clientFeatureToggleReadModel: IClientFeatureToggleReadModel, configurationRevisionService: EventEmitter);
    getSegment(id: number): Segment | undefined;
    getToggle(name: string, token: IApiUser): FeatureInterface;
    getToggles(token: IApiUser): FeatureInterface[];
    private filterTogglesByProjects;
    private getTogglesByEnvironment;
    refreshData(): Promise<void>;
    private getAllFeatures;
    private getAllSegments;
    private onUpdateRevisionEvent;
    private environmentNameForToken;
    private mapFeatures;
}
export {};
//# sourceMappingURL=global-frontend-api-cache.d.ts.map