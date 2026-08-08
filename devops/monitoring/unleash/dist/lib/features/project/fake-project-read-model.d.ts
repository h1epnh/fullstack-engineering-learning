import type { IProjectReadModel } from '../../types';
import type { ProjectForUi, ProjectForInsights } from './project-read-model-type';
export declare class FakeProjectReadModel implements IProjectReadModel {
    getFeatureProject(): Promise<{
        project: string;
        createdAt: Date;
    } | null>;
    getProjectsForAdminUi(): Promise<ProjectForUi[]>;
    getProjectsForInsights(): Promise<ProjectForInsights[]>;
    getProjectsByUser(): Promise<string[]>;
    getProjectsFavoritedByUser(): Promise<string[]>;
}
//# sourceMappingURL=fake-project-read-model.d.ts.map