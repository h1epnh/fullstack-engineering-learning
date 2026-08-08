import type { Db } from '../../db/db';
import type { LogProvider } from '../../logger';
import type { IContextField, IContextFieldDto, IContextFieldStore } from './context-field-store-type';
import type { IFlagResolver } from '../../types';
interface ICreateContextField {
    name: string;
    description?: string | null;
    stickiness: boolean;
    sort_order: number;
    legal_values?: string;
    updated_at: Date;
}
declare class ContextFieldStore implements IContextFieldStore {
    private db;
    private logger;
    private flagResolver;
    constructor(db: Db, getLogger: LogProvider, flagResolver: IFlagResolver);
    prefixColumns(columns?: string[]): string[];
    fieldToRow(data: IContextFieldDto): Omit<ICreateContextField, 'updated_at'>;
    getAll(): Promise<IContextField[]>;
    get(key: string): Promise<IContextField>;
    deleteAll(): Promise<void>;
    destroy(): void;
    exists(key: string): Promise<boolean>;
    create(contextField: IContextFieldDto): Promise<IContextField>;
    update(data: IContextFieldDto): Promise<IContextField>;
    delete(name: string): Promise<void>;
    count(): Promise<number>;
}
export default ContextFieldStore;
//# sourceMappingURL=context-field-store.d.ts.map