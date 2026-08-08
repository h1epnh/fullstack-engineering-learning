import type { LogProvider } from '../logger';
import type EventEmitter from 'events';
import type { IProjectStats } from '../features/project/project-service';
import type { ICreateEnabledDates, IProjectStatsStore } from '../types/stores/project-stats-store-type';
import type { Db } from './db';
import type { DoraFeaturesSchema } from '../openapi';
interface IProjectStatsRow {
    avg_time_to_prod_current_window: number;
    features_created_current_window: number;
    features_created_past_window: number;
    features_archived_current_window: number;
    features_archived_past_window: number;
    project_changes_current_window: number;
    project_changes_past_window: number;
    project_members_added_current_window: number;
}
declare class ProjectStatsStore implements IProjectStatsStore {
    private db;
    private logger;
    private timer;
    constructor(db: Db, eventBus: EventEmitter, getLogger: LogProvider);
    updateProjectStats(projectId: string, status: IProjectStats): Promise<void>;
    getProjectStats(projectId: string): Promise<IProjectStats>;
    mapRow(row: IProjectStatsRow): IProjectStats;
    getTimeToProdDates(projectId: string): Promise<ICreateEnabledDates[]>;
    getTimeToProdDatesForFeatureToggles(projectId: string, featureToggleNames: string[]): Promise<DoraFeaturesSchema[]>;
}
export default ProjectStatsStore;
//# sourceMappingURL=project-stats-store.d.ts.map