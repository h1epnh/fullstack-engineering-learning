import type { IFeatureToggleQuery, ISegmentReadModel, IUnleashConfig, IUnleashStores } from '../../types';
import type { FeatureConfigurationClient } from '../feature-toggle/types/feature-toggle-strategies-store-type';
import type { ClientFeatureToggleDelta } from './delta/client-feature-toggle-delta';
import type { ClientFeaturesDeltaSchema } from '../../openapi';
export declare class ClientFeatureToggleService {
    private logger;
    private clientFeatureToggleStore;
    private segmentReadModel;
    private clientFeatureToggleDelta;
    constructor({ clientFeatureToggleStore, }: Pick<IUnleashStores, 'clientFeatureToggleStore'>, segmentReadModel: ISegmentReadModel, clientFeatureToggleCache: ClientFeatureToggleDelta | null, { getLogger }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>);
    getActiveSegmentsForClient(): Promise<import("../../types").IClientSegment[]>;
    getClientDelta(revisionId: number | undefined, query: IFeatureToggleQuery): Promise<ClientFeaturesDeltaSchema | undefined>;
    getClientFeatures(query?: IFeatureToggleQuery): Promise<FeatureConfigurationClient[]>;
}
//# sourceMappingURL=client-feature-toggle-service.d.ts.map