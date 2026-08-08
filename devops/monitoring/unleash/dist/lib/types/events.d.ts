import type { FeatureToggle, IEnvironment, IProject, IStrategyConfig, ITag, IVariant } from './model';
import type { IApiToken } from './models/api-token';
import type { IAuditUser, IUserWithRootRole } from './user';
import type { ITagType } from '../features/tag-type/tag-type-store-type';
import type { IFeatureAndTag } from './stores/feature-tag-store';
import type { FeatureLifecycleCompletedSchema } from '../openapi';
export declare const APPLICATION_CREATED: "application-created";
export declare const FEATURE_CREATED: "feature-created";
export declare const FEATURE_DELETED: "feature-deleted";
export declare const FEATURE_UPDATED: "feature-updated";
export declare const FEATURE_DEPENDENCY_ADDED: "feature-dependency-added";
export declare const FEATURE_DEPENDENCY_REMOVED: "feature-dependency-removed";
export declare const FEATURE_DEPENDENCIES_REMOVED: "feature-dependencies-removed";
export declare const FEATURE_METADATA_UPDATED: "feature-metadata-updated";
export declare const FEATURE_VARIANTS_UPDATED: "feature-variants-updated";
export declare const FEATURE_ENVIRONMENT_VARIANTS_UPDATED: "feature-environment-variants-updated";
export declare const FEATURE_PROJECT_CHANGE: "feature-project-change";
export declare const FEATURE_ARCHIVED: "feature-archived";
export declare const FEATURE_REVIVED: "feature-revived";
export declare const FEATURE_IMPORT: "feature-import";
export declare const FEATURE_TAGGED: "feature-tagged";
export declare const FEATURE_TAG_IMPORT: "feature-tag-import";
export declare const FEATURE_STRATEGY_UPDATE: "feature-strategy-update";
export declare const FEATURE_STRATEGY_ADD: "feature-strategy-add";
export declare const FEATURE_STRATEGY_REMOVE: "feature-strategy-remove";
export declare const DROP_FEATURE_TAGS: "drop-feature-tags";
export declare const FEATURE_UNTAGGED: "feature-untagged";
export declare const FEATURE_STALE_ON: "feature-stale-on";
export declare const FEATURE_COMPLETED: "feature-completed";
export declare const FEATURE_UNCOMPLETED: "feature-uncompleted";
export declare const FEATURE_STALE_OFF: "feature-stale-off";
export declare const DROP_FEATURES: "drop-features";
export declare const FEATURE_ENVIRONMENT_ENABLED: "feature-environment-enabled";
export declare const FEATURE_ENVIRONMENT_DISABLED: "feature-environment-disabled";
export declare const STRATEGY_ORDER_CHANGED = "strategy-order-changed";
export declare const STRATEGY_CREATED: "strategy-created";
export declare const STRATEGY_DELETED: "strategy-deleted";
export declare const STRATEGY_DEPRECATED: "strategy-deprecated";
export declare const STRATEGY_REACTIVATED: "strategy-reactivated";
export declare const STRATEGY_UPDATED: "strategy-updated";
export declare const STRATEGY_IMPORT: "strategy-import";
export declare const DROP_STRATEGIES: "drop-strategies";
export declare const CONTEXT_FIELD_CREATED: "context-field-created";
export declare const CONTEXT_FIELD_UPDATED: "context-field-updated";
export declare const CONTEXT_FIELD_DELETED: "context-field-deleted";
export declare const PROJECT_ACCESS_ADDED: "project-access-added";
export declare const FEATURE_TYPE_UPDATED: "feature-type-updated";
export declare const PROJECT_ACCESS_USER_ROLES_UPDATED = "project-access-user-roles-updated";
export declare const PROJECT_ACCESS_GROUP_ROLES_UPDATED = "project-access-group-roles-updated";
export declare const PROJECT_ACCESS_UPDATED: "project-access-updated";
export declare const PROJECT_ACCESS_USER_ROLES_DELETED = "project-access-user-roles-deleted";
export declare const PROJECT_ACCESS_GROUP_ROLES_DELETED = "project-access-group-roles-deleted";
export declare const ROLE_CREATED = "role-created";
export declare const ROLE_UPDATED = "role-updated";
export declare const ROLE_DELETED = "role-deleted";
export declare const PROJECT_CREATED: "project-created";
export declare const PROJECT_UPDATED: "project-updated";
export declare const PROJECT_DELETED: "project-deleted";
export declare const PROJECT_ARCHIVED: "project-archived";
export declare const PROJECT_REVIVED: "project-revived";
export declare const PROJECT_IMPORT: "project-import";
export declare const PROJECT_USER_ADDED: "project-user-added";
export declare const PROJECT_USER_REMOVED: "project-user-removed";
export declare const PROJECT_USER_ROLE_CHANGED: "project-user-role-changed";
export declare const PROJECT_GROUP_ADDED: "project-group-added";
export declare const PROJECT_GROUP_REMOVED: "project-group-removed";
export declare const PROJECT_GROUP_ROLE_CHANGED: "project-group-role-changed";
export declare const DROP_PROJECTS: "drop-projects";
export declare const TAG_CREATED: "tag-created";
export declare const TAG_DELETED: "tag-deleted";
export declare const TAG_IMPORT: "tag-import";
export declare const DROP_TAGS: "drop-tags";
export declare const TAG_TYPE_CREATED: "tag-type-created";
export declare const TAG_TYPE_DELETED: "tag-type-deleted";
export declare const TAG_TYPE_UPDATED: "tag-type-updated";
export declare const TAG_TYPE_IMPORT: "tag-type-import";
export declare const DROP_TAG_TYPES: "drop-tag-types";
export declare const ADDON_CONFIG_CREATED: "addon-config-created";
export declare const ADDON_CONFIG_UPDATED: "addon-config-updated";
export declare const ADDON_CONFIG_DELETED: "addon-config-deleted";
export declare const DB_POOL_UPDATE: "db-pool-update";
export declare const USER_CREATED: "user-created";
export declare const USER_UPDATED: "user-updated";
export declare const USER_DELETED: "user-deleted";
export declare const DROP_ENVIRONMENTS: "drop-environments";
export declare const ENVIRONMENT_IMPORT: "environment-import";
export declare const ENVIRONMENT_CREATED: "environment-created";
export declare const ENVIRONMENT_UPDATED: "environment-updated";
export declare const ENVIRONMENT_DELETED: "environment-deleted";
export declare const SEGMENT_CREATED: "segment-created";
export declare const SEGMENT_UPDATED: "segment-updated";
export declare const SEGMENT_DELETED: "segment-deleted";
export declare const SEGMENT_IMPORT: "segment-import";
export declare const GROUP_CREATED: "group-created";
export declare const GROUP_UPDATED: "group-updated";
export declare const GROUP_DELETED: "group-deleted";
export declare const GROUP_USER_ADDED: "group-user-added";
export declare const GROUP_USER_REMOVED: "group-user-removed";
export declare const SETTING_CREATED: "setting-created";
export declare const SETTING_UPDATED: "setting-updated";
export declare const SETTING_DELETED: "setting-deleted";
export declare const PROJECT_ENVIRONMENT_ADDED: "project-environment-added";
export declare const PROJECT_ENVIRONMENT_REMOVED: "project-environment-removed";
export declare const DEFAULT_STRATEGY_UPDATED: "default-strategy-updated";
export declare const CLIENT_METRICS: "client-metrics";
export declare const CLIENT_METRICS_ADDED: "client-metrics-added";
export declare const CLIENT_REGISTER: "client-register";
export declare const PAT_CREATED: "pat-created";
export declare const PAT_DELETED: "pat-deleted";
export declare const PUBLIC_SIGNUP_TOKEN_CREATED: "public-signup-token-created";
export declare const PUBLIC_SIGNUP_TOKEN_USER_ADDED: "public-signup-token-user-added";
export declare const PUBLIC_SIGNUP_TOKEN_TOKEN_UPDATED: "public-signup-token-updated";
export declare const CHANGE_REQUEST_CREATED: "change-request-created";
export declare const CHANGE_REQUEST_DISCARDED: "change-request-discarded";
export declare const CHANGE_ADDED: "change-added";
export declare const CHANGE_DISCARDED: "change-discarded";
export declare const CHANGE_EDITED: "change-edited";
export declare const CHANGE_REQUEST_APPROVED: "change-request-approved";
export declare const CHANGE_REQUEST_REJECTED: "change-request-rejected";
export declare const CHANGE_REQUEST_APPROVAL_ADDED: "change-request-approval-added";
export declare const CHANGE_REQUEST_CANCELLED: "change-request-cancelled";
export declare const CHANGE_REQUEST_SENT_TO_REVIEW: "change-request-sent-to-review";
export declare const CHANGE_REQUEST_APPLIED: "change-request-applied";
export declare const CHANGE_REQUEST_SCHEDULE_SUSPENDED: "change-request-schedule-suspended";
export declare const CHANGE_REQUEST_SCHEDULED: "change-request-scheduled";
export declare const CHANGE_REQUEST_SCHEDULED_APPLICATION_SUCCESS: "change-request-scheduled-application-success";
export declare const CHANGE_REQUEST_SCHEDULED_APPLICATION_FAILURE: "change-request-scheduled-application-failure";
export declare const CHANGE_REQUEST_CONFIGURATION_UPDATED: "change-request-configuration-updated";
export declare const API_TOKEN_CREATED: "api-token-created";
export declare const API_TOKEN_UPDATED: "api-token-updated";
export declare const API_TOKEN_DELETED: "api-token-deleted";
export declare const FEATURE_FAVORITED: "feature-favorited";
export declare const FEATURE_UNFAVORITED: "feature-unfavorited";
export declare const PROJECT_FAVORITED: "project-favorited";
export declare const PROJECT_UNFAVORITED: "project-unfavorited";
export declare const FEATURES_EXPORTED: "features-exported";
export declare const FEATURES_IMPORTED: "features-imported";
export declare const SERVICE_ACCOUNT_CREATED: "service-account-created";
export declare const SERVICE_ACCOUNT_UPDATED: "service-account-updated";
export declare const SERVICE_ACCOUNT_DELETED: "service-account-deleted";
export declare const FEATURE_POTENTIALLY_STALE_ON: "feature-potentially-stale-on";
export declare const BANNER_CREATED: "banner-created";
export declare const BANNER_UPDATED: "banner-updated";
export declare const BANNER_DELETED: "banner-deleted";
export declare const SIGNAL_ENDPOINT_CREATED: "signal-endpoint-created";
export declare const SIGNAL_ENDPOINT_UPDATED: "signal-endpoint-updated";
export declare const SIGNAL_ENDPOINT_DELETED: "signal-endpoint-deleted";
export declare const SIGNAL_ENDPOINT_TOKEN_CREATED: "signal-endpoint-token-created";
export declare const SIGNAL_ENDPOINT_TOKEN_UPDATED: "signal-endpoint-token-updated";
export declare const SIGNAL_ENDPOINT_TOKEN_DELETED: "signal-endpoint-token-deleted";
export declare const ACTIONS_CREATED: "actions-created";
export declare const ACTIONS_UPDATED: "actions-updated";
export declare const ACTIONS_DELETED: "actions-deleted";
export declare const RELEASE_PLAN_TEMPLATE_CREATED: "release-plan-template-created";
export declare const RELEASE_PLAN_TEMPLATE_UPDATED: "release-plan-template-updated";
export declare const RELEASE_PLAN_TEMPLATE_DELETED: "release-plan-template-deleted";
export declare const RELEASE_PLAN_TEMPLATE_ARCHIVED: "release-plan-template-archived";
export declare const RELEASE_PLAN_ADDED: "release-plan-added";
export declare const RELEASE_PLAN_REMOVED: "release-plan-removed";
export declare const RELEASE_PLAN_MILESTONE_STARTED: "release-plan-milestone-started";
export declare const USER_PREFERENCE_UPDATED: "user-preference-updated";
export declare const SCIM_USERS_DELETED: "scim-users-deleted";
export declare const SCIM_GROUPS_DELETED: "scim-groups-deleted";
export declare const IEventTypes: readonly ["application-created", "feature-created", "feature-deleted", "feature-updated", "feature-metadata-updated", "feature-variants-updated", "feature-environment-variants-updated", "feature-project-change", "feature-archived", "feature-revived", "feature-import", "feature-tagged", "feature-tag-import", "feature-strategy-update", "feature-strategy-add", "feature-strategy-remove", "feature-type-updated", "feature-completed", "feature-uncompleted", "strategy-order-changed", "drop-feature-tags", "feature-untagged", "feature-stale-on", "feature-stale-off", "drop-features", "feature-environment-enabled", "feature-environment-disabled", "strategy-created", "strategy-deleted", "strategy-deprecated", "strategy-reactivated", "strategy-updated", "strategy-import", "drop-strategies", "context-field-created", "context-field-updated", "context-field-deleted", "project-access-added", "project-access-user-roles-updated", "project-access-group-roles-updated", "project-access-user-roles-deleted", "project-access-group-roles-deleted", "project-access-updated", "project-created", "project-updated", "project-deleted", "project-archived", "project-revived", "project-import", "project-user-added", "project-user-removed", "project-user-role-changed", "project-group-role-changed", "project-group-added", "project-group-removed", "role-created", "role-updated", "role-deleted", "drop-projects", "tag-created", "tag-deleted", "tag-import", "drop-tags", "tag-type-created", "tag-type-deleted", "tag-type-updated", "tag-type-import", "drop-tag-types", "addon-config-created", "addon-config-updated", "addon-config-deleted", "db-pool-update", "user-created", "user-updated", "user-deleted", "drop-environments", "environment-import", "environment-created", "environment-updated", "environment-deleted", "segment-created", "segment-updated", "segment-deleted", "group-created", "group-updated", "group-deleted", "group-user-added", "group-user-removed", "setting-created", "setting-updated", "setting-deleted", "client-metrics", "client-register", "pat-created", "pat-deleted", "public-signup-token-created", "public-signup-token-user-added", "public-signup-token-updated", "change-request-created", "change-request-discarded", "change-added", "change-discarded", "change-edited", "change-request-rejected", "change-request-approved", "change-request-approval-added", "change-request-cancelled", "change-request-sent-to-review", "change-request-schedule-suspended", "change-request-applied", "change-request-scheduled", "change-request-scheduled-application-success", "change-request-scheduled-application-failure", "change-request-configuration-updated", "api-token-created", "api-token-updated", "api-token-deleted", "feature-favorited", "feature-unfavorited", "project-favorited", "project-unfavorited", "features-exported", "features-imported", "service-account-created", "service-account-deleted", "service-account-updated", "feature-potentially-stale-on", "feature-dependency-added", "feature-dependency-removed", "feature-dependencies-removed", "banner-created", "banner-updated", "banner-deleted", "project-environment-added", "project-environment-removed", "default-strategy-updated", "segment-import", "signal-endpoint-created", "signal-endpoint-updated", "signal-endpoint-deleted", "signal-endpoint-token-created", "signal-endpoint-token-updated", "signal-endpoint-token-deleted", "actions-created", "actions-updated", "actions-deleted", "release-plan-template-created", "release-plan-template-updated", "release-plan-template-deleted", "release-plan-template-archived", "release-plan-added", "release-plan-removed", "release-plan-milestone-started", "user-preference-updated", "scim-users-deleted", "scim-groups-deleted"];
export type IEventType = (typeof IEventTypes)[number];
export interface IBaseEvent {
    type: IEventType;
    createdBy: string;
    createdByUserId: number;
    project?: string;
    environment?: string;
    featureName?: string;
    ip: string;
    data?: any;
    preData?: any;
    tags?: ITag[];
}
export interface IEvent extends Omit<IBaseEvent, 'ip'> {
    id: number;
    createdAt: Date;
    ip?: string;
}
export interface IEnrichedEvent extends IEvent {
    label: string;
    summary: string;
}
export interface IEventList {
    totalEvents: number;
    events: IEvent[];
}
export declare class BaseEvent implements IBaseEvent {
    readonly type: IEventType;
    readonly createdBy: string;
    readonly createdByUserId: number;
    readonly ip: string;
    /**
     * @param type the type of the event we're creating.
     * @param auditUser User info used to track which user performed the action. Includes username (email or username), userId and ip
     */
    constructor(type: IEventType, auditUser: IAuditUser);
}
export declare class FeatureStaleEvent extends BaseEvent {
    readonly project: string;
    readonly featureName: string;
    constructor(p: {
        stale: boolean;
        project: string;
        featureName: string;
        auditUser: IAuditUser;
    });
}
export declare class FeatureEnvironmentEvent extends BaseEvent {
    readonly project: string;
    readonly featureName: string;
    readonly environment: string;
    constructor(p: {
        enabled: boolean;
        project: string;
        featureName: string;
        environment: string;
        auditUser: IAuditUser;
    });
}
export type StrategyIds = {
    strategyIds: string[];
};
export declare class StrategiesOrderChangedEvent extends BaseEvent {
    readonly project: string;
    readonly featureName: string;
    readonly environment: string;
    readonly data: StrategyIds;
    readonly preData: StrategyIds;
    constructor(p: {
        project: string;
        featureName: string;
        environment: string;
        data: StrategyIds;
        preData: StrategyIds;
        auditUser: IAuditUser;
    });
}
export declare class FeatureVariantEvent extends BaseEvent {
    readonly project: string;
    readonly featureName: string;
    readonly data: {
        variants: IVariant[];
    };
    readonly preData: {
        variants: IVariant[];
    };
    constructor(p: {
        project: string;
        featureName: string;
        newVariants: IVariant[];
        oldVariants: IVariant[];
        auditUser: IAuditUser;
    });
}
export declare class EnvironmentVariantEvent extends BaseEvent {
    readonly project: string;
    readonly environment: string;
    readonly featureName: string;
    readonly data: {
        variants: IVariant[];
    };
    readonly preData: {
        variants: IVariant[];
    };
    /**
     */
    constructor(p: {
        featureName: string;
        environment: string;
        project: string;
        newVariants: IVariant[];
        oldVariants: IVariant[];
        auditUser: IAuditUser;
    });
}
export declare class ProjectCreatedEvent extends BaseEvent {
    readonly project: string;
    readonly data: any;
    constructor(eventData: {
        data: any;
        project: string;
        auditUser: IAuditUser;
    });
}
export declare class ProjectUpdatedEvent extends BaseEvent {
    readonly project: string;
    readonly data: any;
    readonly preData: any;
    constructor(eventData: {
        data: any;
        preData: any;
        project: string;
        auditUser: IAuditUser;
    });
}
export declare class ProjectDeletedEvent extends BaseEvent {
    readonly project: string;
    constructor(eventData: {
        project: string;
        auditUser: IAuditUser;
    });
}
export declare class ProjectArchivedEvent extends BaseEvent {
    readonly project: string;
    constructor(eventData: {
        project: string;
        auditUser: IAuditUser;
    });
}
export declare class ProjectRevivedEvent extends BaseEvent {
    readonly project: string;
    constructor(eventData: {
        project: string;
        auditUser: IAuditUser;
    });
}
export declare class RoleUpdatedEvent extends BaseEvent {
    readonly data: any;
    readonly preData: any;
    constructor(eventData: {
        auditUser: IAuditUser;
        data: any;
        preData: any;
    });
}
export declare class FeatureChangeProjectEvent extends BaseEvent {
    readonly project: string;
    readonly featureName: string;
    readonly data: {
        oldProject: string;
        newProject: string;
    };
    constructor(p: {
        oldProject: string;
        newProject: string;
        featureName: string;
        auditUser: IAuditUser;
    });
}
export declare class FeatureCreatedEvent extends BaseEvent {
    readonly project: string;
    readonly featureName: string;
    readonly data: FeatureToggle;
    constructor(p: {
        project: string;
        featureName: string;
        data: FeatureToggle;
        auditUser: IAuditUser;
    });
}
export declare class ProjectImport extends BaseEvent {
    readonly data: IProject;
    constructor(p: {
        project: IProject;
        auditUser: IAuditUser;
    });
}
export declare class FeatureImport extends BaseEvent {
    readonly data: any;
    constructor(p: {
        feature: any;
        auditUser: IAuditUser;
    });
}
export declare class StrategyImport extends BaseEvent {
    readonly data: any;
    constructor(p: {
        strategy: any;
        auditUser: IAuditUser;
    });
}
export declare class EnvironmentImport extends BaseEvent {
    readonly data: IEnvironment;
    constructor(p: {
        env: IEnvironment;
        auditUser: IAuditUser;
    });
}
export declare class TagTypeImport extends BaseEvent {
    readonly data: ITagType;
    constructor(p: {
        tagType: ITagType;
        auditUser: IAuditUser;
    });
}
export declare class TagImport extends BaseEvent {
    readonly data: ITag;
    constructor(p: {
        tag: ITag;
        auditUser: IAuditUser;
    });
}
export declare class FeatureTagImport extends BaseEvent {
    readonly data: IFeatureAndTag;
    constructor(p: {
        featureTag: IFeatureAndTag;
        auditUser: IAuditUser;
    });
}
export declare class FeatureCompletedEvent extends BaseEvent {
    readonly featureName: string;
    readonly data: FeatureLifecycleCompletedSchema & {
        kept: boolean;
    };
    readonly project: string;
    constructor(p: {
        project: string;
        featureName: string;
        data: FeatureLifecycleCompletedSchema & {
            kept: boolean;
        };
        auditUser: IAuditUser;
    });
}
export declare class FeatureUncompletedEvent extends BaseEvent {
    readonly featureName: string;
    readonly project: string;
    constructor(p: {
        featureName: string;
        auditUser: IAuditUser;
        project: string;
    });
}
export declare class FeatureUpdatedEvent extends BaseEvent {
    readonly data: any;
    readonly featureName: string;
    readonly project: string;
    constructor(eventData: {
        project: string;
        featureName: string;
        data: any;
        auditUser: IAuditUser;
    });
}
export declare class FeatureTaggedEvent extends BaseEvent {
    readonly data: any;
    readonly featureName: string;
    readonly project: string;
    constructor(eventData: {
        project: string;
        featureName: string;
        data: any;
        auditUser: IAuditUser;
    });
}
export declare class FeatureTypeUpdatedEvent extends BaseEvent {
    readonly data: any;
    readonly preData: any;
    constructor(eventData: {
        data: any;
        preData: any;
        auditUser: IAuditUser;
    });
}
export declare class FeatureDependencyAddedEvent extends BaseEvent {
    readonly project: string;
    readonly featureName: string;
    readonly data: any;
    constructor(eventData: {
        project: string;
        featureName: string;
        auditUser: IAuditUser;
        data: any;
    });
}
export declare class FeatureDependencyRemovedEvent extends BaseEvent {
    readonly project: string;
    readonly featureName: string;
    readonly data: any;
    constructor(eventData: {
        project: string;
        featureName: string;
        auditUser: IAuditUser;
        data: any;
    });
}
export declare class FeatureDependenciesRemovedEvent extends BaseEvent {
    readonly project: string;
    readonly featureName: string;
    constructor(eventData: {
        project: string;
        featureName: string;
        auditUser: IAuditUser;
    });
}
export declare class FeaturesImportedEvent extends BaseEvent {
    readonly project: string;
    readonly environment: string;
    constructor(eventData: {
        project: string;
        environment: string;
        auditUser: IAuditUser;
    });
}
export declare class FeatureArchivedEvent extends BaseEvent {
    readonly project: string;
    readonly featureName: string;
    constructor(p: {
        project: string;
        featureName: string;
        auditUser: IAuditUser;
    });
}
export declare class FeatureRevivedEvent extends BaseEvent {
    readonly project: string;
    readonly featureName: string;
    /**
     */
    constructor(p: {
        project: string;
        featureName: string;
        auditUser: IAuditUser;
    });
}
export declare class FeatureDeletedEvent extends BaseEvent {
    readonly project: string;
    readonly featureName: string;
    readonly preData: FeatureToggle;
    readonly tags: ITag[];
    /**
     */
    constructor(p: {
        project: string;
        featureName: string;
        preData: FeatureToggle;
        tags: ITag[];
        auditUser: IAuditUser;
    });
}
export declare class FeatureMetadataUpdateEvent extends BaseEvent {
    readonly project: string;
    readonly featureName: string;
    readonly data: FeatureToggle;
    readonly preData: FeatureToggle;
    /**
     */
    constructor(p: {
        featureName: string;
        project: string;
        data: FeatureToggle;
        preData: FeatureToggle;
        auditUser: IAuditUser;
    });
}
export declare class FeatureStrategyAddEvent extends BaseEvent {
    readonly project: string;
    readonly featureName: string;
    readonly environment: string;
    readonly data: IStrategyConfig;
    /**
     */
    constructor(p: {
        project: string;
        featureName: string;
        environment: string;
        data: IStrategyConfig;
        auditUser: IAuditUser;
    });
}
export declare class FeatureStrategyUpdateEvent extends BaseEvent {
    readonly project: string;
    readonly featureName: string;
    readonly environment: string;
    readonly data: IStrategyConfig;
    readonly preData: IStrategyConfig;
    /**
     */
    constructor(p: {
        project: string;
        featureName: string;
        environment: string;
        data: IStrategyConfig;
        preData: IStrategyConfig;
        auditUser: IAuditUser;
    });
}
export declare class FeatureStrategyRemoveEvent extends BaseEvent {
    readonly project: string;
    readonly featureName: string;
    readonly environment: string;
    readonly preData: IStrategyConfig;
    constructor(p: {
        project: string;
        featureName: string;
        environment: string;
        preData: IStrategyConfig;
        auditUser: IAuditUser;
    });
}
export declare class FeatureFavoritedEvent extends BaseEvent {
    readonly featureName: string;
    readonly data: any;
    constructor(eventData: {
        featureName: string;
        data: any;
        auditUser: IAuditUser;
    });
}
export declare class ProjectFavoritedEvent extends BaseEvent {
    readonly project: string;
    readonly data: any;
    constructor(eventData: {
        project: string;
        data: any;
        auditUser: IAuditUser;
    });
}
export declare class FeatureUnfavoritedEvent extends BaseEvent {
    readonly featureName: string;
    readonly data: any;
    constructor(eventData: {
        featureName: string;
        data: any;
        auditUser: IAuditUser;
    });
}
export declare class ProjectUnfavoritedEvent extends BaseEvent {
    readonly project: string;
    readonly data: any;
    constructor(eventData: {
        project: string;
        data: any;
        auditUser: IAuditUser;
    });
}
export declare class ProjectUserAddedEvent extends BaseEvent {
    readonly project: string;
    readonly data: any;
    readonly preData: any;
    /**
     */
    constructor(p: {
        project: string;
        data: any;
        auditUser: IAuditUser;
    });
}
export declare class ProjectUserRemovedEvent extends BaseEvent {
    readonly project: string;
    readonly data: any;
    readonly preData: any;
    constructor(p: {
        project: string;
        preData: any;
        auditUser: IAuditUser;
    });
}
export declare class ProjectUserUpdateRoleEvent extends BaseEvent {
    readonly project: string;
    readonly data: any;
    readonly preData: any;
    constructor(eventData: {
        project: string;
        data: any;
        preData: any;
        auditUser: IAuditUser;
    });
}
export declare class ProjectGroupAddedEvent extends BaseEvent {
    readonly project: string;
    readonly data: any;
    readonly preData: any;
    constructor(p: {
        project: string;
        data: any;
        auditUser: IAuditUser;
    });
}
export declare class ProjectGroupRemovedEvent extends BaseEvent {
    readonly project: string;
    readonly data: any;
    readonly preData: any;
    /**
     */
    constructor(p: {
        project: string;
        preData: any;
        auditUser: IAuditUser;
    });
}
export declare class ProjectGroupUpdateRoleEvent extends BaseEvent {
    readonly project: string;
    readonly data: any;
    readonly preData: any;
    /**
     */
    constructor(eventData: {
        project: string;
        data: any;
        preData: any;
        auditUser: IAuditUser;
    });
}
export declare class ProjectAccessAddedEvent extends BaseEvent {
    readonly project: string;
    readonly data: any;
    readonly preData: any;
    constructor(p: {
        project: string;
        data: any;
        auditUser: IAuditUser;
    });
}
export declare class ProjectAccessUserRolesUpdated extends BaseEvent {
    readonly project: string;
    readonly data: any;
    readonly preData: any;
    constructor(p: {
        project: string;
        data: any;
        preData: any;
        auditUser: IAuditUser;
    });
}
export declare class ProjectAccessGroupRolesUpdated extends BaseEvent {
    readonly project: string;
    readonly data: any;
    readonly preData: any;
    constructor(p: {
        project: string;
        data: any;
        preData: any;
        auditUser: IAuditUser;
    });
}
export declare class GroupUserRemoved extends BaseEvent {
    readonly preData: any;
    constructor(p: {
        userId: number;
        groupId: number;
        auditUser: IAuditUser;
    });
}
export declare class GroupUserAdded extends BaseEvent {
    readonly data: any;
    constructor(p: {
        userId: number;
        groupId: number;
        auditUser: IAuditUser;
    });
}
export declare class ProjectAccessUserRolesDeleted extends BaseEvent {
    readonly project: string;
    readonly data: null;
    readonly preData: any;
    constructor(p: {
        project: string;
        preData: any;
        auditUser: IAuditUser;
    });
}
export declare class ProjectAccessGroupRolesDeleted extends BaseEvent {
    readonly project: string;
    readonly data: null;
    readonly preData: any;
    constructor(p: {
        project: string;
        preData: any;
        auditUser: IAuditUser;
    });
}
export declare class SettingCreatedEvent extends BaseEvent {
    readonly data: any;
    constructor(eventData: {
        data: any;
        auditUser: IAuditUser;
    });
}
export declare class SettingDeletedEvent extends BaseEvent {
    readonly data: any;
    constructor(eventData: {
        data: any;
        auditUser: IAuditUser;
    });
}
export declare class SettingUpdatedEvent extends BaseEvent {
    readonly data: any;
    readonly preData: any;
    constructor(eventData: {
        data: any;
        auditUser: IAuditUser;
    }, preData: any);
}
export declare class PublicSignupTokenCreatedEvent extends BaseEvent {
    readonly data: any;
    constructor(eventData: {
        data: any;
        auditUser: IAuditUser;
    });
}
export declare class PublicSignupTokenUpdatedEvent extends BaseEvent {
    readonly data: any;
    constructor(eventData: {
        data: any;
        auditUser: IAuditUser;
    });
}
export declare class PublicSignupTokenUserAddedEvent extends BaseEvent {
    readonly data: any;
    constructor(eventData: {
        data: any;
        auditUser: IAuditUser;
    });
}
export declare class ApiTokenCreatedEvent extends BaseEvent {
    readonly data: any;
    readonly environment: string;
    readonly project: string;
    constructor(eventData: {
        apiToken: Omit<IApiToken, 'secret'>;
        auditUser: IAuditUser;
    });
}
export declare class ApiTokenDeletedEvent extends BaseEvent {
    readonly preData: any;
    readonly environment: string;
    readonly project: string;
    constructor(eventData: {
        apiToken: Omit<IApiToken, 'secret'>;
        auditUser: IAuditUser;
    });
}
export declare class ApiTokenUpdatedEvent extends BaseEvent {
    readonly preData: any;
    readonly data: any;
    readonly environment: string;
    readonly project: string;
    constructor(eventData: {
        previousToken: Omit<IApiToken, 'secret'>;
        apiToken: Omit<IApiToken, 'secret'>;
        auditUser: IAuditUser;
    });
}
export declare class PotentiallyStaleOnEvent extends BaseEvent {
    readonly featureName: string;
    readonly project: string;
    constructor(eventData: {
        featureName: string;
        project: string;
        auditUser: IAuditUser;
    });
}
export declare class UserCreatedEvent extends BaseEvent {
    readonly data: IUserEventData;
    constructor(eventData: {
        userCreated: IUserEventData;
        auditUser: IAuditUser;
    });
}
export declare class UserUpdatedEvent extends BaseEvent {
    readonly data: IUserEventData;
    readonly preData: IUserEventData;
    constructor(eventData: {
        preUser: IUserEventData;
        postUser: IUserEventData;
        auditUser: IAuditUser;
    });
}
export declare class UserDeletedEvent extends BaseEvent {
    readonly preData: IUserEventData;
    constructor(eventData: {
        deletedUser: IUserEventData;
        auditUser: IAuditUser;
    });
}
export declare class ScimUsersDeleted extends BaseEvent {
    readonly data: any;
    constructor(eventData: {
        data: any;
        auditUser: IAuditUser;
    });
}
export declare class ScimGroupsDeleted extends BaseEvent {
    readonly data: any;
    constructor(eventData: {
        data: any;
        auditUser: IAuditUser;
    });
}
export declare class TagTypeCreatedEvent extends BaseEvent {
    readonly data: any;
    constructor(eventData: {
        auditUser: IAuditUser;
        data: any;
    });
}
export declare class TagTypeDeletedEvent extends BaseEvent {
    readonly preData: any;
    constructor(eventData: {
        auditUser: IAuditUser;
        preData: any;
    });
}
export declare class TagTypeUpdatedEvent extends BaseEvent {
    readonly data: any;
    constructor(eventData: {
        auditUser: IAuditUser;
        data: any;
    });
}
export declare class TagCreatedEvent extends BaseEvent {
    readonly data: any;
    constructor(eventData: {
        auditUser: IAuditUser;
        data: any;
    });
}
export declare class TagDeletedEvent extends BaseEvent {
    readonly data: any;
    constructor(eventData: {
        auditUser: IAuditUser;
        data: any;
    });
}
export declare class PatCreatedEvent extends BaseEvent {
    readonly data: any;
    constructor(eventData: {
        auditUser: IAuditUser;
        data: any;
    });
}
export declare class PatDeletedEvent extends BaseEvent {
    readonly data: any;
    constructor(eventData: {
        auditUser: IAuditUser;
        data: any;
    });
}
export declare class ProjectEnvironmentAdded extends BaseEvent {
    readonly project: string;
    readonly environment: string;
    constructor(eventData: {
        project: string;
        environment: string;
        auditUser: IAuditUser;
    });
}
export declare class ProjectEnvironmentRemoved extends BaseEvent {
    readonly project: string;
    readonly environment: string;
    constructor(eventData: {
        project: string;
        environment: string;
        auditUser: IAuditUser;
    });
}
export declare class FeaturesExportedEvent extends BaseEvent {
    readonly data: any;
    constructor(eventData: {
        auditUser: IAuditUser;
        data: any;
    });
}
export declare class DropProjectsEvent extends BaseEvent {
    readonly data: any;
    constructor(eventData: {
        auditUser: IAuditUser;
    });
}
export declare class DropFeaturesEvent extends BaseEvent {
    readonly data: any;
    constructor(eventData: {
        auditUser: IAuditUser;
    });
}
export declare class DropStrategiesEvent extends BaseEvent {
    readonly data: any;
    constructor(eventData: {
        auditUser: IAuditUser;
    });
}
export declare class DropEnvironmentsEvent extends BaseEvent {
    readonly data: any;
    constructor(eventData: {
        auditUser: IAuditUser;
    });
}
export declare class DropFeatureTagsEvent extends BaseEvent {
    readonly data: any;
    constructor(eventData: {
        auditUser: IAuditUser;
    });
}
export declare class DropTagsEvent extends BaseEvent {
    readonly data: any;
    constructor(eventData: {
        auditUser: IAuditUser;
    });
}
export declare class DropTagTypesEvent extends BaseEvent {
    readonly data: any;
    constructor(eventData: {
        auditUser: IAuditUser;
    });
}
export declare class RoleCreatedEvent extends BaseEvent {
    readonly data: any;
    constructor(eventData: {
        data: any;
        auditUser: IAuditUser;
    });
}
export declare class RoleDeletedEvent extends BaseEvent {
    readonly preData: any;
    constructor(eventData: {
        preData: any;
        auditUser: IAuditUser;
    });
}
export declare class StrategyCreatedEvent extends BaseEvent {
    readonly data: any;
    constructor(eventData: {
        data: any;
        auditUser: IAuditUser;
    });
}
export declare class StrategyUpdatedEvent extends BaseEvent {
    readonly data: any;
    constructor(eventData: {
        data: any;
        auditUser: IAuditUser;
    });
}
export declare class StrategyDeletedEvent extends BaseEvent {
    readonly data: any;
    constructor(eventData: {
        data: any;
        auditUser: IAuditUser;
    });
}
export declare class StrategyDeprecatedEvent extends BaseEvent {
    readonly data: any;
    constructor(eventData: {
        data: any;
        auditUser: IAuditUser;
    });
}
export declare class StrategyReactivatedEvent extends BaseEvent {
    readonly data: any;
    constructor(eventData: {
        data: any;
        auditUser: IAuditUser;
    });
}
export declare class DefaultStrategyUpdatedEvent extends BaseEvent {
    readonly project: string;
    readonly environment: string;
    readonly preData: any;
    readonly data: any;
    constructor(eventData: {
        project: string;
        environment: string;
        auditUser: IAuditUser;
        preData: any;
        data: any;
    });
}
export declare class AddonConfigCreatedEvent extends BaseEvent {
    readonly data: any;
    constructor(eventData: {
        auditUser: IAuditUser;
        data: any;
    });
}
export declare class AddonConfigUpdatedEvent extends BaseEvent {
    readonly data: any;
    readonly preData: any;
    constructor(eventData: {
        auditUser: IAuditUser;
        data: any;
        preData: any;
    });
}
export declare class AddonConfigDeletedEvent extends BaseEvent {
    readonly preData: any;
    constructor(eventData: {
        auditUser: IAuditUser;
        preData: any;
    });
}
export declare class SegmentCreatedEvent extends BaseEvent {
    readonly project: string | undefined;
    readonly data: any;
    constructor(eventData: {
        auditUser: IAuditUser;
        project: string | undefined;
        data: any;
    });
}
export declare class SegmentUpdatedEvent extends BaseEvent {
    readonly data: any;
    readonly preData: any;
    readonly project: string;
    constructor(eventData: {
        auditUser: IAuditUser;
        project: string;
        data: any;
        preData: any;
    });
}
export declare class SegmentDeletedEvent extends BaseEvent {
    readonly preData: any;
    readonly project?: string;
    constructor(eventData: {
        auditUser: IAuditUser;
        preData: any;
        project?: string;
    });
}
export declare class GroupUpdatedEvent extends BaseEvent {
    readonly preData: any;
    readonly data: any;
    constructor(eventData: {
        data: any;
        preData: any;
        auditUser: IAuditUser;
    });
}
export declare class GroupDeletedEvent extends BaseEvent {
    readonly preData: any;
    constructor(eventData: {
        preData: any;
        auditUser: IAuditUser;
    });
}
export declare class ReleasePlanTemplateCreatedEvent extends BaseEvent {
    readonly data: any;
    constructor(eventData: {
        data: any;
        auditUser: IAuditUser;
    });
}
export declare class ReleasePlanTemplateUpdatedEvent extends BaseEvent {
    readonly preData: any;
    readonly data: any;
    constructor(eventData: {
        data: any;
        preData: any;
        auditUser: IAuditUser;
    });
}
export declare class ReleasePlanTemplateDeletedEvent extends BaseEvent {
    readonly preData: any;
    constructor(eventData: {
        preData: any;
        auditUser: IAuditUser;
    });
}
export declare class ReleasePlanTemplateArchivedEvent extends BaseEvent {
    readonly preData: any;
    readonly data: any;
    constructor(eventData: {
        data: any;
        preData: any;
        auditUser: IAuditUser;
    });
}
export declare class ReleasePlanAddedEvent extends BaseEvent {
    readonly project: string;
    readonly featureName: string;
    readonly environment: string;
    readonly data: any;
    constructor(eventData: {
        project: string;
        featureName: string;
        environment: string;
        data: any;
        auditUser: IAuditUser;
    });
}
export declare class ReleasePlanRemovedEvent extends BaseEvent {
    readonly project: string;
    readonly featureName: string;
    readonly environment: string;
    readonly preData: any;
    constructor(eventData: {
        project: string;
        featureName: string;
        environment: string;
        preData: any;
        auditUser: IAuditUser;
    });
}
export declare class ReleasePlanMilestoneStartedEvent extends BaseEvent {
    readonly project: string;
    readonly featureName: string;
    readonly environment: string;
    readonly preData: any;
    readonly data: any;
    constructor(eventData: {
        project: string;
        featureName: string;
        environment: string;
        preData: any;
        data: any;
        auditUser: IAuditUser;
    });
}
interface IUserEventData extends Pick<IUserWithRootRole, 'id' | 'name' | 'username' | 'email' | 'rootRole'> {
}
export declare class UserPreferenceUpdatedEvent extends BaseEvent {
    readonly userId: any;
    readonly data: any;
    constructor(eventData: {
        userId: number;
        data: any;
        auditUser: IAuditUser;
    });
}
export {};
//# sourceMappingURL=events.d.ts.map