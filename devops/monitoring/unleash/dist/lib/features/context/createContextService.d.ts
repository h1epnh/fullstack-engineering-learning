import type { Db } from '../../db/db';
import type { IUnleashConfig } from '../../types';
import ContextService from './context-service';
export declare const createContextService: (config: IUnleashConfig) => (db: Db) => ContextService;
export declare const createFakeContextService: (config: IUnleashConfig) => ContextService;
//# sourceMappingURL=createContextService.d.ts.map