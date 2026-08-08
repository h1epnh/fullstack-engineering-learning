import { type FeatureToggle, type FeatureToggleDTO, type FeatureToggleView, type FeatureToggleWithEnvironment, type IAuditUser, type IConstraint, type IFeatureCollaboratorsReadModel, type IFeatureEnvironmentInfo, type IFeatureNaming, type IFeatureOverview, type IFeatureStrategy, type IFeatureToggleQuery, type IFeatureTypeCount, type ISegment, type IStrategyConfig, type IUnleashConfig, type IUnleashStores, type IVariant, type Saved, type Unsaved } from '../../types';
import type { FeatureConfigurationClient } from './types/feature-toggle-strategies-store-type';
import { type Operation } from 'fast-json-patch';
import type { SetStrategySortOrderSchema } from '../../openapi/spec/set-strategy-sort-order-schema';
import type { AccessService } from '../../services/access-service';
import type { IUser } from '../../server-impl';
import type { IFeatureProjectUserParams } from './feature-toggle-controller';
import type { ISegmentService } from '../segment/segment-service-interface';
import type { IChangeRequestAccessReadModel } from '../change-request-access-service/change-request-access-read-model';
import type { IPrivateProjectChecker } from '../private-project/privateProjectCheckerType';
import type { IDependentFeaturesReadModel } from '../dependent-features/dependent-features-read-model-type';
import type EventService from '../events/event-service';
import type { DependentFeaturesService } from '../dependent-features/dependent-features-service';
import type { IFeatureLifecycleReadModel } from '../feature-lifecycle/feature-lifecycle-read-model-type';
interface IFeatureContext {
    featureName: string;
    projectId: string;
}
interface IFeatureStrategyContext extends IFeatureContext {
    environment: string;
}
export interface IGetFeatureParams {
    featureName: string;
    archived?: boolean;
    projectId?: string;
    environmentVariants?: boolean;
    userId?: number;
}
export type FeatureNameCheckResultWithFeaturePattern = {
    state: 'valid';
} | {
    state: 'invalid';
    invalidNames: Set<string>;
    featureNaming: IFeatureNaming;
};
declare class FeatureToggleService {
    private logger;
    private featureStrategiesStore;
    private strategyStore;
    private featureToggleStore;
    private clientFeatureToggleStore;
    private tagStore;
    private featureEnvironmentStore;
    private projectStore;
    private contextFieldStore;
    private segmentService;
    private accessService;
    private eventService;
    private flagResolver;
    private changeRequestAccessReadModel;
    private privateProjectChecker;
    private dependentFeaturesReadModel;
    private featureLifecycleReadModel;
    private featureCollaboratorsReadModel;
    private dependentFeaturesService;
    private eventBus;
    private resourceLimits;
    constructor({ featureStrategiesStore, featureToggleStore, clientFeatureToggleStore, projectStore, featureTagStore, featureEnvironmentStore, contextFieldStore, strategyStore, }: Pick<IUnleashStores, 'featureStrategiesStore' | 'featureToggleStore' | 'clientFeatureToggleStore' | 'projectStore' | 'featureTagStore' | 'featureEnvironmentStore' | 'contextFieldStore' | 'strategyStore'>, { getLogger, flagResolver, eventBus, resourceLimits, }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver' | 'eventBus' | 'resourceLimits'>, segmentService: ISegmentService, accessService: AccessService, eventService: EventService, changeRequestAccessReadModel: IChangeRequestAccessReadModel, privateProjectChecker: IPrivateProjectChecker, dependentFeaturesReadModel: IDependentFeaturesReadModel, dependentFeaturesService: DependentFeaturesService, featureLifecycleReadModel: IFeatureLifecycleReadModel, featureCollaboratorsReadModel: IFeatureCollaboratorsReadModel);
    validateFeaturesContext(featureNames: string[], projectId: string): Promise<void>;
    validateFeatureBelongsToProject({ featureName, projectId, }: IFeatureContext): Promise<void>;
    validateFeatureIsNotArchived(featureName: string, project: string): Promise<void>;
    validateNoChildren(featureName: string): Promise<void>;
    validateNoOrphanParents(featureNames: string[]): Promise<void>;
    validateUpdatedProperties({ featureName, projectId }: IFeatureContext, existingStrategy: IFeatureStrategy): void;
    validateProjectCanAccessSegments(projectId: string, segmentIds?: number[]): Promise<void>;
    validateStrategyLimit(featureEnv: {
        projectId: string;
        environment: string;
        featureName: string;
    }): Promise<void>;
    private validateConstraintsLimit;
    validateStrategyType(strategyName: string | undefined): Promise<void>;
    validateConstraints(constraints: IConstraint[]): Promise<IConstraint[]>;
    validateConstraint(input: IConstraint): Promise<IConstraint>;
    patchFeature(project: string, featureName: string, operations: Operation[], auditUser: IAuditUser): Promise<FeatureToggle>;
    featureStrategyToPublic(featureStrategy: IFeatureStrategy, segments?: ISegment[]): Saved<IStrategyConfig>;
    updateStrategiesSortOrder(context: IFeatureStrategyContext, sortOrders: SetStrategySortOrderSchema, auditUser: IAuditUser, user?: IUser): Promise<Saved<any>>;
    unprotectedUpdateStrategiesSortOrder(context: IFeatureStrategyContext, sortOrders: SetStrategySortOrderSchema, auditUser: IAuditUser): Promise<Saved<any>>;
    createStrategy(strategyConfig: Unsaved<IStrategyConfig>, context: IFeatureStrategyContext, auditUser: IAuditUser, user?: IUser): Promise<Saved<IStrategyConfig>>;
    unprotectedCreateStrategy(strategyConfig: Unsaved<IStrategyConfig>, context: IFeatureStrategyContext, auditUser: IAuditUser): Promise<Saved<IStrategyConfig>>;
    /**
     * PUT /api/admin/projects/:projectId/features/:featureName/strategies/:strategyId ?
     * {
     *
     * }
     * @param id
     * @param updates
     * @param context - Which context does this strategy live in (projectId, featureName, environment)
     * @param auditUser - Audit info about the user performing the update
     * @param user - Optional User object performing the action
     */
    updateStrategy(id: string, updates: Partial<IStrategyConfig>, context: IFeatureStrategyContext, auditUser: IAuditUser, user?: IUser): Promise<Saved<IStrategyConfig>>;
    optionallyDisableFeature(featureName: string, environment: string, projectId: string, auditUser: IAuditUser, user?: IUser): Promise<void>;
    unprotectedUpdateStrategy(id: string, updates: Partial<IStrategyConfig>, context: IFeatureStrategyContext, auditUser: IAuditUser, user?: IUser): Promise<Saved<IStrategyConfig>>;
    updateStrategyParameter(id: string, name: string, value: string | number, context: IFeatureStrategyContext, auditUser: IAuditUser): Promise<Saved<IStrategyConfig>>;
    /**
     * DELETE /api/admin/projects/:projectId/features/:featureName/environments/:environmentName/strategies/:strategyId
     * {
     *
     * }
     * @param id - strategy id
     * @param context - Which context does this strategy live in (projectId, featureName, environment)
     * @param auditUser - Audit information about user performing the action (userid, username, ip)
     * @param user
     */
    deleteStrategy(id: string, context: IFeatureStrategyContext, auditUser: IAuditUser, user?: IUser): Promise<void>;
    unprotectedDeleteStrategy(id: string, context: IFeatureStrategyContext, auditUser: IAuditUser): Promise<void>;
    getStrategiesForEnvironment(project: string, featureName: string, environment?: string): Promise<Saved<IStrategyConfig>[]>;
    /**
     * GET /api/admin/projects/:project/features/:featureName
     * @param featureName
     * @param archived - return archived or non archived toggles
     * @param projectId - provide if you're requesting the feature in the context of a specific project.
     * @param userId
     */
    getFeature({ featureName, archived, projectId, environmentVariants, userId, }: IGetFeatureParams): Promise<FeatureToggleView>;
    /**
     * GET /api/admin/projects/:project/features/:featureName/variants
     * @deprecated - Variants should be fetched from FeatureEnvironmentStore (since variants are now; since 4.18, connected to environments)
     * @param featureName
     * @return The list of variants
     */
    getVariants(featureName: string): Promise<IVariant[]>;
    getVariantsForEnv(featureName: string, environment: string): Promise<IVariant[]>;
    getFeatureMetadata(featureName: string): Promise<FeatureToggle>;
    getClientFeatures(query?: IFeatureToggleQuery): Promise<FeatureConfigurationClient[]>;
    getPlaygroundFeatures(query?: IFeatureToggleQuery): Promise<FeatureConfigurationClient[]>;
    getFeatureOverview(params: IFeatureProjectUserParams): Promise<IFeatureOverview[]>;
    getFeatureTypeCounts(params: IFeatureProjectUserParams): Promise<IFeatureTypeCount[]>;
    getFeatureToggle(featureName: string): Promise<FeatureToggleWithEnvironment>;
    private validateFeatureFlagLimit;
    private validateActiveProject;
    createFeatureToggle(projectId: string, value: FeatureToggleDTO, auditUser: IAuditUser, isValidated?: boolean): Promise<FeatureToggle>;
    checkFeatureFlagNamesAgainstProjectPattern(projectId: string, featureNames: string[]): Promise<FeatureNameCheckResultWithFeaturePattern>;
    validateFeatureFlagNameAgainstPattern(featureName: string, projectId?: string): Promise<void>;
    cloneFeatureToggle(featureName: string, projectId: string, newFeatureName: string, auditUser: IAuditUser, replaceGroupId?: boolean): Promise<FeatureToggle>;
    updateFeatureToggle(projectId: string, updatedFeature: FeatureToggleDTO, featureName: string, auditUser: IAuditUser): Promise<FeatureToggle>;
    getFeatureCountForProject(projectId: string): Promise<number>;
    removeAllStrategiesForEnv(toggleName: string, environment?: string): Promise<void>;
    getStrategy(strategyId: string): Promise<Saved<IStrategyConfig>>;
    getEnvironmentInfo(project: string, environment: string, featureName: string): Promise<IFeatureEnvironmentInfo>;
    deleteEnvironment(projectId: string, environment: string): Promise<void>;
    /** Validations  */
    validateName(name: string): Promise<string>;
    validateUniqueFeatureName(name: string): Promise<void>;
    hasFeature(name: string): Promise<boolean>;
    updateStale(featureName: string, isStale: boolean, auditUser: IAuditUser): Promise<any>;
    archiveToggle(featureName: string, user: IUser, auditUser: IAuditUser, projectId?: string): Promise<void>;
    unprotectedArchiveToggle(featureName: string, auditUser: IAuditUser, projectId?: string): Promise<void>;
    archiveToggles(featureNames: string[], user: IUser, auditUser: IAuditUser, projectId: string): Promise<void>;
    validateArchiveToggles(featureNames: string[]): Promise<{
        hasDeletedDependencies: boolean;
        parentsWithChildFeatures: string[];
    }>;
    unprotectedArchiveToggles(featureNames: string[], projectId: string, auditUser: IAuditUser): Promise<void>;
    setToggleStaleness(featureNames: string[], stale: boolean, projectId: string, auditUser: IAuditUser): Promise<void>;
    bulkUpdateEnabled(project: string, featureNames: string[], environment: string, enabled: boolean, auditUser: IAuditUser, user?: IUser, shouldActivateDisabledStrategies?: boolean): Promise<void>;
    updateEnabled(project: string, featureName: string, environment: string, enabled: boolean, auditUser: IAuditUser, user?: IUser, shouldActivateDisabledStrategies?: boolean): Promise<FeatureToggle>;
    unprotectedUpdateEnabled(project: string, featureName: string, environment: string, enabled: boolean, auditUser: IAuditUser, user?: IUser, shouldActivateDisabledStrategies?: boolean): Promise<FeatureToggle>;
    changeProject(featureName: string, newProject: string, auditUser: IAuditUser): Promise<void>;
    deleteFeature(featureName: string, auditUser: IAuditUser): Promise<void>;
    deleteFeatures(featureNames: string[], projectId: string, auditUser: IAuditUser): Promise<void>;
    reviveFeatures(featureNames: string[], projectId: string, auditUser: IAuditUser): Promise<void>;
    reviveFeature(featureName: string, auditUser: IAuditUser): Promise<void>;
    getAllArchivedFeatures(archived: boolean, userId: number): Promise<FeatureToggle[]>;
    getArchivedFeaturesByProjectId(archived: boolean, project: string): Promise<FeatureToggle[]>;
    getProjectId(name: string): Promise<string | undefined>;
    updateFeatureStrategyProject(featureName: string, newProjectId: string): Promise<void>;
    updateVariants(featureName: string, project: string, newVariants: Operation[], user: IUser, auditUser: IAuditUser): Promise<FeatureToggle>;
    updateVariantsOnEnv(featureName: string, project: string, environment: string, newVariants: Operation[], user: IUser, auditUser: IAuditUser): Promise<IVariant[]>;
    saveVariants(featureName: string, project: string, newVariants: IVariant[], auditUser: IAuditUser): Promise<FeatureToggle>;
    private verifyLegacyVariants;
    saveVariantsOnEnv(projectId: string, featureName: string, environment: string, newVariants: IVariant[], auditUser: IAuditUser, oldVariants?: IVariant[]): Promise<IVariant[]>;
    legacySaveVariantsOnEnv(projectId: string, featureName: string, environment: string, newVariants: IVariant[], auditUser: IAuditUser, oldVariants?: IVariant[]): Promise<IVariant[]>;
    crProtectedSaveVariantsOnEnv(projectId: string, featureName: string, environment: string, newVariants: IVariant[], user: IUser, auditUser: IAuditUser, oldVariants?: IVariant[]): Promise<IVariant[]>;
    crProtectedSetVariantsOnEnvs(projectId: string, featureName: string, environments: string[], newVariants: IVariant[], user: IUser, auditUser: IAuditUser): Promise<IVariant[]>;
    setVariantsOnEnvs(projectId: string, featureName: string, environments: string[], newVariants: IVariant[], auditUser: IAuditUser): Promise<IVariant[]>;
    fixVariantWeights(variants: IVariant[]): IVariant[];
    private stopWhenChangeRequestsEnabled;
    private stopWhenCannotCreateStrategies;
    updatePotentiallyStaleFeatures(): Promise<void>;
    setFeatureCreatedByUserIdFromEvents(): Promise<void>;
}
export default FeatureToggleService;
//# sourceMappingURL=feature-toggle-service.d.ts.map