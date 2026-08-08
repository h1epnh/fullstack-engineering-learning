import type { IProjectOwnersReadModel, UserProjectOwner } from '../project/project-owners-read-model.type';
import type { IPersonalDashboardReadModel, PersonalFeature, PersonalProject } from './personal-dashboard-read-model-type';
import type { IProjectReadModel } from '../project/project-read-model-type';
import type { IPrivateProjectChecker } from '../private-project/privateProjectCheckerType';
import type { IAccessStore, IAccountStore, IEventStore, IOnboardingReadModel, MinimalUser } from '../../types';
import type { FeatureEventFormatter } from '../../addons/feature-event-formatter-md';
import type { PersonalDashboardProjectDetailsSchema } from '../../openapi';
type PersonalDashboardProjectDetailsUnserialized = Omit<PersonalDashboardProjectDetailsSchema, 'latestEvents'> & {
    latestEvents: {
        createdBy: string;
        summary: string;
        createdByImageUrl: string;
        id: number;
        createdAt: Date;
    }[];
};
export declare class PersonalDashboardService {
    private personalDashboardReadModel;
    private projectOwnersReadModel;
    private projectReadModel;
    private privateProjectChecker;
    private eventStore;
    private featureEventFormatter;
    private accountStore;
    private onboardingReadModel;
    private accessStore;
    constructor(personalDashboardReadModel: IPersonalDashboardReadModel, projectOwnersReadModel: IProjectOwnersReadModel, projectReadModel: IProjectReadModel, onboardingReadModel: IOnboardingReadModel, eventStore: IEventStore, featureEventFormatter: FeatureEventFormatter, privateProjectChecker: IPrivateProjectChecker, accountStore: IAccountStore, accessStore: IAccessStore);
    getPersonalFeatures(userId: number): Promise<PersonalFeature[]>;
    getPersonalProjects(userId: number): Promise<PersonalProject[]>;
    getProjectOwners(userId: number): Promise<UserProjectOwner[]>;
    getPersonalProjectDetails(userId: number, projectId: string): Promise<PersonalDashboardProjectDetailsUnserialized>;
    getAdmins(): Promise<MinimalUser[]>;
}
export {};
//# sourceMappingURL=personal-dashboard-service.d.ts.map