import type { Db } from '../../db/db';
import type { IUnleashConfig } from '../../types';
import { ClientFeatureToggleService } from './client-feature-toggle-service';
export declare const createClientFeatureToggleService: (db: Db, config: IUnleashConfig) => ClientFeatureToggleService;
export declare const createFakeClientFeatureToggleService: (config: IUnleashConfig) => ClientFeatureToggleService;
//# sourceMappingURL=createClientFeatureToggleService.d.ts.map