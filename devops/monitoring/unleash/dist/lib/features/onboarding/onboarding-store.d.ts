import type { Db } from '../../db/db';
import type { InstanceEvent, IOnboardingStore, ProjectEvent } from './onboarding-store-type';
export type DBProjectEvent = {
    event: 'first-flag' | 'first-pre-live' | 'first-live';
    time_to_event: number;
    project: string;
};
export type DBInstanceEvent = {
    event: 'first-flag' | 'first-pre-live' | 'first-live';
    time_to_event: number;
    project?: string;
} | {
    event: 'first-user-login' | 'second-user-login';
    time_to_event: number;
};
export declare class OnboardingStore implements IOnboardingStore {
    private db;
    constructor(db: Db);
    insertInstanceEvent(event: InstanceEvent): Promise<void>;
    insertProjectEvent(event: ProjectEvent): Promise<void>;
    deleteAll(): Promise<void>;
}
//# sourceMappingURL=onboarding-store.d.ts.map