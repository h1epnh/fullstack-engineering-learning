import type { Db } from '../../db/db';
import type { LogProvider } from '../../logger';
import type { IPrivateProjectStore } from './privateProjectStoreType';
export type ProjectAccess = {
    mode: 'all';
} | {
    mode: 'limited';
    projects: string[];
};
export declare const ALL_PROJECT_ACCESS: ProjectAccess;
declare class PrivateProjectStore implements IPrivateProjectStore {
    private db;
    private logger;
    constructor(db: Db, getLogger: LogProvider);
    destroy(): void;
    getUserAccessibleProjects(userId: number): Promise<ProjectAccess>;
}
export default PrivateProjectStore;
//# sourceMappingURL=privateProjectStore.d.ts.map