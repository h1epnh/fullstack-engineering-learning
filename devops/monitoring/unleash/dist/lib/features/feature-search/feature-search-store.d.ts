import type EventEmitter from 'events';
import type { LogProvider } from '../../logger';
import type { IFeatureSearchOverview, IFeatureSearchStore, IFlagResolver } from '../../types';
import type { Db } from '../../db/db';
import type { IFeatureSearchParams, IQueryParam } from '../feature-toggle/types/feature-toggle-strategies-store-type';
declare class FeatureSearchStore implements IFeatureSearchStore {
    private db;
    private logger;
    private readonly timer;
    private flagResolver;
    constructor(db: Db, eventBus: EventEmitter, getLogger: LogProvider, flagResolver: IFlagResolver);
    private static getEnvironment;
    private getLatestLifecycleStageQuery;
    searchFeatures({ userId, searchParams, status, offset, limit, sortOrder, sortBy, archived, favoritesFirst, }: IFeatureSearchParams, queryParams: IQueryParam[]): Promise<{
        features: IFeatureSearchOverview[];
        total: number;
    }>;
    private queryExtraData;
    private queryMetrics;
    private queryStrategiesByEnvironment;
    private buildRankingSql;
    getAggregatedSearchData(rows: any): IFeatureSearchOverview[];
    private addTag;
    private rowToTag;
    private isTagRow;
    private isNewTag;
}
export default FeatureSearchStore;
//# sourceMappingURL=feature-search-store.d.ts.map