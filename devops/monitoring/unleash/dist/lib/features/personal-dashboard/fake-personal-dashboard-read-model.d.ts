import type { IUser } from '../../server-impl';
import type { BasePersonalProject, IPersonalDashboardReadModel, PersonalFeature } from './personal-dashboard-read-model-type';
export declare class FakePersonalDashboardReadModel implements IPersonalDashboardReadModel {
    getLatestHealthScores(project: string, count: number): Promise<number[]>;
    getPersonalFeatures(userId: number): Promise<PersonalFeature[]>;
    getPersonalProjects(userId: number): Promise<BasePersonalProject[]>;
    getAdmins(): Promise<IUser[]>;
}
//# sourceMappingURL=fake-personal-dashboard-read-model.d.ts.map