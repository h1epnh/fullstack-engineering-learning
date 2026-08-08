import type { IUnleashConfig } from '../types/option';
import type { IUnleashStores } from '../types/stores';
import type { IMinimalStrategy, IStrategy } from '../types/stores/strategy-store';
import type EventService from '../features/events/event-service';
import { type IAuditUser } from '../types';
declare class StrategyService {
    private logger;
    private strategyStore;
    private eventService;
    constructor({ strategyStore }: Pick<IUnleashStores, 'strategyStore'>, { getLogger }: Pick<IUnleashConfig, 'getLogger'>, eventService: EventService);
    getStrategies(): Promise<IStrategy[]>;
    getStrategy(name: string): Promise<IStrategy | undefined>;
    removeStrategy(strategyName: string, auditUser: IAuditUser): Promise<void>;
    deprecateStrategy(strategyName: string, auditUser: IAuditUser): Promise<void>;
    reactivateStrategy(strategyName: string, auditUser: IAuditUser): Promise<void>;
    createStrategy(value: IMinimalStrategy, auditUser: IAuditUser): Promise<IStrategy | undefined>;
    updateStrategy(input: IMinimalStrategy, auditUser: IAuditUser): Promise<void>;
    private _validateStrategyName;
    _validateEditable(strategy: IStrategy | undefined): void;
}
export default StrategyService;
//# sourceMappingURL=strategy-service.d.ts.map