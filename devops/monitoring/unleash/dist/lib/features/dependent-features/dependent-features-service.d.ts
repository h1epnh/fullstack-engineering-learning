import type { CreateDependentFeatureSchema } from '../../openapi';
import type { IDependentFeaturesStore } from './dependent-features-store-type';
import type { FeatureDependencyId } from './dependent-features';
import type { IDependentFeaturesReadModel } from './dependent-features-read-model-type';
import type { EventService } from '../../services';
import type { IAuditUser, IUser } from '../../server-impl';
import type { IChangeRequestAccessReadModel } from '../change-request-access-service/change-request-access-read-model';
import type { IFeaturesReadModel } from '../feature-toggle/types/features-read-model-type';
interface IDependentFeaturesServiceDeps {
    dependentFeaturesStore: IDependentFeaturesStore;
    dependentFeaturesReadModel: IDependentFeaturesReadModel;
    changeRequestAccessReadModel: IChangeRequestAccessReadModel;
    featuresReadModel: IFeaturesReadModel;
    eventService: EventService;
}
export declare class DependentFeaturesService {
    private dependentFeaturesStore;
    private dependentFeaturesReadModel;
    private changeRequestAccessReadModel;
    private featuresReadModel;
    private eventService;
    constructor({ featuresReadModel, dependentFeaturesReadModel, dependentFeaturesStore, eventService, changeRequestAccessReadModel, }: IDependentFeaturesServiceDeps);
    cloneDependencies({ featureName, newFeatureName, projectId, }: {
        featureName: string;
        newFeatureName: string;
        projectId: string;
    }, auditUser: IAuditUser): Promise<void>;
    upsertFeatureDependency({ child, projectId }: {
        child: string;
        projectId: string;
    }, dependentFeature: CreateDependentFeatureSchema, user: IUser, auditUser: IAuditUser): Promise<void>;
    unprotectedUpsertFeatureDependency({ child, projectId }: {
        child: string;
        projectId: string;
    }, dependentFeature: CreateDependentFeatureSchema, auditUser: IAuditUser): Promise<void>;
    deleteFeatureDependency(dependency: FeatureDependencyId, projectId: string, user: IUser, auditUser: IAuditUser): Promise<void>;
    unprotectedDeleteFeatureDependency(dependency: FeatureDependencyId, projectId: string, auditUser: IAuditUser): Promise<void>;
    deleteFeaturesDependencies(features: string[], projectId: string, user: IUser, auditUser: IAuditUser): Promise<void>;
    unprotectedDeleteFeaturesDependencies(features: string[], projectId: string, auditUser: IAuditUser): Promise<void>;
    getPossibleParentFeatures(feature: string): Promise<string[]>;
    getPossibleParentVariants(parentFeature: string): Promise<string[]>;
    checkDependenciesExist(): Promise<boolean>;
    private stopWhenChangeRequestsEnabled;
}
export {};
//# sourceMappingURL=dependent-features-service.d.ts.map