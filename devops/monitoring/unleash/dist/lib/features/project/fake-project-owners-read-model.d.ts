import type { IProjectOwnersReadModel, ProjectOwners, UserProjectOwner, WithProjectOwners } from './project-owners-read-model.type';
export declare class FakeProjectOwnersReadModel implements IProjectOwnersReadModel {
    addOwners<T extends {
        id: string;
    }>(projects: T[]): Promise<WithProjectOwners<T>>;
    getAllUserProjectOwners(): Promise<UserProjectOwner[]>;
    getProjectOwners(): Promise<ProjectOwners>;
}
//# sourceMappingURL=fake-project-owners-read-model.d.ts.map