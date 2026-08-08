import type { IEditableStrategy, IMinimalStrategy, IStrategy, IStrategyImport, IStrategyStore } from '../../lib/types/stores/strategy-store';
export default class FakeStrategiesStore implements IStrategyStore {
    count(): Promise<number>;
    defaultStrategy: IStrategy;
    strategies: IStrategy[];
    createStrategy(update: IMinimalStrategy): Promise<void>;
    delete(key: string): Promise<void>;
    deleteAll(): Promise<void>;
    deleteStrategy({ name }: Pick<IStrategy, 'name'>): Promise<void>;
    deprecateStrategy({ name }: Pick<IStrategy, 'name'>): Promise<void>;
    destroy(): void;
    exists(key: string): Promise<boolean>;
    get(key: string): Promise<IStrategy>;
    getAll(): Promise<IStrategy[]>;
    getEditableStrategies(): Promise<IEditableStrategy[]>;
    getStrategy(name: string): Promise<IStrategy>;
    importStrategy(data: IStrategyImport): Promise<void>;
    reactivateStrategy({ name }: Pick<IStrategy, 'name'>): Promise<void>;
    updateStrategy(update: IMinimalStrategy): Promise<void>;
    dropCustomStrategies(): Promise<void>;
}
//# sourceMappingURL=fake-strategies-store.d.ts.map