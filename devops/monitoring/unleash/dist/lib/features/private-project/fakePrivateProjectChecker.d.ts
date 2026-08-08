import type { IPrivateProjectChecker } from './privateProjectCheckerType';
import { type ProjectAccess } from './privateProjectStore';
export declare class FakePrivateProjectChecker implements IPrivateProjectChecker {
    filterUserAccessibleProjects(userId: number, projects: string[]): Promise<string[]>;
    getUserAccessibleProjects(userId: number): Promise<ProjectAccess>;
    hasAccessToProject(userId: number, projectId: string): Promise<boolean>;
}
//# sourceMappingURL=fakePrivateProjectChecker.d.ts.map