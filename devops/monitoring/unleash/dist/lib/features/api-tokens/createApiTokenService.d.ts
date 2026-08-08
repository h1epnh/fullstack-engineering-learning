import type { Db, IUnleashConfig } from '../../server-impl';
import { ApiTokenService, type EventService } from '../../services';
import type { IEnvironmentStore } from '../../types';
import FakeApiTokenStore from '../../../test/fixtures/fake-api-token-store';
export declare const createApiTokenService: (db: Db, config: IUnleashConfig) => ApiTokenService;
export declare const createFakeApiTokenService: (config: IUnleashConfig) => {
    apiTokenService: ApiTokenService;
    eventService: EventService;
    apiTokenStore: FakeApiTokenStore;
    environmentStore: IEnvironmentStore;
};
//# sourceMappingURL=createApiTokenService.d.ts.map