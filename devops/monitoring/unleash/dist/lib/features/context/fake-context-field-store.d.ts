import type { IContextField, IContextFieldDto, IContextFieldStore } from './context-field-store-type';
export default class FakeContextFieldStore implements IContextFieldStore {
    count(): Promise<number>;
    defaultContextFields: IContextField[];
    contextFields: IContextField[];
    create(data: IContextFieldDto): Promise<IContextField>;
    delete(key: string): Promise<void>;
    deleteAll(): Promise<void>;
    destroy(): void;
    exists(key: string): Promise<boolean>;
    get(key: string): Promise<IContextField>;
    getAll(): Promise<IContextField[]>;
    update(data: IContextFieldDto): Promise<IContextField>;
}
//# sourceMappingURL=fake-context-field-store.d.ts.map