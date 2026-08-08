import type { Db } from '../../db/db';
import type { IUnleashConfig } from '../../types';
import TagTypeService from './tag-type-service';
export declare const createTagTypeService: (config: IUnleashConfig) => (db: Db) => TagTypeService;
export declare const createFakeTagTypeService: (config: IUnleashConfig) => TagTypeService;
//# sourceMappingURL=createTagTypeService.d.ts.map