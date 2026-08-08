import type { IFeatureToggleClient, IFeatureToggleClientStore, IFeatureToggleQuery, IUnleashConfig } from '../../types';
import type EventEmitter from 'events';
import type { Db } from '../../db/db';
export interface IGetAllFeatures {
    featureQuery?: IFeatureToggleQuery;
    archived: boolean;
    requestType: 'client' | 'admin' | 'playground' | 'frontend';
    userId?: number;
}
export default class FeatureToggleClientStore implements IFeatureToggleClientStore {
    private db;
    private logger;
    private timer;
    private flagResolver;
    constructor(db: Db, eventBus: EventEmitter, { getLogger, flagResolver, }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>);
    private getAll;
    private rowToStrategy;
    private static rowToTag;
    private isUnseenStrategyRow;
    private addTag;
    private isNewTag;
    private addSegmentToStrategy;
    private addSegmentIdsToStrategy;
    getClient(featureQuery?: IFeatureToggleQuery): Promise<IFeatureToggleClient[]>;
    getFrontendApiClient(featureQuery?: IFeatureToggleQuery): Promise<IFeatureToggleClient[]>;
    getPlayground(featureQuery?: IFeatureToggleQuery): Promise<IFeatureToggleClient[]>;
}
//# sourceMappingURL=client-feature-toggle-store.d.ts.map