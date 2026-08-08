import type { IProjectReadModel, IUnleashConfig, IUserStore } from '../../types';
import type { IOnboardingStore, ProjectEvent } from './onboarding-store-type';
export declare class OnboardingService {
    private flagResolver;
    private eventBus;
    private logger;
    private onboardingStore;
    private projectReadModel;
    private userStore;
    constructor({ onboardingStore, projectReadModel, userStore, }: {
        onboardingStore: IOnboardingStore;
        projectReadModel: IProjectReadModel;
        userStore: IUserStore;
    }, { flagResolver, eventBus, getLogger, }: Pick<IUnleashConfig, 'flagResolver' | 'eventBus' | 'getLogger'>);
    listen(): void;
    insert(event: {
        flag: string;
        type: ProjectEvent['type'];
    } | {
        type: 'first-user-login' | 'second-user-login';
    }): Promise<void>;
    private insertInstanceEvent;
    private insertProjectEvent;
}
//# sourceMappingURL=onboarding-service.d.ts.map