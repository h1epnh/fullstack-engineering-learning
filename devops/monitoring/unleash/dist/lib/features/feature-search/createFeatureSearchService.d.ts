import type { Db } from '../../db/db';
import type { IUnleashConfig } from '../../types';
import { FeatureSearchService } from './feature-search-service';
export declare const createFeatureSearchService: (config: IUnleashConfig) => (db: Db) => FeatureSearchService;
export declare const createFakeFeatureSearchService: (config: IUnleashConfig) => FeatureSearchService;
//# sourceMappingURL=createFeatureSearchService.d.ts.map