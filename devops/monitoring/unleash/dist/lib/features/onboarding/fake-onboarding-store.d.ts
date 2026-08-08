import type { InstanceEvent, IOnboardingStore, ProjectEvent } from './onboarding-store-type';
export declare class FakeOnboardingStore implements IOnboardingStore {
    insertProjectEvent(event: ProjectEvent): Promise<void>;
    insertInstanceEvent(event: InstanceEvent): Promise<void>;
    deleteAll(): Promise<void>;
}
//# sourceMappingURL=fake-onboarding-store.d.ts.map