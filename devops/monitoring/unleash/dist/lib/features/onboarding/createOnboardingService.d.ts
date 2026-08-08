import type { IUnleashConfig } from '../../types';
import type { Db } from '../../db/db';
import { OnboardingService } from './onboarding-service';
import FakeUserStore from '../../../test/fixtures/fake-user-store';
import { FakeProjectReadModel } from '../project/fake-project-read-model';
import { FakeOnboardingStore } from './fake-onboarding-store';
export declare const createOnboardingService: (config: IUnleashConfig) => (db: Db) => OnboardingService;
export declare const createFakeOnboardingService: (config: IUnleashConfig) => {
    onboardingService: OnboardingService;
    projectReadModel: FakeProjectReadModel;
    userStore: FakeUserStore;
    onboardingStore: FakeOnboardingStore;
};
//# sourceMappingURL=createOnboardingService.d.ts.map