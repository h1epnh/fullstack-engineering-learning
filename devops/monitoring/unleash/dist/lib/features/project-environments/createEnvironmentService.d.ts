import type { Db } from '../../db/db';
import type { IUnleashConfig } from '../../types';
import EnvironmentService from './environment-service';
export declare const createEnvironmentService: (config: IUnleashConfig) => (db: Db) => EnvironmentService;
export declare const createFakeEnvironmentService: (config: IUnleashConfig) => EnvironmentService;
//# sourceMappingURL=createEnvironmentService.d.ts.map