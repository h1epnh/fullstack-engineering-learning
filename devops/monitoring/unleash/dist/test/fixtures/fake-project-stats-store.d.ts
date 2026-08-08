import type { IProjectStats } from '../../lib/features/project/project-service';
import type { ICreateEnabledDates, IProjectStatsStore } from '../../lib/types/stores/project-stats-store-type';
import type { DoraFeaturesSchema } from '../../lib/openapi';
export default class FakeProjectStatsStore implements IProjectStatsStore {
    private stats;
    updateProjectStats(projectId: string, stats: IProjectStats): Promise<void>;
    getProjectStats(projectId: string): Promise<IProjectStats>;
    getTimeToProdDates(): Promise<ICreateEnabledDates[]>;
    getTimeToProdDatesForFeatureToggles(): Promise<DoraFeaturesSchema[]>;
}
//# sourceMappingURL=fake-project-stats-store.d.ts.map