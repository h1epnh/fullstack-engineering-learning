import type { Db } from '../../db/db';
import { DependentFeaturesService } from './dependent-features-service';
import type { IUnleashConfig } from '../../types';
export declare const createDependentFeaturesService: (config: IUnleashConfig) => (db: Db) => DependentFeaturesService;
export declare const createFakeDependentFeaturesService: (config: IUnleashConfig) => DependentFeaturesService;
//# sourceMappingURL=createDependentFeaturesService.d.ts.map