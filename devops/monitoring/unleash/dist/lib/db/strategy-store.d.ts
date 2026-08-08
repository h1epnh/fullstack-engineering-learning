import type { LogProvider } from '../logger';
import type { IEditableStrategy, IMinimalStrategyRow, IStrategy, IStrategyImport, IStrategyStore } from '../types/stores/strategy-store';
import type { Db } from './db';
interface IStrategyRow {
    title: string;
    name: string;
    built_in: number;
    description: string;
    parameters: object[];
    deprecated: boolean;
    display_name: string;
}
export default class StrategyStore implements IStrategyStore {
    private db;
    private logger;
    constructor(db: Db, getLogger: LogProvider);
    getAll(): Promise<IStrategy[]>;
    getEditableStrategies(): Promise<IEditableStrategy[]>;
    getStrategy(name: string): Promise<IStrategy>;
    delete(name: string): Promise<void>;
    deleteAll(): Promise<void>;
    count(): Promise<number>;
    destroy(): void;
    exists(name: string): Promise<boolean>;
    get(name: string): Promise<IStrategy>;
    rowToStrategy(row: IStrategyRow): IStrategy;
    rowToEditableStrategy(row: IStrategyRow): IEditableStrategy;
    eventDataToRow(data: any): IMinimalStrategyRow;
    createStrategy(data: any): Promise<void>;
    updateStrategy(data: any): Promise<void>;
    deprecateStrategy({ name }: Pick<IStrategy, 'name'>): Promise<void>;
    reactivateStrategy({ name }: Pick<IStrategy, 'name'>): Promise<void>;
    deleteStrategy({ name }: Pick<IStrategy, 'name'>): Promise<void>;
    importStrategy(data: IStrategyImport): Promise<void>;
    dropCustomStrategies(): Promise<void>;
}
export {};
//# sourceMappingURL=strategy-store.d.ts.map