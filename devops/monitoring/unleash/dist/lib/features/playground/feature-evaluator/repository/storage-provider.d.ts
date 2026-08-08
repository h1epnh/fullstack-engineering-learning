export interface StorageProvider<T> {
    set(key: string, data: T): Promise<void>;
    get(key: string): Promise<T | undefined>;
}
export interface StorageOptions {
    backupPath: string;
}
export declare class FileStorageProvider<T> implements StorageProvider<T> {
    private backupPath;
    constructor(backupPath: string);
    private getPath;
    set(key: string, data: T): Promise<void>;
    get(key: string): Promise<T | undefined>;
}
//# sourceMappingURL=storage-provider.d.ts.map