import type { Db } from '../../../server-impl';
import type { IProjectStaleFlagsReadModel } from './project-stale-flags-read-model-type';
export declare class ProjectStaleFlagsReadModel implements IProjectStaleFlagsReadModel {
    private db;
    constructor(db: Db);
    getStaleFlagCountForProject(projectId: string): Promise<number>;
}
//# sourceMappingURL=project-stale-flags-read-model.d.ts.map