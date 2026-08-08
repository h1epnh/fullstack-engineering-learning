import type { Db } from '../../db/db';
import type { IOnboardingReadModel, InstanceOnboarding, ProjectOnboarding, OnboardingStatus } from './onboarding-read-model-type';
export declare class OnboardingReadModel implements IOnboardingReadModel {
    private db;
    constructor(db: Db);
    getInstanceOnboardingMetrics(): Promise<InstanceOnboarding>;
    getProjectsOnboardingMetrics(): Promise<Array<ProjectOnboarding>>;
    getOnboardingStatusForProject(projectId: string): Promise<OnboardingStatus | null>;
}
//# sourceMappingURL=onboarding-read-model.d.ts.map