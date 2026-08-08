import type { Db } from '../../db/db';
import type { IUnleashConfig, IUnleashStores } from '../../types';
import { PersonalDashboardService } from './personal-dashboard-service';
export declare const createPersonalDashboardService: (db: Db, config: IUnleashConfig, stores: IUnleashStores) => PersonalDashboardService;
export declare const createFakePersonalDashboardService: (config: IUnleashConfig) => PersonalDashboardService;
//# sourceMappingURL=createPersonalDashboardService.d.ts.map