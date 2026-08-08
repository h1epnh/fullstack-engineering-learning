"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROJECT_CREATED = exports.ROLE_DELETED = exports.ROLE_UPDATED = exports.ROLE_CREATED = exports.PROJECT_ACCESS_GROUP_ROLES_DELETED = exports.PROJECT_ACCESS_USER_ROLES_DELETED = exports.PROJECT_ACCESS_UPDATED = exports.PROJECT_ACCESS_GROUP_ROLES_UPDATED = exports.PROJECT_ACCESS_USER_ROLES_UPDATED = exports.FEATURE_TYPE_UPDATED = exports.PROJECT_ACCESS_ADDED = exports.CONTEXT_FIELD_DELETED = exports.CONTEXT_FIELD_UPDATED = exports.CONTEXT_FIELD_CREATED = exports.DROP_STRATEGIES = exports.STRATEGY_IMPORT = exports.STRATEGY_UPDATED = exports.STRATEGY_REACTIVATED = exports.STRATEGY_DEPRECATED = exports.STRATEGY_DELETED = exports.STRATEGY_CREATED = exports.STRATEGY_ORDER_CHANGED = exports.FEATURE_ENVIRONMENT_DISABLED = exports.FEATURE_ENVIRONMENT_ENABLED = exports.DROP_FEATURES = exports.FEATURE_STALE_OFF = exports.FEATURE_UNCOMPLETED = exports.FEATURE_COMPLETED = exports.FEATURE_STALE_ON = exports.FEATURE_UNTAGGED = exports.DROP_FEATURE_TAGS = exports.FEATURE_STRATEGY_REMOVE = exports.FEATURE_STRATEGY_ADD = exports.FEATURE_STRATEGY_UPDATE = exports.FEATURE_TAG_IMPORT = exports.FEATURE_TAGGED = exports.FEATURE_IMPORT = exports.FEATURE_REVIVED = exports.FEATURE_ARCHIVED = exports.FEATURE_PROJECT_CHANGE = exports.FEATURE_ENVIRONMENT_VARIANTS_UPDATED = exports.FEATURE_VARIANTS_UPDATED = exports.FEATURE_METADATA_UPDATED = exports.FEATURE_DEPENDENCIES_REMOVED = exports.FEATURE_DEPENDENCY_REMOVED = exports.FEATURE_DEPENDENCY_ADDED = exports.FEATURE_UPDATED = exports.FEATURE_DELETED = exports.FEATURE_CREATED = exports.APPLICATION_CREATED = void 0;
exports.CLIENT_METRICS_ADDED = exports.CLIENT_METRICS = exports.DEFAULT_STRATEGY_UPDATED = exports.PROJECT_ENVIRONMENT_REMOVED = exports.PROJECT_ENVIRONMENT_ADDED = exports.SETTING_DELETED = exports.SETTING_UPDATED = exports.SETTING_CREATED = exports.GROUP_USER_REMOVED = exports.GROUP_USER_ADDED = exports.GROUP_DELETED = exports.GROUP_UPDATED = exports.GROUP_CREATED = exports.SEGMENT_IMPORT = exports.SEGMENT_DELETED = exports.SEGMENT_UPDATED = exports.SEGMENT_CREATED = exports.ENVIRONMENT_DELETED = exports.ENVIRONMENT_UPDATED = exports.ENVIRONMENT_CREATED = exports.ENVIRONMENT_IMPORT = exports.DROP_ENVIRONMENTS = exports.USER_DELETED = exports.USER_UPDATED = exports.USER_CREATED = exports.DB_POOL_UPDATE = exports.ADDON_CONFIG_DELETED = exports.ADDON_CONFIG_UPDATED = exports.ADDON_CONFIG_CREATED = exports.DROP_TAG_TYPES = exports.TAG_TYPE_IMPORT = exports.TAG_TYPE_UPDATED = exports.TAG_TYPE_DELETED = exports.TAG_TYPE_CREATED = exports.DROP_TAGS = exports.TAG_IMPORT = exports.TAG_DELETED = exports.TAG_CREATED = exports.DROP_PROJECTS = exports.PROJECT_GROUP_ROLE_CHANGED = exports.PROJECT_GROUP_REMOVED = exports.PROJECT_GROUP_ADDED = exports.PROJECT_USER_ROLE_CHANGED = exports.PROJECT_USER_REMOVED = exports.PROJECT_USER_ADDED = exports.PROJECT_IMPORT = exports.PROJECT_REVIVED = exports.PROJECT_ARCHIVED = exports.PROJECT_DELETED = exports.PROJECT_UPDATED = void 0;
exports.RELEASE_PLAN_TEMPLATE_DELETED = exports.RELEASE_PLAN_TEMPLATE_UPDATED = exports.RELEASE_PLAN_TEMPLATE_CREATED = exports.ACTIONS_DELETED = exports.ACTIONS_UPDATED = exports.ACTIONS_CREATED = exports.SIGNAL_ENDPOINT_TOKEN_DELETED = exports.SIGNAL_ENDPOINT_TOKEN_UPDATED = exports.SIGNAL_ENDPOINT_TOKEN_CREATED = exports.SIGNAL_ENDPOINT_DELETED = exports.SIGNAL_ENDPOINT_UPDATED = exports.SIGNAL_ENDPOINT_CREATED = exports.BANNER_DELETED = exports.BANNER_UPDATED = exports.BANNER_CREATED = exports.FEATURE_POTENTIALLY_STALE_ON = exports.SERVICE_ACCOUNT_DELETED = exports.SERVICE_ACCOUNT_UPDATED = exports.SERVICE_ACCOUNT_CREATED = exports.FEATURES_IMPORTED = exports.FEATURES_EXPORTED = exports.PROJECT_UNFAVORITED = exports.PROJECT_FAVORITED = exports.FEATURE_UNFAVORITED = exports.FEATURE_FAVORITED = exports.API_TOKEN_DELETED = exports.API_TOKEN_UPDATED = exports.API_TOKEN_CREATED = exports.CHANGE_REQUEST_CONFIGURATION_UPDATED = exports.CHANGE_REQUEST_SCHEDULED_APPLICATION_FAILURE = exports.CHANGE_REQUEST_SCHEDULED_APPLICATION_SUCCESS = exports.CHANGE_REQUEST_SCHEDULED = exports.CHANGE_REQUEST_SCHEDULE_SUSPENDED = exports.CHANGE_REQUEST_APPLIED = exports.CHANGE_REQUEST_SENT_TO_REVIEW = exports.CHANGE_REQUEST_CANCELLED = exports.CHANGE_REQUEST_APPROVAL_ADDED = exports.CHANGE_REQUEST_REJECTED = exports.CHANGE_REQUEST_APPROVED = exports.CHANGE_EDITED = exports.CHANGE_DISCARDED = exports.CHANGE_ADDED = exports.CHANGE_REQUEST_DISCARDED = exports.CHANGE_REQUEST_CREATED = exports.PUBLIC_SIGNUP_TOKEN_TOKEN_UPDATED = exports.PUBLIC_SIGNUP_TOKEN_USER_ADDED = exports.PUBLIC_SIGNUP_TOKEN_CREATED = exports.PAT_DELETED = exports.PAT_CREATED = exports.CLIENT_REGISTER = void 0;
exports.ProjectUserAddedEvent = exports.ProjectUnfavoritedEvent = exports.FeatureUnfavoritedEvent = exports.ProjectFavoritedEvent = exports.FeatureFavoritedEvent = exports.FeatureStrategyRemoveEvent = exports.FeatureStrategyUpdateEvent = exports.FeatureStrategyAddEvent = exports.FeatureMetadataUpdateEvent = exports.FeatureDeletedEvent = exports.FeatureRevivedEvent = exports.FeatureArchivedEvent = exports.FeaturesImportedEvent = exports.FeatureDependenciesRemovedEvent = exports.FeatureDependencyRemovedEvent = exports.FeatureDependencyAddedEvent = exports.FeatureTypeUpdatedEvent = exports.FeatureTaggedEvent = exports.FeatureUpdatedEvent = exports.FeatureUncompletedEvent = exports.FeatureCompletedEvent = exports.FeatureTagImport = exports.TagImport = exports.TagTypeImport = exports.EnvironmentImport = exports.StrategyImport = exports.FeatureImport = exports.ProjectImport = exports.FeatureCreatedEvent = exports.FeatureChangeProjectEvent = exports.RoleUpdatedEvent = exports.ProjectRevivedEvent = exports.ProjectArchivedEvent = exports.ProjectDeletedEvent = exports.ProjectUpdatedEvent = exports.ProjectCreatedEvent = exports.EnvironmentVariantEvent = exports.FeatureVariantEvent = exports.StrategiesOrderChangedEvent = exports.FeatureEnvironmentEvent = exports.FeatureStaleEvent = exports.BaseEvent = exports.IEventTypes = exports.SCIM_GROUPS_DELETED = exports.SCIM_USERS_DELETED = exports.USER_PREFERENCE_UPDATED = exports.RELEASE_PLAN_MILESTONE_STARTED = exports.RELEASE_PLAN_REMOVED = exports.RELEASE_PLAN_ADDED = exports.RELEASE_PLAN_TEMPLATE_ARCHIVED = void 0;
exports.StrategyDeprecatedEvent = exports.StrategyDeletedEvent = exports.StrategyUpdatedEvent = exports.StrategyCreatedEvent = exports.RoleDeletedEvent = exports.RoleCreatedEvent = exports.DropTagTypesEvent = exports.DropTagsEvent = exports.DropFeatureTagsEvent = exports.DropEnvironmentsEvent = exports.DropStrategiesEvent = exports.DropFeaturesEvent = exports.DropProjectsEvent = exports.FeaturesExportedEvent = exports.ProjectEnvironmentRemoved = exports.ProjectEnvironmentAdded = exports.PatDeletedEvent = exports.PatCreatedEvent = exports.TagDeletedEvent = exports.TagCreatedEvent = exports.TagTypeUpdatedEvent = exports.TagTypeDeletedEvent = exports.TagTypeCreatedEvent = exports.ScimGroupsDeleted = exports.ScimUsersDeleted = exports.UserDeletedEvent = exports.UserUpdatedEvent = exports.UserCreatedEvent = exports.PotentiallyStaleOnEvent = exports.ApiTokenUpdatedEvent = exports.ApiTokenDeletedEvent = exports.ApiTokenCreatedEvent = exports.PublicSignupTokenUserAddedEvent = exports.PublicSignupTokenUpdatedEvent = exports.PublicSignupTokenCreatedEvent = exports.SettingUpdatedEvent = exports.SettingDeletedEvent = exports.SettingCreatedEvent = exports.ProjectAccessGroupRolesDeleted = exports.ProjectAccessUserRolesDeleted = exports.GroupUserAdded = exports.GroupUserRemoved = exports.ProjectAccessGroupRolesUpdated = exports.ProjectAccessUserRolesUpdated = exports.ProjectAccessAddedEvent = exports.ProjectGroupUpdateRoleEvent = exports.ProjectGroupRemovedEvent = exports.ProjectGroupAddedEvent = exports.ProjectUserUpdateRoleEvent = exports.ProjectUserRemovedEvent = void 0;
exports.UserPreferenceUpdatedEvent = exports.ReleasePlanMilestoneStartedEvent = exports.ReleasePlanRemovedEvent = exports.ReleasePlanAddedEvent = exports.ReleasePlanTemplateArchivedEvent = exports.ReleasePlanTemplateDeletedEvent = exports.ReleasePlanTemplateUpdatedEvent = exports.ReleasePlanTemplateCreatedEvent = exports.GroupDeletedEvent = exports.GroupUpdatedEvent = exports.SegmentDeletedEvent = exports.SegmentUpdatedEvent = exports.SegmentCreatedEvent = exports.AddonConfigDeletedEvent = exports.AddonConfigUpdatedEvent = exports.AddonConfigCreatedEvent = exports.DefaultStrategyUpdatedEvent = exports.StrategyReactivatedEvent = void 0;
exports.APPLICATION_CREATED = 'application-created';
// feature event types
exports.FEATURE_CREATED = 'feature-created';
exports.FEATURE_DELETED = 'feature-deleted';
exports.FEATURE_UPDATED = 'feature-updated';
exports.FEATURE_DEPENDENCY_ADDED = 'feature-dependency-added';
exports.FEATURE_DEPENDENCY_REMOVED = 'feature-dependency-removed';
exports.FEATURE_DEPENDENCIES_REMOVED = 'feature-dependencies-removed';
exports.FEATURE_METADATA_UPDATED = 'feature-metadata-updated';
exports.FEATURE_VARIANTS_UPDATED = 'feature-variants-updated';
exports.FEATURE_ENVIRONMENT_VARIANTS_UPDATED = 'feature-environment-variants-updated';
exports.FEATURE_PROJECT_CHANGE = 'feature-project-change';
exports.FEATURE_ARCHIVED = 'feature-archived';
exports.FEATURE_REVIVED = 'feature-revived';
exports.FEATURE_IMPORT = 'feature-import';
exports.FEATURE_TAGGED = 'feature-tagged';
exports.FEATURE_TAG_IMPORT = 'feature-tag-import';
exports.FEATURE_STRATEGY_UPDATE = 'feature-strategy-update';
exports.FEATURE_STRATEGY_ADD = 'feature-strategy-add';
exports.FEATURE_STRATEGY_REMOVE = 'feature-strategy-remove';
exports.DROP_FEATURE_TAGS = 'drop-feature-tags';
exports.FEATURE_UNTAGGED = 'feature-untagged';
exports.FEATURE_STALE_ON = 'feature-stale-on';
exports.FEATURE_COMPLETED = 'feature-completed';
exports.FEATURE_UNCOMPLETED = 'feature-uncompleted';
exports.FEATURE_STALE_OFF = 'feature-stale-off';
exports.DROP_FEATURES = 'drop-features';
exports.FEATURE_ENVIRONMENT_ENABLED = 'feature-environment-enabled';
exports.FEATURE_ENVIRONMENT_DISABLED = 'feature-environment-disabled';
exports.STRATEGY_ORDER_CHANGED = 'strategy-order-changed';
exports.STRATEGY_CREATED = 'strategy-created';
exports.STRATEGY_DELETED = 'strategy-deleted';
exports.STRATEGY_DEPRECATED = 'strategy-deprecated';
exports.STRATEGY_REACTIVATED = 'strategy-reactivated';
exports.STRATEGY_UPDATED = 'strategy-updated';
exports.STRATEGY_IMPORT = 'strategy-import';
exports.DROP_STRATEGIES = 'drop-strategies';
exports.CONTEXT_FIELD_CREATED = 'context-field-created';
exports.CONTEXT_FIELD_UPDATED = 'context-field-updated';
exports.CONTEXT_FIELD_DELETED = 'context-field-deleted';
exports.PROJECT_ACCESS_ADDED = 'project-access-added';
exports.FEATURE_TYPE_UPDATED = 'feature-type-updated';
exports.PROJECT_ACCESS_USER_ROLES_UPDATED = 'project-access-user-roles-updated';
exports.PROJECT_ACCESS_GROUP_ROLES_UPDATED = 'project-access-group-roles-updated';
exports.PROJECT_ACCESS_UPDATED = 'project-access-updated';
exports.PROJECT_ACCESS_USER_ROLES_DELETED = 'project-access-user-roles-deleted';
exports.PROJECT_ACCESS_GROUP_ROLES_DELETED = 'project-access-group-roles-deleted';
exports.ROLE_CREATED = 'role-created';
exports.ROLE_UPDATED = 'role-updated';
exports.ROLE_DELETED = 'role-deleted';
exports.PROJECT_CREATED = 'project-created';
exports.PROJECT_UPDATED = 'project-updated';
exports.PROJECT_DELETED = 'project-deleted';
exports.PROJECT_ARCHIVED = 'project-archived';
exports.PROJECT_REVIVED = 'project-revived';
exports.PROJECT_IMPORT = 'project-import';
exports.PROJECT_USER_ADDED = 'project-user-added';
exports.PROJECT_USER_REMOVED = 'project-user-removed';
exports.PROJECT_USER_ROLE_CHANGED = 'project-user-role-changed';
exports.PROJECT_GROUP_ADDED = 'project-group-added';
exports.PROJECT_GROUP_REMOVED = 'project-group-removed';
exports.PROJECT_GROUP_ROLE_CHANGED = 'project-group-role-changed';
exports.DROP_PROJECTS = 'drop-projects';
exports.TAG_CREATED = 'tag-created';
exports.TAG_DELETED = 'tag-deleted';
exports.TAG_IMPORT = 'tag-import';
exports.DROP_TAGS = 'drop-tags';
exports.TAG_TYPE_CREATED = 'tag-type-created';
exports.TAG_TYPE_DELETED = 'tag-type-deleted';
exports.TAG_TYPE_UPDATED = 'tag-type-updated';
exports.TAG_TYPE_IMPORT = 'tag-type-import';
exports.DROP_TAG_TYPES = 'drop-tag-types';
exports.ADDON_CONFIG_CREATED = 'addon-config-created';
exports.ADDON_CONFIG_UPDATED = 'addon-config-updated';
exports.ADDON_CONFIG_DELETED = 'addon-config-deleted';
exports.DB_POOL_UPDATE = 'db-pool-update';
exports.USER_CREATED = 'user-created';
exports.USER_UPDATED = 'user-updated';
exports.USER_DELETED = 'user-deleted';
exports.DROP_ENVIRONMENTS = 'drop-environments';
exports.ENVIRONMENT_IMPORT = 'environment-import';
exports.ENVIRONMENT_CREATED = 'environment-created';
exports.ENVIRONMENT_UPDATED = 'environment-updated';
exports.ENVIRONMENT_DELETED = 'environment-deleted';
exports.SEGMENT_CREATED = 'segment-created';
exports.SEGMENT_UPDATED = 'segment-updated';
exports.SEGMENT_DELETED = 'segment-deleted';
exports.SEGMENT_IMPORT = 'segment-import';
exports.GROUP_CREATED = 'group-created';
exports.GROUP_UPDATED = 'group-updated';
exports.GROUP_DELETED = 'group-deleted';
exports.GROUP_USER_ADDED = 'group-user-added';
exports.GROUP_USER_REMOVED = 'group-user-removed';
exports.SETTING_CREATED = 'setting-created';
exports.SETTING_UPDATED = 'setting-updated';
exports.SETTING_DELETED = 'setting-deleted';
exports.PROJECT_ENVIRONMENT_ADDED = 'project-environment-added';
exports.PROJECT_ENVIRONMENT_REMOVED = 'project-environment-removed';
exports.DEFAULT_STRATEGY_UPDATED = 'default-strategy-updated';
exports.CLIENT_METRICS = 'client-metrics';
exports.CLIENT_METRICS_ADDED = 'client-metrics-added';
exports.CLIENT_REGISTER = 'client-register';
exports.PAT_CREATED = 'pat-created';
exports.PAT_DELETED = 'pat-deleted';
exports.PUBLIC_SIGNUP_TOKEN_CREATED = 'public-signup-token-created';
exports.PUBLIC_SIGNUP_TOKEN_USER_ADDED = 'public-signup-token-user-added';
exports.PUBLIC_SIGNUP_TOKEN_TOKEN_UPDATED = 'public-signup-token-updated';
exports.CHANGE_REQUEST_CREATED = 'change-request-created';
exports.CHANGE_REQUEST_DISCARDED = 'change-request-discarded';
exports.CHANGE_ADDED = 'change-added';
exports.CHANGE_DISCARDED = 'change-discarded';
exports.CHANGE_EDITED = 'change-edited';
exports.CHANGE_REQUEST_APPROVED = 'change-request-approved';
exports.CHANGE_REQUEST_REJECTED = 'change-request-rejected';
exports.CHANGE_REQUEST_APPROVAL_ADDED = 'change-request-approval-added';
exports.CHANGE_REQUEST_CANCELLED = 'change-request-cancelled';
exports.CHANGE_REQUEST_SENT_TO_REVIEW = 'change-request-sent-to-review';
exports.CHANGE_REQUEST_APPLIED = 'change-request-applied';
exports.CHANGE_REQUEST_SCHEDULE_SUSPENDED = 'change-request-schedule-suspended';
exports.CHANGE_REQUEST_SCHEDULED = 'change-request-scheduled';
exports.CHANGE_REQUEST_SCHEDULED_APPLICATION_SUCCESS = 'change-request-scheduled-application-success';
exports.CHANGE_REQUEST_SCHEDULED_APPLICATION_FAILURE = 'change-request-scheduled-application-failure';
exports.CHANGE_REQUEST_CONFIGURATION_UPDATED = 'change-request-configuration-updated';
exports.API_TOKEN_CREATED = 'api-token-created';
exports.API_TOKEN_UPDATED = 'api-token-updated';
exports.API_TOKEN_DELETED = 'api-token-deleted';
exports.FEATURE_FAVORITED = 'feature-favorited';
exports.FEATURE_UNFAVORITED = 'feature-unfavorited';
exports.PROJECT_FAVORITED = 'project-favorited';
exports.PROJECT_UNFAVORITED = 'project-unfavorited';
exports.FEATURES_EXPORTED = 'features-exported';
exports.FEATURES_IMPORTED = 'features-imported';
exports.SERVICE_ACCOUNT_CREATED = 'service-account-created';
exports.SERVICE_ACCOUNT_UPDATED = 'service-account-updated';
exports.SERVICE_ACCOUNT_DELETED = 'service-account-deleted';
exports.FEATURE_POTENTIALLY_STALE_ON = 'feature-potentially-stale-on';
exports.BANNER_CREATED = 'banner-created';
exports.BANNER_UPDATED = 'banner-updated';
exports.BANNER_DELETED = 'banner-deleted';
exports.SIGNAL_ENDPOINT_CREATED = 'signal-endpoint-created';
exports.SIGNAL_ENDPOINT_UPDATED = 'signal-endpoint-updated';
exports.SIGNAL_ENDPOINT_DELETED = 'signal-endpoint-deleted';
exports.SIGNAL_ENDPOINT_TOKEN_CREATED = 'signal-endpoint-token-created';
exports.SIGNAL_ENDPOINT_TOKEN_UPDATED = 'signal-endpoint-token-updated';
exports.SIGNAL_ENDPOINT_TOKEN_DELETED = 'signal-endpoint-token-deleted';
exports.ACTIONS_CREATED = 'actions-created';
exports.ACTIONS_UPDATED = 'actions-updated';
exports.ACTIONS_DELETED = 'actions-deleted';
exports.RELEASE_PLAN_TEMPLATE_CREATED = 'release-plan-template-created';
exports.RELEASE_PLAN_TEMPLATE_UPDATED = 'release-plan-template-updated';
exports.RELEASE_PLAN_TEMPLATE_DELETED = 'release-plan-template-deleted';
exports.RELEASE_PLAN_TEMPLATE_ARCHIVED = 'release-plan-template-archived';
exports.RELEASE_PLAN_ADDED = 'release-plan-added';
exports.RELEASE_PLAN_REMOVED = 'release-plan-removed';
exports.RELEASE_PLAN_MILESTONE_STARTED = 'release-plan-milestone-started';
exports.USER_PREFERENCE_UPDATED = 'user-preference-updated';
exports.SCIM_USERS_DELETED = 'scim-users-deleted';
exports.SCIM_GROUPS_DELETED = 'scim-groups-deleted';
exports.IEventTypes = [
    exports.APPLICATION_CREATED,
    exports.FEATURE_CREATED,
    exports.FEATURE_DELETED,
    exports.FEATURE_UPDATED,
    exports.FEATURE_METADATA_UPDATED,
    exports.FEATURE_VARIANTS_UPDATED,
    exports.FEATURE_ENVIRONMENT_VARIANTS_UPDATED,
    exports.FEATURE_PROJECT_CHANGE,
    exports.FEATURE_ARCHIVED,
    exports.FEATURE_REVIVED,
    exports.FEATURE_IMPORT,
    exports.FEATURE_TAGGED,
    exports.FEATURE_TAG_IMPORT,
    exports.FEATURE_STRATEGY_UPDATE,
    exports.FEATURE_STRATEGY_ADD,
    exports.FEATURE_STRATEGY_REMOVE,
    exports.FEATURE_TYPE_UPDATED,
    exports.FEATURE_COMPLETED,
    exports.FEATURE_UNCOMPLETED,
    exports.STRATEGY_ORDER_CHANGED,
    exports.DROP_FEATURE_TAGS,
    exports.FEATURE_UNTAGGED,
    exports.FEATURE_STALE_ON,
    exports.FEATURE_STALE_OFF,
    exports.DROP_FEATURES,
    exports.FEATURE_ENVIRONMENT_ENABLED,
    exports.FEATURE_ENVIRONMENT_DISABLED,
    exports.STRATEGY_CREATED,
    exports.STRATEGY_DELETED,
    exports.STRATEGY_DEPRECATED,
    exports.STRATEGY_REACTIVATED,
    exports.STRATEGY_UPDATED,
    exports.STRATEGY_IMPORT,
    exports.DROP_STRATEGIES,
    exports.CONTEXT_FIELD_CREATED,
    exports.CONTEXT_FIELD_UPDATED,
    exports.CONTEXT_FIELD_DELETED,
    exports.PROJECT_ACCESS_ADDED,
    exports.PROJECT_ACCESS_USER_ROLES_UPDATED,
    exports.PROJECT_ACCESS_GROUP_ROLES_UPDATED,
    exports.PROJECT_ACCESS_USER_ROLES_DELETED,
    exports.PROJECT_ACCESS_GROUP_ROLES_DELETED,
    exports.PROJECT_ACCESS_UPDATED,
    exports.PROJECT_CREATED,
    exports.PROJECT_UPDATED,
    exports.PROJECT_DELETED,
    exports.PROJECT_ARCHIVED,
    exports.PROJECT_REVIVED,
    exports.PROJECT_IMPORT,
    exports.PROJECT_USER_ADDED,
    exports.PROJECT_USER_REMOVED,
    exports.PROJECT_USER_ROLE_CHANGED,
    exports.PROJECT_GROUP_ROLE_CHANGED,
    exports.PROJECT_GROUP_ADDED,
    exports.PROJECT_GROUP_REMOVED,
    exports.ROLE_CREATED,
    exports.ROLE_UPDATED,
    exports.ROLE_DELETED,
    exports.DROP_PROJECTS,
    exports.TAG_CREATED,
    exports.TAG_DELETED,
    exports.TAG_IMPORT,
    exports.DROP_TAGS,
    exports.TAG_TYPE_CREATED,
    exports.TAG_TYPE_DELETED,
    exports.TAG_TYPE_UPDATED,
    exports.TAG_TYPE_IMPORT,
    exports.DROP_TAG_TYPES,
    exports.ADDON_CONFIG_CREATED,
    exports.ADDON_CONFIG_UPDATED,
    exports.ADDON_CONFIG_DELETED,
    exports.DB_POOL_UPDATE,
    exports.USER_CREATED,
    exports.USER_UPDATED,
    exports.USER_DELETED,
    exports.DROP_ENVIRONMENTS,
    exports.ENVIRONMENT_IMPORT,
    exports.ENVIRONMENT_CREATED,
    exports.ENVIRONMENT_UPDATED,
    exports.ENVIRONMENT_DELETED,
    exports.SEGMENT_CREATED,
    exports.SEGMENT_UPDATED,
    exports.SEGMENT_DELETED,
    exports.GROUP_CREATED,
    exports.GROUP_UPDATED,
    exports.GROUP_DELETED,
    exports.GROUP_USER_ADDED,
    exports.GROUP_USER_REMOVED,
    exports.SETTING_CREATED,
    exports.SETTING_UPDATED,
    exports.SETTING_DELETED,
    exports.CLIENT_METRICS,
    exports.CLIENT_REGISTER,
    exports.PAT_CREATED,
    exports.PAT_DELETED,
    exports.PUBLIC_SIGNUP_TOKEN_CREATED,
    exports.PUBLIC_SIGNUP_TOKEN_USER_ADDED,
    exports.PUBLIC_SIGNUP_TOKEN_TOKEN_UPDATED,
    exports.CHANGE_REQUEST_CREATED,
    exports.CHANGE_REQUEST_DISCARDED,
    exports.CHANGE_ADDED,
    exports.CHANGE_DISCARDED,
    exports.CHANGE_EDITED,
    exports.CHANGE_REQUEST_REJECTED,
    exports.CHANGE_REQUEST_APPROVED,
    exports.CHANGE_REQUEST_APPROVAL_ADDED,
    exports.CHANGE_REQUEST_CANCELLED,
    exports.CHANGE_REQUEST_SENT_TO_REVIEW,
    exports.CHANGE_REQUEST_SCHEDULE_SUSPENDED,
    exports.CHANGE_REQUEST_APPLIED,
    exports.CHANGE_REQUEST_SCHEDULED,
    exports.CHANGE_REQUEST_SCHEDULED_APPLICATION_SUCCESS,
    exports.CHANGE_REQUEST_SCHEDULED_APPLICATION_FAILURE,
    exports.CHANGE_REQUEST_CONFIGURATION_UPDATED,
    exports.API_TOKEN_CREATED,
    exports.API_TOKEN_UPDATED,
    exports.API_TOKEN_DELETED,
    exports.FEATURE_FAVORITED,
    exports.FEATURE_UNFAVORITED,
    exports.PROJECT_FAVORITED,
    exports.PROJECT_UNFAVORITED,
    exports.FEATURES_EXPORTED,
    exports.FEATURES_IMPORTED,
    exports.SERVICE_ACCOUNT_CREATED,
    exports.SERVICE_ACCOUNT_DELETED,
    exports.SERVICE_ACCOUNT_UPDATED,
    exports.FEATURE_POTENTIALLY_STALE_ON,
    exports.FEATURE_DEPENDENCY_ADDED,
    exports.FEATURE_DEPENDENCY_REMOVED,
    exports.FEATURE_DEPENDENCIES_REMOVED,
    exports.BANNER_CREATED,
    exports.BANNER_UPDATED,
    exports.BANNER_DELETED,
    exports.PROJECT_ENVIRONMENT_ADDED,
    exports.PROJECT_ENVIRONMENT_REMOVED,
    exports.DEFAULT_STRATEGY_UPDATED,
    exports.SEGMENT_IMPORT,
    exports.SIGNAL_ENDPOINT_CREATED,
    exports.SIGNAL_ENDPOINT_UPDATED,
    exports.SIGNAL_ENDPOINT_DELETED,
    exports.SIGNAL_ENDPOINT_TOKEN_CREATED,
    exports.SIGNAL_ENDPOINT_TOKEN_UPDATED,
    exports.SIGNAL_ENDPOINT_TOKEN_DELETED,
    exports.ACTIONS_CREATED,
    exports.ACTIONS_UPDATED,
    exports.ACTIONS_DELETED,
    exports.RELEASE_PLAN_TEMPLATE_CREATED,
    exports.RELEASE_PLAN_TEMPLATE_UPDATED,
    exports.RELEASE_PLAN_TEMPLATE_DELETED,
    exports.RELEASE_PLAN_TEMPLATE_ARCHIVED,
    exports.RELEASE_PLAN_ADDED,
    exports.RELEASE_PLAN_REMOVED,
    exports.RELEASE_PLAN_MILESTONE_STARTED,
    exports.USER_PREFERENCE_UPDATED,
    exports.SCIM_USERS_DELETED,
    exports.SCIM_GROUPS_DELETED,
];
class BaseEvent {
    /**
     * @param type the type of the event we're creating.
     * @param auditUser User info used to track which user performed the action. Includes username (email or username), userId and ip
     */
    constructor(type, auditUser) {
        this.type = type;
        this.createdBy = auditUser.username || 'unknown';
        this.createdByUserId = auditUser.id || -1337;
        this.ip = auditUser.ip || '';
    }
}
exports.BaseEvent = BaseEvent;
class FeatureStaleEvent extends BaseEvent {
    constructor(p) {
        super(p.stale ? exports.FEATURE_STALE_ON : exports.FEATURE_STALE_OFF, p.auditUser);
        this.project = p.project;
        this.featureName = p.featureName;
    }
}
exports.FeatureStaleEvent = FeatureStaleEvent;
class FeatureEnvironmentEvent extends BaseEvent {
    constructor(p) {
        super(p.enabled
            ? exports.FEATURE_ENVIRONMENT_ENABLED
            : exports.FEATURE_ENVIRONMENT_DISABLED, p.auditUser);
        this.project = p.project;
        this.featureName = p.featureName;
        this.environment = p.environment;
    }
}
exports.FeatureEnvironmentEvent = FeatureEnvironmentEvent;
class StrategiesOrderChangedEvent extends BaseEvent {
    constructor(p) {
        super(exports.STRATEGY_ORDER_CHANGED, p.auditUser);
        const { project, featureName, environment, data, preData } = p;
        this.project = project;
        this.featureName = featureName;
        this.environment = environment;
        this.data = data;
        this.preData = preData;
    }
}
exports.StrategiesOrderChangedEvent = StrategiesOrderChangedEvent;
class FeatureVariantEvent extends BaseEvent {
    constructor(p) {
        super(exports.FEATURE_VARIANTS_UPDATED, p.auditUser);
        this.project = p.project;
        this.featureName = p.featureName;
        this.data = { variants: p.newVariants };
        this.preData = { variants: p.oldVariants };
    }
}
exports.FeatureVariantEvent = FeatureVariantEvent;
class EnvironmentVariantEvent extends BaseEvent {
    /**
     */
    constructor(p) {
        super(exports.FEATURE_ENVIRONMENT_VARIANTS_UPDATED, p.auditUser);
        this.featureName = p.featureName;
        this.environment = p.environment;
        this.project = p.project;
        this.data = { variants: p.newVariants };
        this.preData = { variants: p.oldVariants };
    }
}
exports.EnvironmentVariantEvent = EnvironmentVariantEvent;
class ProjectCreatedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.PROJECT_CREATED, eventData.auditUser);
        this.project = eventData.project;
        this.data = eventData.data;
    }
}
exports.ProjectCreatedEvent = ProjectCreatedEvent;
class ProjectUpdatedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.PROJECT_UPDATED, eventData.auditUser);
        this.project = eventData.project;
        this.data = eventData.data;
        this.preData = eventData.preData;
    }
}
exports.ProjectUpdatedEvent = ProjectUpdatedEvent;
class ProjectDeletedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.PROJECT_DELETED, eventData.auditUser);
        this.project = eventData.project;
    }
}
exports.ProjectDeletedEvent = ProjectDeletedEvent;
class ProjectArchivedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.PROJECT_ARCHIVED, eventData.auditUser);
        this.project = eventData.project;
    }
}
exports.ProjectArchivedEvent = ProjectArchivedEvent;
class ProjectRevivedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.PROJECT_REVIVED, eventData.auditUser);
        this.project = eventData.project;
    }
}
exports.ProjectRevivedEvent = ProjectRevivedEvent;
class RoleUpdatedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.ROLE_UPDATED, eventData.auditUser);
        this.data = eventData.data;
        this.preData = eventData.preData;
    }
}
exports.RoleUpdatedEvent = RoleUpdatedEvent;
class FeatureChangeProjectEvent extends BaseEvent {
    constructor(p) {
        super(exports.FEATURE_PROJECT_CHANGE, p.auditUser);
        const { newProject, oldProject, featureName } = p;
        this.project = newProject;
        this.featureName = featureName;
        this.data = {
            newProject,
            oldProject,
        };
    }
}
exports.FeatureChangeProjectEvent = FeatureChangeProjectEvent;
class FeatureCreatedEvent extends BaseEvent {
    constructor(p) {
        super(exports.FEATURE_CREATED, p.auditUser);
        const { project, featureName, data } = p;
        this.project = project;
        this.featureName = featureName;
        this.data = data;
    }
}
exports.FeatureCreatedEvent = FeatureCreatedEvent;
class ProjectImport extends BaseEvent {
    constructor(p) {
        super(exports.PROJECT_IMPORT, p.auditUser);
        this.data = p.project;
    }
}
exports.ProjectImport = ProjectImport;
class FeatureImport extends BaseEvent {
    constructor(p) {
        super(exports.FEATURE_IMPORT, p.auditUser);
        this.data = p.feature;
    }
}
exports.FeatureImport = FeatureImport;
class StrategyImport extends BaseEvent {
    constructor(p) {
        super(exports.STRATEGY_IMPORT, p.auditUser);
        this.data = p.strategy;
    }
}
exports.StrategyImport = StrategyImport;
class EnvironmentImport extends BaseEvent {
    constructor(p) {
        super(exports.ENVIRONMENT_IMPORT, p.auditUser);
        this.data = p.env;
    }
}
exports.EnvironmentImport = EnvironmentImport;
class TagTypeImport extends BaseEvent {
    constructor(p) {
        super(exports.TAG_TYPE_IMPORT, p.auditUser);
        this.data = p.tagType;
    }
}
exports.TagTypeImport = TagTypeImport;
class TagImport extends BaseEvent {
    constructor(p) {
        super(exports.TAG_IMPORT, p.auditUser);
        this.data = p.tag;
    }
}
exports.TagImport = TagImport;
class FeatureTagImport extends BaseEvent {
    constructor(p) {
        super(exports.FEATURE_TAG_IMPORT, p.auditUser);
        this.data = p.featureTag;
    }
}
exports.FeatureTagImport = FeatureTagImport;
class FeatureCompletedEvent extends BaseEvent {
    constructor(p) {
        super(exports.FEATURE_COMPLETED, p.auditUser);
        const { featureName, data, project } = p;
        this.featureName = featureName;
        this.data = data;
        this.project = project;
    }
}
exports.FeatureCompletedEvent = FeatureCompletedEvent;
class FeatureUncompletedEvent extends BaseEvent {
    constructor(p) {
        super(exports.FEATURE_UNCOMPLETED, p.auditUser);
        const { featureName, project } = p;
        this.featureName = featureName;
        this.project = project;
    }
}
exports.FeatureUncompletedEvent = FeatureUncompletedEvent;
class FeatureUpdatedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.FEATURE_UPDATED, eventData.auditUser);
        this.data = eventData.data;
        this.project = eventData.project;
        this.featureName = eventData.featureName;
    }
}
exports.FeatureUpdatedEvent = FeatureUpdatedEvent;
class FeatureTaggedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.FEATURE_TAGGED, eventData.auditUser);
        this.project = eventData.project;
        this.featureName = eventData.featureName;
        this.data = eventData.data;
    }
}
exports.FeatureTaggedEvent = FeatureTaggedEvent;
class FeatureTypeUpdatedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.FEATURE_TYPE_UPDATED, eventData.auditUser);
        this.data = eventData.data;
        this.preData = eventData.preData;
    }
}
exports.FeatureTypeUpdatedEvent = FeatureTypeUpdatedEvent;
class FeatureDependencyAddedEvent extends BaseEvent {
    constructor(eventData) {
        super('feature-dependency-added', eventData.auditUser);
        this.project = eventData.project;
        this.featureName = eventData.featureName;
        this.data = eventData.data;
    }
}
exports.FeatureDependencyAddedEvent = FeatureDependencyAddedEvent;
class FeatureDependencyRemovedEvent extends BaseEvent {
    constructor(eventData) {
        super('feature-dependency-removed', eventData.auditUser);
        this.project = eventData.project;
        this.featureName = eventData.featureName;
        this.data = eventData.data;
    }
}
exports.FeatureDependencyRemovedEvent = FeatureDependencyRemovedEvent;
class FeatureDependenciesRemovedEvent extends BaseEvent {
    constructor(eventData) {
        super('feature-dependencies-removed', eventData.auditUser);
        this.project = eventData.project;
        this.featureName = eventData.featureName;
    }
}
exports.FeatureDependenciesRemovedEvent = FeatureDependenciesRemovedEvent;
class FeaturesImportedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.FEATURES_IMPORTED, eventData.auditUser);
        this.project = eventData.project;
        this.environment = eventData.environment;
    }
}
exports.FeaturesImportedEvent = FeaturesImportedEvent;
class FeatureArchivedEvent extends BaseEvent {
    constructor(p) {
        super(exports.FEATURE_ARCHIVED, p.auditUser);
        const { project, featureName } = p;
        this.project = project;
        this.featureName = featureName;
    }
}
exports.FeatureArchivedEvent = FeatureArchivedEvent;
class FeatureRevivedEvent extends BaseEvent {
    /**
     */
    constructor(p) {
        super(exports.FEATURE_REVIVED, p.auditUser);
        const { project, featureName } = p;
        this.project = project;
        this.featureName = featureName;
    }
}
exports.FeatureRevivedEvent = FeatureRevivedEvent;
class FeatureDeletedEvent extends BaseEvent {
    /**
     */
    constructor(p) {
        super(exports.FEATURE_DELETED, p.auditUser);
        const { project, featureName, preData } = p;
        this.project = project;
        this.featureName = featureName;
        this.preData = preData;
        this.tags = p.tags;
    }
}
exports.FeatureDeletedEvent = FeatureDeletedEvent;
class FeatureMetadataUpdateEvent extends BaseEvent {
    /**
     */
    constructor(p) {
        super(exports.FEATURE_METADATA_UPDATED, p.auditUser);
        const { project, featureName, data, preData } = p;
        this.project = project;
        this.featureName = featureName;
        this.data = data;
        this.preData = preData;
    }
}
exports.FeatureMetadataUpdateEvent = FeatureMetadataUpdateEvent;
class FeatureStrategyAddEvent extends BaseEvent {
    /**
     */
    constructor(p) {
        super(exports.FEATURE_STRATEGY_ADD, p.auditUser);
        const { project, featureName, environment, data } = p;
        this.project = project;
        this.featureName = featureName;
        this.environment = environment;
        this.data = data;
    }
}
exports.FeatureStrategyAddEvent = FeatureStrategyAddEvent;
class FeatureStrategyUpdateEvent extends BaseEvent {
    /**
     */
    constructor(p) {
        super(exports.FEATURE_STRATEGY_UPDATE, p.auditUser);
        const { project, featureName, environment, data, preData } = p;
        this.project = project;
        this.featureName = featureName;
        this.environment = environment;
        this.data = data;
        this.preData = preData;
    }
}
exports.FeatureStrategyUpdateEvent = FeatureStrategyUpdateEvent;
class FeatureStrategyRemoveEvent extends BaseEvent {
    constructor(p) {
        super(exports.FEATURE_STRATEGY_REMOVE, p.auditUser);
        const { project, featureName, environment, preData } = p;
        this.project = project;
        this.featureName = featureName;
        this.environment = environment;
        this.preData = preData;
    }
}
exports.FeatureStrategyRemoveEvent = FeatureStrategyRemoveEvent;
class FeatureFavoritedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.FEATURE_FAVORITED, eventData.auditUser);
        this.data = eventData.data;
        this.featureName = eventData.featureName;
    }
}
exports.FeatureFavoritedEvent = FeatureFavoritedEvent;
class ProjectFavoritedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.PROJECT_FAVORITED, eventData.auditUser);
        this.data = eventData.data;
        this.project = eventData.project;
    }
}
exports.ProjectFavoritedEvent = ProjectFavoritedEvent;
class FeatureUnfavoritedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.FEATURE_UNFAVORITED, eventData.auditUser);
        this.data = eventData.data;
        this.featureName = eventData.featureName;
    }
}
exports.FeatureUnfavoritedEvent = FeatureUnfavoritedEvent;
class ProjectUnfavoritedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.PROJECT_UNFAVORITED, eventData.auditUser);
        this.data = eventData.data;
        this.project = eventData.project;
    }
}
exports.ProjectUnfavoritedEvent = ProjectUnfavoritedEvent;
class ProjectUserAddedEvent extends BaseEvent {
    /**
     */
    constructor(p) {
        super(exports.PROJECT_USER_ADDED, p.auditUser);
        const { project, data } = p;
        this.project = project;
        this.data = data;
        this.preData = null;
    }
}
exports.ProjectUserAddedEvent = ProjectUserAddedEvent;
class ProjectUserRemovedEvent extends BaseEvent {
    constructor(p) {
        super(exports.PROJECT_USER_REMOVED, p.auditUser);
        const { project, preData } = p;
        this.project = project;
        this.data = null;
        this.preData = preData;
    }
}
exports.ProjectUserRemovedEvent = ProjectUserRemovedEvent;
class ProjectUserUpdateRoleEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.PROJECT_USER_ROLE_CHANGED, eventData.auditUser);
        const { project, data, preData } = eventData;
        this.project = project;
        this.data = data;
        this.preData = preData;
    }
}
exports.ProjectUserUpdateRoleEvent = ProjectUserUpdateRoleEvent;
class ProjectGroupAddedEvent extends BaseEvent {
    constructor(p) {
        super(exports.PROJECT_GROUP_ADDED, p.auditUser);
        const { project, data } = p;
        this.project = project;
        this.data = data;
        this.preData = null;
    }
}
exports.ProjectGroupAddedEvent = ProjectGroupAddedEvent;
class ProjectGroupRemovedEvent extends BaseEvent {
    /**
     */
    constructor(p) {
        super(exports.PROJECT_GROUP_REMOVED, p.auditUser);
        const { project, preData } = p;
        this.project = project;
        this.data = null;
        this.preData = preData;
    }
}
exports.ProjectGroupRemovedEvent = ProjectGroupRemovedEvent;
class ProjectGroupUpdateRoleEvent extends BaseEvent {
    /**
     */
    constructor(eventData) {
        super(exports.PROJECT_GROUP_ROLE_CHANGED, eventData.auditUser);
        const { project, data, preData } = eventData;
        this.project = project;
        this.data = data;
        this.preData = preData;
    }
}
exports.ProjectGroupUpdateRoleEvent = ProjectGroupUpdateRoleEvent;
class ProjectAccessAddedEvent extends BaseEvent {
    constructor(p) {
        super(exports.PROJECT_ACCESS_ADDED, p.auditUser);
        const { project, data } = p;
        this.project = project;
        this.data = data;
        this.preData = null;
    }
}
exports.ProjectAccessAddedEvent = ProjectAccessAddedEvent;
class ProjectAccessUserRolesUpdated extends BaseEvent {
    constructor(p) {
        super(exports.PROJECT_ACCESS_USER_ROLES_UPDATED, p.auditUser);
        const { project, data, preData } = p;
        this.project = project;
        this.data = data;
        this.preData = preData;
    }
}
exports.ProjectAccessUserRolesUpdated = ProjectAccessUserRolesUpdated;
class ProjectAccessGroupRolesUpdated extends BaseEvent {
    constructor(p) {
        super(exports.PROJECT_ACCESS_GROUP_ROLES_UPDATED, p.auditUser);
        const { project, data, preData } = p;
        this.project = project;
        this.data = data;
        this.preData = preData;
    }
}
exports.ProjectAccessGroupRolesUpdated = ProjectAccessGroupRolesUpdated;
class GroupUserRemoved extends BaseEvent {
    constructor(p) {
        super(exports.GROUP_USER_REMOVED, p.auditUser);
        this.preData = {
            groupId: p.groupId,
            userId: p.userId,
        };
    }
}
exports.GroupUserRemoved = GroupUserRemoved;
class GroupUserAdded extends BaseEvent {
    constructor(p) {
        super(exports.GROUP_USER_ADDED, p.auditUser);
        this.data = {
            groupId: p.groupId,
            userId: p.userId,
        };
    }
}
exports.GroupUserAdded = GroupUserAdded;
class ProjectAccessUserRolesDeleted extends BaseEvent {
    constructor(p) {
        super(exports.PROJECT_ACCESS_USER_ROLES_DELETED, p.auditUser);
        const { project, preData } = p;
        this.project = project;
        this.data = null;
        this.preData = preData;
    }
}
exports.ProjectAccessUserRolesDeleted = ProjectAccessUserRolesDeleted;
class ProjectAccessGroupRolesDeleted extends BaseEvent {
    constructor(p) {
        super(exports.PROJECT_ACCESS_GROUP_ROLES_DELETED, p.auditUser);
        const { project, preData } = p;
        this.project = project;
        this.data = null;
        this.preData = preData;
    }
}
exports.ProjectAccessGroupRolesDeleted = ProjectAccessGroupRolesDeleted;
class SettingCreatedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.SETTING_CREATED, eventData.auditUser);
        this.data = eventData.data;
    }
}
exports.SettingCreatedEvent = SettingCreatedEvent;
class SettingDeletedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.SETTING_DELETED, eventData.auditUser);
        this.data = eventData.data;
    }
}
exports.SettingDeletedEvent = SettingDeletedEvent;
class SettingUpdatedEvent extends BaseEvent {
    constructor(eventData, preData) {
        super(exports.SETTING_UPDATED, eventData.auditUser);
        this.data = eventData.data;
        this.preData = preData;
    }
}
exports.SettingUpdatedEvent = SettingUpdatedEvent;
class PublicSignupTokenCreatedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.PUBLIC_SIGNUP_TOKEN_CREATED, eventData.auditUser);
        this.data = eventData.data;
    }
}
exports.PublicSignupTokenCreatedEvent = PublicSignupTokenCreatedEvent;
class PublicSignupTokenUpdatedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.PUBLIC_SIGNUP_TOKEN_TOKEN_UPDATED, eventData.auditUser);
        this.data = eventData.data;
    }
}
exports.PublicSignupTokenUpdatedEvent = PublicSignupTokenUpdatedEvent;
class PublicSignupTokenUserAddedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.PUBLIC_SIGNUP_TOKEN_USER_ADDED, eventData.auditUser);
        this.data = eventData.data;
    }
}
exports.PublicSignupTokenUserAddedEvent = PublicSignupTokenUserAddedEvent;
class ApiTokenCreatedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.API_TOKEN_CREATED, eventData.auditUser);
        this.data = eventData.apiToken;
        this.environment = eventData.apiToken.environment;
        this.project = eventData.apiToken.project;
    }
}
exports.ApiTokenCreatedEvent = ApiTokenCreatedEvent;
class ApiTokenDeletedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.API_TOKEN_DELETED, eventData.auditUser);
        this.preData = eventData.apiToken;
        this.environment = eventData.apiToken.environment;
        this.project = eventData.apiToken.project;
    }
}
exports.ApiTokenDeletedEvent = ApiTokenDeletedEvent;
class ApiTokenUpdatedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.API_TOKEN_UPDATED, eventData.auditUser);
        this.preData = eventData.previousToken;
        this.data = eventData.apiToken;
        this.environment = eventData.apiToken.environment;
        this.project = eventData.apiToken.project;
    }
}
exports.ApiTokenUpdatedEvent = ApiTokenUpdatedEvent;
class PotentiallyStaleOnEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.FEATURE_POTENTIALLY_STALE_ON, eventData.auditUser);
        this.featureName = eventData.featureName;
        this.project = eventData.project;
    }
}
exports.PotentiallyStaleOnEvent = PotentiallyStaleOnEvent;
class UserCreatedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.USER_CREATED, eventData.auditUser);
        this.data = mapUserToData(eventData.userCreated);
    }
}
exports.UserCreatedEvent = UserCreatedEvent;
class UserUpdatedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.USER_UPDATED, eventData.auditUser);
        this.preData = mapUserToData(eventData.preUser);
        this.data = mapUserToData(eventData.postUser);
    }
}
exports.UserUpdatedEvent = UserUpdatedEvent;
class UserDeletedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.USER_DELETED, eventData.auditUser);
        this.preData = mapUserToData(eventData.deletedUser);
    }
}
exports.UserDeletedEvent = UserDeletedEvent;
class ScimUsersDeleted extends BaseEvent {
    constructor(eventData) {
        super(exports.SCIM_USERS_DELETED, eventData.auditUser);
        this.data = eventData.data;
    }
}
exports.ScimUsersDeleted = ScimUsersDeleted;
class ScimGroupsDeleted extends BaseEvent {
    constructor(eventData) {
        super(exports.SCIM_GROUPS_DELETED, eventData.auditUser);
        this.data = eventData.data;
    }
}
exports.ScimGroupsDeleted = ScimGroupsDeleted;
class TagTypeCreatedEvent extends BaseEvent {
    constructor(eventData) {
        super('tag-type-created', eventData.auditUser);
        this.data = eventData.data;
    }
}
exports.TagTypeCreatedEvent = TagTypeCreatedEvent;
class TagTypeDeletedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.TAG_TYPE_DELETED, eventData.auditUser);
        this.preData = eventData.preData;
    }
}
exports.TagTypeDeletedEvent = TagTypeDeletedEvent;
class TagTypeUpdatedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.TAG_TYPE_UPDATED, eventData.auditUser);
        this.data = eventData.data;
    }
}
exports.TagTypeUpdatedEvent = TagTypeUpdatedEvent;
class TagCreatedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.TAG_CREATED, eventData.auditUser);
        this.data = eventData.data;
    }
}
exports.TagCreatedEvent = TagCreatedEvent;
class TagDeletedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.TAG_DELETED, eventData.auditUser);
        this.data = eventData.data;
    }
}
exports.TagDeletedEvent = TagDeletedEvent;
class PatCreatedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.PAT_CREATED, eventData.auditUser);
        this.data = eventData.data;
    }
}
exports.PatCreatedEvent = PatCreatedEvent;
class PatDeletedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.PAT_DELETED, eventData.auditUser);
        this.data = eventData.data;
    }
}
exports.PatDeletedEvent = PatDeletedEvent;
class ProjectEnvironmentAdded extends BaseEvent {
    constructor(eventData) {
        super(exports.PROJECT_ENVIRONMENT_ADDED, eventData.auditUser);
        this.project = eventData.project;
        this.environment = eventData.environment;
    }
}
exports.ProjectEnvironmentAdded = ProjectEnvironmentAdded;
class ProjectEnvironmentRemoved extends BaseEvent {
    constructor(eventData) {
        super(exports.PROJECT_ENVIRONMENT_REMOVED, eventData.auditUser);
        this.project = eventData.project;
        this.environment = eventData.environment;
    }
}
exports.ProjectEnvironmentRemoved = ProjectEnvironmentRemoved;
class FeaturesExportedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.FEATURES_EXPORTED, eventData.auditUser);
        this.data = eventData;
    }
}
exports.FeaturesExportedEvent = FeaturesExportedEvent;
class DropProjectsEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.DROP_PROJECTS, eventData.auditUser);
        this.data = { name: 'all-projects' };
    }
}
exports.DropProjectsEvent = DropProjectsEvent;
class DropFeaturesEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.DROP_FEATURES, eventData.auditUser);
        this.data = { name: 'all-features' };
    }
}
exports.DropFeaturesEvent = DropFeaturesEvent;
class DropStrategiesEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.DROP_STRATEGIES, eventData.auditUser);
        this.data = { name: 'all-strategies' };
    }
}
exports.DropStrategiesEvent = DropStrategiesEvent;
class DropEnvironmentsEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.DROP_ENVIRONMENTS, eventData.auditUser);
        this.data = { name: 'all-environments' };
    }
}
exports.DropEnvironmentsEvent = DropEnvironmentsEvent;
class DropFeatureTagsEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.DROP_FEATURE_TAGS, eventData.auditUser);
        this.data = { name: 'all-feature-tags' };
    }
}
exports.DropFeatureTagsEvent = DropFeatureTagsEvent;
class DropTagsEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.DROP_TAGS, eventData.auditUser);
        this.data = { name: 'all-tags' };
    }
}
exports.DropTagsEvent = DropTagsEvent;
class DropTagTypesEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.DROP_TAG_TYPES, eventData.auditUser);
        this.data = { name: 'all-tag-types' };
    }
}
exports.DropTagTypesEvent = DropTagTypesEvent;
class RoleCreatedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.ROLE_CREATED, eventData.auditUser);
        this.data = eventData.data;
    }
}
exports.RoleCreatedEvent = RoleCreatedEvent;
class RoleDeletedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.ROLE_DELETED, eventData.auditUser);
        this.preData = eventData.preData;
    }
}
exports.RoleDeletedEvent = RoleDeletedEvent;
class StrategyCreatedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.STRATEGY_CREATED, eventData.auditUser);
        this.data = eventData.data;
    }
}
exports.StrategyCreatedEvent = StrategyCreatedEvent;
class StrategyUpdatedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.STRATEGY_UPDATED, eventData.auditUser);
        this.data = eventData.data;
    }
}
exports.StrategyUpdatedEvent = StrategyUpdatedEvent;
class StrategyDeletedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.STRATEGY_DELETED, eventData.auditUser);
        this.data = eventData.data;
    }
}
exports.StrategyDeletedEvent = StrategyDeletedEvent;
class StrategyDeprecatedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.STRATEGY_DEPRECATED, eventData.auditUser);
        this.data = eventData.data;
    }
}
exports.StrategyDeprecatedEvent = StrategyDeprecatedEvent;
class StrategyReactivatedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.STRATEGY_REACTIVATED, eventData.auditUser);
        this.data = eventData.data;
    }
}
exports.StrategyReactivatedEvent = StrategyReactivatedEvent;
class DefaultStrategyUpdatedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.DEFAULT_STRATEGY_UPDATED, eventData.auditUser);
        this.data = eventData.data;
        this.preData = eventData.preData;
        this.project = eventData.project;
        this.environment = eventData.environment;
    }
}
exports.DefaultStrategyUpdatedEvent = DefaultStrategyUpdatedEvent;
class AddonConfigCreatedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.ADDON_CONFIG_CREATED, eventData.auditUser);
        this.data = eventData.data;
    }
}
exports.AddonConfigCreatedEvent = AddonConfigCreatedEvent;
class AddonConfigUpdatedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.ADDON_CONFIG_UPDATED, eventData.auditUser);
        this.data = eventData.data;
        this.preData = eventData.preData;
    }
}
exports.AddonConfigUpdatedEvent = AddonConfigUpdatedEvent;
class AddonConfigDeletedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.ADDON_CONFIG_DELETED, eventData.auditUser);
        this.preData = eventData.preData;
    }
}
exports.AddonConfigDeletedEvent = AddonConfigDeletedEvent;
class SegmentCreatedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.SEGMENT_CREATED, eventData.auditUser);
        this.project = eventData.project;
        this.data = eventData.data;
    }
}
exports.SegmentCreatedEvent = SegmentCreatedEvent;
class SegmentUpdatedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.SEGMENT_UPDATED, eventData.auditUser);
        this.project = eventData.project;
        this.data = eventData.data;
        this.preData = eventData.preData;
    }
}
exports.SegmentUpdatedEvent = SegmentUpdatedEvent;
class SegmentDeletedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.SEGMENT_DELETED, eventData.auditUser);
        this.preData = eventData.preData;
        this.project = eventData.project;
    }
}
exports.SegmentDeletedEvent = SegmentDeletedEvent;
class GroupUpdatedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.GROUP_UPDATED, eventData.auditUser);
        this.preData = eventData.preData;
        this.data = eventData.data;
    }
}
exports.GroupUpdatedEvent = GroupUpdatedEvent;
class GroupDeletedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.GROUP_DELETED, eventData.auditUser);
        this.preData = eventData.preData;
    }
}
exports.GroupDeletedEvent = GroupDeletedEvent;
class ReleasePlanTemplateCreatedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.RELEASE_PLAN_TEMPLATE_CREATED, eventData.auditUser);
        this.data = eventData.data;
    }
}
exports.ReleasePlanTemplateCreatedEvent = ReleasePlanTemplateCreatedEvent;
class ReleasePlanTemplateUpdatedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.RELEASE_PLAN_TEMPLATE_UPDATED, eventData.auditUser);
        this.data = eventData.data;
        this.preData = eventData.preData;
    }
}
exports.ReleasePlanTemplateUpdatedEvent = ReleasePlanTemplateUpdatedEvent;
class ReleasePlanTemplateDeletedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.RELEASE_PLAN_TEMPLATE_DELETED, eventData.auditUser);
        this.preData = eventData.preData;
    }
}
exports.ReleasePlanTemplateDeletedEvent = ReleasePlanTemplateDeletedEvent;
class ReleasePlanTemplateArchivedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.RELEASE_PLAN_TEMPLATE_ARCHIVED, eventData.auditUser);
        this.data = eventData.data;
        this.preData = eventData.preData;
    }
}
exports.ReleasePlanTemplateArchivedEvent = ReleasePlanTemplateArchivedEvent;
class ReleasePlanAddedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.RELEASE_PLAN_ADDED, eventData.auditUser);
        this.project = eventData.project;
        this.featureName = eventData.featureName;
        this.environment = eventData.environment;
        this.data = eventData.data;
    }
}
exports.ReleasePlanAddedEvent = ReleasePlanAddedEvent;
class ReleasePlanRemovedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.RELEASE_PLAN_REMOVED, eventData.auditUser);
        this.project = eventData.project;
        this.featureName = eventData.featureName;
        this.environment = eventData.environment;
        this.preData = eventData.preData;
    }
}
exports.ReleasePlanRemovedEvent = ReleasePlanRemovedEvent;
class ReleasePlanMilestoneStartedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.RELEASE_PLAN_MILESTONE_STARTED, eventData.auditUser);
        this.project = eventData.project;
        this.featureName = eventData.featureName;
        this.environment = eventData.environment;
        this.preData = eventData.preData;
        this.data = eventData.data;
    }
}
exports.ReleasePlanMilestoneStartedEvent = ReleasePlanMilestoneStartedEvent;
function mapUserToData(user) {
    return {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        rootRole: user.rootRole,
    };
}
class UserPreferenceUpdatedEvent extends BaseEvent {
    constructor(eventData) {
        super(exports.USER_PREFERENCE_UPDATED, eventData.auditUser);
        this.userId = eventData.userId;
        this.data = eventData.data;
    }
}
exports.UserPreferenceUpdatedEvent = UserPreferenceUpdatedEvent;
//# sourceMappingURL=events.js.map