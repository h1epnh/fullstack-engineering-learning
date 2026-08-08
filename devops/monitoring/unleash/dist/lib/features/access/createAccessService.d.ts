import type { Db, IUnleashConfig } from '../../server-impl';
import { AccessService } from '../../services';
import type { IAccessStore, IEventStore, IRoleStore } from '../../types';
export declare const createAccessService: (db: Db, config: IUnleashConfig) => AccessService;
export declare const createFakeAccessService: (config: IUnleashConfig) => {
    accessService: AccessService;
    eventStore: IEventStore;
    accessStore: IAccessStore;
    roleStore: IRoleStore;
};
//# sourceMappingURL=createAccessService.d.ts.map