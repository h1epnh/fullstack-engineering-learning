import type { Db } from '../../db/db';
import type { IProjectOwnersReadModel, ProjectOwners, ProjectOwnersDictionary, UserProjectOwner, WithProjectOwners } from './project-owners-read-model.type';
export declare class ProjectOwnersReadModel implements IProjectOwnersReadModel {
    private db;
    constructor(db: Db);
    static addOwnerData<T extends {
        id: string;
    }>(projects: T[], owners: ProjectOwnersDictionary): WithProjectOwners<T>;
    private getAllProjectUsersByRole;
    private getAllProjectGroupsByRole;
    getProjectOwnersDictionary(): Promise<ProjectOwnersDictionary>;
    getAllUserProjectOwners(projects?: Set<string>): Promise<UserProjectOwner[]>;
    addOwners<T extends {
        id: string;
    }>(projects: T[]): Promise<WithProjectOwners<T>>;
    getProjectOwners(projectId: string): Promise<ProjectOwners>;
}
//# sourceMappingURL=project-owners-read-model.d.ts.map