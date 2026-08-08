import EventEmitter from 'events';
import type { RepositoryInterface } from 'unleash-client/lib/repository';
import type { Segment } from 'unleash-client/lib/strategy/strategy';
import type { EnhancedFeatureInterface, FeatureInterface } from 'unleash-client/lib/feature';
import type { IApiUser } from '../../types/api-user';
import type { IUnleashConfig } from '../../types';
import type { GlobalFrontendApiCache } from './global-frontend-api-cache';
type Config = Pick<IUnleashConfig, 'getLogger'>;
export declare class FrontendApiRepository extends EventEmitter implements RepositoryInterface {
    private readonly config;
    private readonly logger;
    private readonly token;
    private globalFrontendApiCache;
    private running;
    constructor(config: Config, globalFrontendApiCache: GlobalFrontendApiCache, token: IApiUser);
    getTogglesWithSegmentData(): EnhancedFeatureInterface[];
    getSegment(id: number): Segment | undefined;
    getToggle(name: string): FeatureInterface;
    getToggles(): FeatureInterface[];
    start(): Promise<void>;
    stop(): void;
}
export {};
//# sourceMappingURL=frontend-api-repository.d.ts.map