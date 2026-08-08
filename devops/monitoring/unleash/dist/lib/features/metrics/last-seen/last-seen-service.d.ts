import type { IUnleashConfig } from '../../../server-impl';
import type { IClientMetricsEnv } from '../client-metrics/client-metrics-store-v2-type';
import type { IUnleashStores } from '../../../types';
export type LastSeenInput = {
    featureName: string;
    environment: string;
};
export declare class LastSeenService {
    private lastSeenToggles;
    private logger;
    private lastSeenStore;
    constructor({ lastSeenStore }: Pick<IUnleashStores, 'lastSeenStore'>, config: IUnleashConfig);
    store(): Promise<number>;
    updateLastSeen(clientMetrics: IClientMetricsEnv[]): void;
    cleanLastSeen(): Promise<void>;
}
//# sourceMappingURL=last-seen-service.d.ts.map