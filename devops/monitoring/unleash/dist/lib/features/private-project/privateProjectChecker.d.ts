import type { IUnleashConfig, IUnleashStores } from '../../types';
import type { IPrivateProjectChecker } from './privateProjectCheckerType';
import { type ProjectAccess } from './privateProjectStore';
export declare class PrivateProjectChecker implements IPrivateProjectChecker {
    private privateProjectStore;
    private isEnterprise;
    constructor({ privateProjectStore }: Pick<IUnleashStores, 'privateProjectStore'>, { isEnterprise }: Pick<IUnleashConfig, 'isEnterprise'>);
    getUserAccessibleProjects(userId: number): Promise<ProjectAccess>;
    filterUserAccessibleProjects(userId: number, projects: string[]): Promise<string[]>;
    hasAccessToProject(userId: number, projectId: string): Promise<boolean>;
}
//# sourceMappingURL=privateProjectChecker.d.ts.map