import type { IUnleashConfig } from '../../types/option';
import type { IUnleashStores } from '../../types';
export declare class UniqueConnectionService {
    private logger;
    private uniqueConnectionStore;
    private flagResolver;
    private eventBus;
    private activeHour;
    private hll;
    private backendHll;
    private frontendHll;
    constructor({ uniqueConnectionStore, }: Pick<IUnleashStores, 'uniqueConnectionStore'>, config: Pick<IUnleashConfig, 'getLogger' | 'flagResolver' | 'eventBus'>);
    listen(): void;
    count({ connectionId, type, }: {
        connectionId: string;
        type: 'frontend' | 'backend';
    }): void;
    sync(currentTime?: Date): Promise<void>;
    private resetHll;
    private getHll;
    private syncBuckets;
}
//# sourceMappingURL=unique-connection-service.d.ts.map