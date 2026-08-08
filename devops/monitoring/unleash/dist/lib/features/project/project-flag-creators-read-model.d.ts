import type { Db } from '../../db/db';
import type { IProjectFlagCreatorsReadModel } from './project-flag-creators-read-model.type';
export declare class ProjectFlagCreatorsReadModel implements IProjectFlagCreatorsReadModel {
    private db;
    constructor(db: Db);
    getFlagCreators(project: string): Promise<Array<{
        id: number;
        name: string;
    }>>;
}
//# sourceMappingURL=project-flag-creators-read-model.d.ts.map