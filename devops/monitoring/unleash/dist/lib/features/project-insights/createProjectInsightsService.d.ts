import type { Db, IUnleashConfig } from '../../server-impl';
import FakeProjectStore from '../../../test/fixtures/fake-project-store';
import FakeFeatureToggleStore from '../feature-toggle/fakes/fake-feature-toggle-store';
import FakeProjectStatsStore from '../../../test/fixtures/fake-project-stats-store';
import { ProjectInsightsService } from './project-insights-service';
export declare const createProjectInsightsService: (db: Db, config: IUnleashConfig) => ProjectInsightsService;
export declare const createFakeProjectInsightsService: () => {
    projectInsightsService: ProjectInsightsService;
    projectStatsStore: FakeProjectStatsStore;
    featureToggleStore: FakeFeatureToggleStore;
    projectStore: FakeProjectStore;
};
//# sourceMappingURL=createProjectInsightsService.d.ts.map