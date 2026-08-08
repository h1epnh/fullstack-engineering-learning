import type { Db } from '../../db/db';
import type { BasePersonalProject, IPersonalDashboardReadModel, PersonalFeature } from './personal-dashboard-read-model-type';
export declare class PersonalDashboardReadModel implements IPersonalDashboardReadModel {
    private db;
    constructor(db: Db);
    getLatestHealthScores(project: string, count: number): Promise<number[]>;
    getPersonalProjects(userId: number): Promise<BasePersonalProject[]>;
    getPersonalFeatures(userId: number): Promise<PersonalFeature[]>;
}
//# sourceMappingURL=personal-dashboard-read-model.d.ts.map