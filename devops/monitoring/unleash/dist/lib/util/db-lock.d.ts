import type { IDBOption } from '../types';
import type { Logger } from '../logger';
export declare const defaultLockKey = 479341;
export declare const defaultTimeout: number;
interface IDbLockOptions {
    timeout: number;
    lockKey: number;
    logger: Logger;
}
export declare const withDbLock: (dbConfig: IDBOption, config?: IDbLockOptions) => <A extends any[], R>(fn: (...args: A) => Promise<R>) => (...args: A) => Promise<R>;
export {};
//# sourceMappingURL=db-lock.d.ts.map