import type { IUnleashConfig, IUnleashStores } from '../../types';
import EventEmitter from 'events';
export declare const UPDATE_REVISION = "UPDATE_REVISION";
export default class ConfigurationRevisionService extends EventEmitter {
    private static instance;
    private logger;
    private eventStore;
    private revisionId;
    private flagResolver;
    private constructor();
    static getInstance({ eventStore }: Pick<IUnleashStores, 'eventStore'>, { getLogger, flagResolver, }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>): ConfigurationRevisionService;
    getMaxRevisionId(): Promise<number>;
    updateMaxRevisionId(emit?: boolean): Promise<number>;
    destroy(): void;
}
//# sourceMappingURL=configuration-revision-service.d.ts.map