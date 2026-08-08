import type EventEmitter from 'events';
import type { FeatureConfigurationDeltaClient, IClientFeatureToggleDeltaReadModel } from './client-feature-toggle-delta-read-model-type';
import type { Db } from '../../../db/db';
import { type IFeatureToggleDeltaQuery } from '../../../internals';
export default class ClientFeatureToggleDeltaReadModel implements IClientFeatureToggleDeltaReadModel {
    private db;
    private timer;
    constructor(db: Db, eventBus: EventEmitter);
    getAll(featureQuery: IFeatureToggleDeltaQuery): Promise<FeatureConfigurationDeltaClient[]>;
    private addSegmentIdsToStrategy;
    private rowToStrategy;
    private isUnseenStrategyRow;
    private addSegmentToStrategy;
}
//# sourceMappingURL=client-feature-toggle-delta-read-model.d.ts.map