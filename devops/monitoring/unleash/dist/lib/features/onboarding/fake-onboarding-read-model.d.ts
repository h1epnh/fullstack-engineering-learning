import type { IOnboardingReadModel } from '../../types';
import type { InstanceOnboarding, OnboardingStatus, ProjectOnboarding } from './onboarding-read-model-type';
export declare class FakeOnboardingReadModel implements IOnboardingReadModel {
    getInstanceOnboardingMetrics(): Promise<InstanceOnboarding>;
    getProjectsOnboardingMetrics(): Promise<ProjectOnboarding[]>;
    getOnboardingStatusForProject(): Promise<OnboardingStatus | null>;
}
//# sourceMappingURL=fake-onboarding-read-model.d.ts.map