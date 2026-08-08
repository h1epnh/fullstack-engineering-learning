import type { LogProvider } from '../../../lib/logger';
import type { IUnleashStores } from '../../../lib/types';
import type { IUnleashConfig, IUnleashOptions, Knex } from '../../../lib/server-impl';
export declare const testDbPrefix = "unleashtestdb_";
export interface ITestDb {
    config: IUnleashConfig;
    stores: IUnleashStores;
    reset: () => Promise<void>;
    destroy: () => Promise<void>;
    rawDatabase: Knex;
}
type DBTestOptions = {
    dbInitMethod?: 'legacy' | 'template';
    stopMigrationAt?: string;
};
export default function init(databaseSchema?: string, getLogger?: LogProvider, configOverride?: Partial<IUnleashOptions & DBTestOptions>): Promise<ITestDb>;
export {};
//# sourceMappingURL=database-init.d.ts.map