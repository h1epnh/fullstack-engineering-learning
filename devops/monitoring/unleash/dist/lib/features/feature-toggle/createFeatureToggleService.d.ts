import { FeatureToggleService } from '../../services';
import type { Db } from '../../db/db';
import type { IUnleashConfig } from '../../types';
import FakeFeatureStrategiesStore from './fakes/fake-feature-strategies-store';
import FakeFeatureToggleStore from './fakes/fake-feature-toggle-store';
import FakeProjectStore from '../../../test/fixtures/fake-project-store';
export declare const createFeatureToggleService: (db: Db, config: IUnleashConfig) => FeatureToggleService;
export declare const createFakeFeatureToggleService: (config: IUnleashConfig) => {
    featureToggleService: FeatureToggleService;
    featureToggleStore: FakeFeatureToggleStore;
    projectStore: FakeProjectStore;
    featureStrategiesStore: FakeFeatureStrategiesStore;
};
//# sourceMappingURL=createFeatureToggleService.d.ts.map