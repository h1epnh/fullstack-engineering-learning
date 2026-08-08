import type { Db, IUnleashConfig } from '../../server-impl';
import type { Store } from '../../types/stores/store';
import type { Row } from './row-type';
export type CrudStoreConfig = Pick<IUnleashConfig, 'eventBus'>;
/**
 * This abstract class defines the basic operations for a CRUD store.
 *
 * It accepts one model as input and one model as output that generally includes auto-generated properties such as the id or createdAt.
 *
 * Provides default types for:
 * - OutputRowModel turning the properties of OutputModel from camelCase to snake_case
 * - InputRowModel turning the properties of InputModel from camelCase to snake_case
 * - IdType assumming it's a number
 *
 * These types can be overridden to suit different needs.
 *
 * Default implementations of toRow and fromRow are provided, but can be overridden.
 */
export declare abstract class CRUDStore<OutputModel extends {
    id: IdType;
}, InputModel, OutputRowModel = Row<OutputModel>, InputRowModel = Row<InputModel>, IdType = number> implements Store<OutputModel, IdType> {
    protected db: Db;
    protected tableName: string;
    protected readonly timer: (action: string) => Function;
    protected toRow: (item: Partial<InputModel>) => Partial<InputRowModel>;
    protected fromRow: (item: Partial<OutputRowModel>) => Partial<OutputModel>;
    constructor(tableName: string, db: Db, { eventBus }: CrudStoreConfig, options?: Partial<{
        toRow: (item: Partial<InputModel>) => Partial<InputRowModel>;
        fromRow: (item: OutputRowModel) => Partial<OutputModel>;
    }>);
    getAll(query?: Partial<InputModel>): Promise<OutputModel[]>;
    insert(item: InputModel): Promise<OutputModel>;
    bulkInsert(items: InputModel[]): Promise<OutputModel[]>;
    update(id: IdType, item: Partial<InputModel>): Promise<OutputModel>;
    delete(id: IdType): Promise<void>;
    deleteAll(): Promise<void>;
    destroy(): void;
    exists(id: IdType): Promise<boolean>;
    count(query?: Partial<InputModel>): Promise<number>;
    get(id: IdType): Promise<OutputModel>;
}
//# sourceMappingURL=crud-store.d.ts.map