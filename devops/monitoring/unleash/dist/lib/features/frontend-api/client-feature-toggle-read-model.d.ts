import type { IFeatureToggleClient } from '../../types';
import type { Db } from '../../db/db';
import type EventEmitter from 'events';
import type { IClientFeatureToggleReadModel } from './client-feature-toggle-read-model-type';
export default class ClientFeatureToggleReadModel implements IClientFeatureToggleReadModel {
    private db;
    private timer;
    constructor(db: Db, eventBus: EventEmitter);
    getAll(): Promise<Record<string, Record<string, IFeatureToggleClient>>>;
    getAggregatedData(rows: any): Record<string, Record<string, IFeatureToggleClient>>;
    private addSegmentIdsToStrategy;
    private rowToStrategy;
    private isUnseenStrategyRow;
}
//# sourceMappingURL=client-feature-toggle-read-model.d.ts.map