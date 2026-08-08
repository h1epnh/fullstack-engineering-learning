import type { IFlagResolver } from '../../types';
import type { Db } from '../../db/db';
import type { IProjectReadModel, ProjectForInsights, ProjectForUi } from './project-read-model-type';
import type { IProjectQuery, IProjectsQuery } from './project-store-type';
import type EventEmitter from 'events';
export declare class ProjectReadModel implements IProjectReadModel {
    private db;
    private timer;
    private flagResolver;
    constructor(db: Db, eventBus: EventEmitter, flagResolver: IFlagResolver);
    getFeatureProject(featureName: string): Promise<{
        project: string;
        createdAt: Date;
    } | null>;
    getProjectsForAdminUi(query?: IProjectQuery & IProjectsQuery, userId?: number): Promise<ProjectForUi[]>;
    getProjectsForInsights(query?: IProjectQuery): Promise<ProjectForInsights[]>;
    private getMembersCount;
    getProjectsByUser(userId: number): Promise<string[]>;
    getProjectsFavoritedByUser(userId: number): Promise<string[]>;
}
//# sourceMappingURL=project-read-model.d.ts.map