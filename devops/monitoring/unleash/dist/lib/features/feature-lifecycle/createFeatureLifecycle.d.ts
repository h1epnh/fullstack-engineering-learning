import FakeEventStore from '../../../test/fixtures/fake-event-store';
import { FakeFeatureLifecycleStore } from './fake-feature-lifecycle-store';
import { FeatureLifecycleService } from './feature-lifecycle-service';
import FakeEnvironmentStore from '../project-environments/fake-environment-store';
import type { IUnleashConfig } from '../../types';
import type { Db } from '../../db/db';
import FakeFeatureEnvironmentStore from '../../../test/fixtures/fake-feature-environment-store';
export declare const createFeatureLifecycleService: (config: IUnleashConfig) => (db: Db) => FeatureLifecycleService;
export declare const createFakeFeatureLifecycleService: (config: IUnleashConfig) => {
    featureLifecycleService: FeatureLifecycleService;
    featureLifecycleStore: FakeFeatureLifecycleStore;
    eventStore: FakeEventStore;
    environmentStore: FakeEnvironmentStore;
    featureEnvironmentStore: FakeFeatureEnvironmentStore;
};
//# sourceMappingURL=createFeatureLifecycle.d.ts.map