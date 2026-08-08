"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVENT_MAP = void 0;
const types_1 = require("../types");
exports.EVENT_MAP = {
    [types_1.ADDON_CONFIG_CREATED]: {
        label: 'Integration configuration created',
        action: '{{b}}{{user}}{{b}} created a new {{b}}{{event.data.provider}}{{b}} integration configuration',
        path: '/integrations',
    },
    [types_1.ADDON_CONFIG_DELETED]: {
        label: 'Integration configuration deleted',
        action: '{{b}}{{user}}{{b}} deleted a {{b}}{{event.preData.provider}}{{b}} integration configuration',
        path: '/integrations',
    },
    [types_1.ADDON_CONFIG_UPDATED]: {
        label: 'Integration configuration updated',
        action: '{{b}}{{user}}{{b}} updated a {{b}}{{event.preData.provider}}{{b}} integration configuration',
        path: '/integrations',
    },
    [types_1.API_TOKEN_CREATED]: {
        label: 'API token created',
        action: '{{b}}{{user}}{{b}} created API token {{b}}{{event.data.username}}{{b}}',
        path: '/admin/api',
    },
    [types_1.API_TOKEN_DELETED]: {
        label: 'API token deleted',
        action: '{{b}}{{user}}{{b}} deleted API token {{b}}{{event.preData.username}}{{b}}',
        path: '/admin/api',
    },
    [types_1.CHANGE_ADDED]: {
        label: 'Change added',
        action: '{{b}}{{user}}{{b}} added a change to change request {{changeRequest}}',
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [types_1.CHANGE_DISCARDED]: {
        label: 'Change discarded',
        action: '{{b}}{{user}}{{b}} discarded a change in change request {{changeRequest}}',
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [types_1.CHANGE_EDITED]: {
        label: 'Change edited',
        action: '{{b}}{{user}}{{b}} edited a change in change request {{changeRequest}}',
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [types_1.CHANGE_REQUEST_APPLIED]: {
        label: 'Change request applied',
        action: '{{b}}{{user}}{{b}} applied change request {{changeRequest}}',
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [types_1.CHANGE_REQUEST_APPROVAL_ADDED]: {
        label: 'Change request approval added',
        action: '{{b}}{{user}}{{b}} added an approval to change request {{changeRequest}}',
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [types_1.CHANGE_REQUEST_APPROVED]: {
        label: 'Change request approved',
        action: '{{b}}{{user}}{{b}} approved change request {{changeRequest}}',
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [types_1.CHANGE_REQUEST_CANCELLED]: {
        label: 'Change request cancelled',
        action: '{{b}}{{user}}{{b}} cancelled change request {{changeRequest}}',
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [types_1.CHANGE_REQUEST_CREATED]: {
        label: 'Change request created',
        action: '{{b}}{{user}}{{b}} created change request {{changeRequest}}',
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [types_1.CHANGE_REQUEST_DISCARDED]: {
        label: 'Change request discarded',
        action: '{{b}}{{user}}{{b}} discarded change request {{changeRequest}}',
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [types_1.CHANGE_REQUEST_REJECTED]: {
        label: 'Change request rejected',
        action: '{{b}}{{user}}{{b}} rejected change request {{changeRequest}}',
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [types_1.CHANGE_REQUEST_SENT_TO_REVIEW]: {
        label: 'Change request sent to review',
        action: '{{b}}{{user}}{{b}} sent to review change request {{changeRequest}}',
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [types_1.CHANGE_REQUEST_SCHEDULED]: {
        label: 'Change request scheduled',
        action: '{{b}}{{user}}{{b}} scheduled change request {{changeRequest}} to be applied at {{event.data.scheduledDate}}.',
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [types_1.CHANGE_REQUEST_SCHEDULED_APPLICATION_SUCCESS]: {
        label: 'Scheduled change request applied successfully',
        action: '{{b}}Successfully{{b}} applied the scheduled change request {{changeRequest}} by {{b}}{{user}}{{b}}.',
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [types_1.CHANGE_REQUEST_SCHEDULED_APPLICATION_FAILURE]: {
        label: 'Scheduled change request failed',
        action: '{{b}}Failed{{b}} to apply the scheduled change request {{changeRequest}} by {{b}}{{user}}{{b}}.',
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [types_1.CHANGE_REQUEST_SCHEDULE_SUSPENDED]: {
        label: 'Change request suspended',
        action: 'Change request {{changeRequest}} was suspended for the following reason: {{event.data.reason}}',
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [types_1.CONTEXT_FIELD_CREATED]: {
        label: 'Context field created',
        action: '{{b}}{{user}}{{b}} created context field {{b}}{{event.data.name}}{{b}}',
        path: '/context',
    },
    [types_1.CONTEXT_FIELD_DELETED]: {
        label: 'Context field deleted',
        action: '{{b}}{{user}}{{b}} deleted context field {{b}}{{event.preData.name}}{{b}}',
        path: '/context',
    },
    [types_1.CONTEXT_FIELD_UPDATED]: {
        label: 'Context field updated',
        action: '{{b}}{{user}}{{b}} updated context field {{b}}{{event.preData.name}}{{b}}',
        path: '/context',
    },
    [types_1.FEATURE_ARCHIVED]: {
        label: 'Flag archived',
        action: '{{b}}{{user}}{{b}} archived {{b}}{{event.featureName}}{{b}} in project {{b}}{{project}}{{b}}',
        path: '/projects/{{event.project}}/archive',
    },
    [types_1.FEATURE_CREATED]: {
        label: 'Flag created',
        action: '{{b}}{{user}}{{b}} created {{b}}{{feature}}{{b}} in project {{b}}{{project}}{{b}}',
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [types_1.FEATURE_DELETED]: {
        label: 'Flag deleted',
        action: '{{b}}{{user}}{{b}} deleted {{b}}{{event.featureName}}{{b}} in project {{b}}{{project}}{{b}}',
        path: '/projects/{{event.project}}',
    },
    [types_1.FEATURE_ENVIRONMENT_DISABLED]: {
        label: 'Flag disabled',
        action: '{{b}}{{user}}{{b}} disabled {{b}}{{feature}}{{b}} for the {{b}}{{event.environment}}{{b}} environment in project {{b}}{{project}}{{b}}',
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [types_1.FEATURE_ENVIRONMENT_ENABLED]: {
        label: 'Flag enabled',
        action: '{{b}}{{user}}{{b}} enabled {{b}}{{feature}}{{b}} for the {{b}}{{event.environment}}{{b}} environment in project {{b}}{{project}}{{b}}',
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [types_1.FEATURE_ENVIRONMENT_VARIANTS_UPDATED]: {
        label: 'Flag variants updated',
        action: '{{b}}{{user}}{{b}} updated variants for {{b}}{{feature}}{{b}} for the {{b}}{{event.environment}}{{b}} environment in project {{b}}{{project}}{{b}}',
        path: '/projects/{{event.project}}/features/{{event.featureName}}/variants',
    },
    [types_1.FEATURE_METADATA_UPDATED]: {
        label: 'Flag metadata updated',
        action: '{{b}}{{user}}{{b}} updated {{b}}{{feature}}{{b}} metadata in project {{b}}{{project}}{{b}}',
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [types_1.FEATURE_COMPLETED]: {
        label: 'Flag marked as completed',
        action: '{{b}}{{feature}}{{b}} was marked as completed in project {{b}}{{project}}{{b}}',
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [types_1.FEATURE_POTENTIALLY_STALE_ON]: {
        label: 'Flag potentially stale',
        action: '{{b}}{{feature}}{{b}} was marked as potentially stale in project {{b}}{{project}}{{b}}',
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [types_1.FEATURE_PROJECT_CHANGE]: {
        label: 'Flag moved to a new project',
        action: '{{b}}{{user}}{{b}} moved {{b}}{{feature}}{{b}} from {{b}}{{event.data.oldProject}}{{b}} to {{b}}{{project}}{{b}}',
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [types_1.FEATURE_REVIVED]: {
        label: 'Flag revived',
        action: '{{b}}{{user}}{{b}} revived {{b}}{{feature}}{{b}} in project {{b}}{{project}}{{b}}',
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [types_1.FEATURE_STALE_OFF]: {
        label: 'Flag stale marking removed',
        action: '{{b}}{{user}}{{b}} removed the stale marking on {{b}}{{feature}}{{b}} in project {{b}}{{project}}{{b}}',
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [types_1.FEATURE_STALE_ON]: {
        label: 'Flag marked as stale',
        action: '{{b}}{{user}}{{b}} marked {{b}}{{feature}}{{b}} as stale in project {{b}}{{project}}{{b}}',
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [types_1.FEATURE_STRATEGY_ADD]: {
        label: 'Flag strategy added',
        action: '{{b}}{{user}}{{b}} added strategy {{b}}{{strategyTitle}}{{b}} to {{b}}{{feature}}{{b}} for the {{b}}{{event.environment}}{{b}} environment in project {{b}}{{project}}{{b}}',
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [types_1.FEATURE_STRATEGY_REMOVE]: {
        label: 'Flag strategy removed',
        action: '{{b}}{{user}}{{b}} removed strategy {{b}}{{strategyTitle}}{{b}} from {{b}}{{feature}}{{b}} for the {{b}}{{event.environment}}{{b}} environment in project {{b}}{{project}}{{b}}',
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [types_1.FEATURE_STRATEGY_UPDATE]: {
        label: 'Flag strategy updated',
        action: '{{b}}{{user}}{{b}} updated {{b}}{{feature}}{{b}} in project {{b}}{{project}}{{b}} {{strategyChangeText}}',
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [types_1.FEATURE_TAGGED]: {
        label: 'Flag tagged',
        action: '{{b}}{{user}}{{b}} tagged {{b}}{{feature}}{{b}} with {{b}}{{event.data.type}}:{{event.data.value}}{{b}} in project {{b}}{{project}}{{b}}',
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [types_1.FEATURE_UNTAGGED]: {
        label: 'Flag untagged',
        action: '{{b}}{{user}}{{b}} untagged {{b}}{{feature}}{{b}} with {{b}}{{event.preData.type}}:{{event.preData.value}}{{b}} in project {{b}}{{project}}{{b}}',
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [types_1.GROUP_CREATED]: {
        label: 'Group created',
        action: '{{b}}{{user}}{{b}} created group {{b}}{{event.data.name}}{{b}}',
        path: '/admin/groups',
    },
    [types_1.GROUP_DELETED]: {
        label: 'Group deleted',
        action: '{{b}}{{user}}{{b}} deleted group {{b}}{{event.preData.name}}{{b}}',
        path: '/admin/groups',
    },
    [types_1.GROUP_UPDATED]: {
        label: 'Group updated',
        action: '{{b}}{{user}}{{b}} updated group {{b}}{{event.preData.name}}{{b}}',
        path: '/admin/groups',
    },
    [types_1.BANNER_CREATED]: {
        label: 'Banner created',
        action: '{{b}}{{user}}{{b}} created banner {{b}}{{event.data.message}}{{b}}',
        path: '/admin/message-banners',
    },
    [types_1.BANNER_DELETED]: {
        label: 'Banner deleted',
        action: '{{b}}{{user}}{{b}} deleted banner {{b}}{{event.preData.message}}{{b}}',
        path: '/admin/message-banners',
    },
    [types_1.BANNER_UPDATED]: {
        label: 'Banner updated',
        action: '{{b}}{{user}}{{b}} updated banner {{b}}{{event.preData.message}}{{b}}',
        path: '/admin/message-banners',
    },
    [types_1.PROJECT_CREATED]: {
        label: 'Project created',
        action: '{{b}}{{user}}{{b}} created project {{b}}{{project}}{{b}}',
        path: '/projects',
    },
    [types_1.PROJECT_ARCHIVED]: {
        label: 'Project archived',
        action: '{{b}}{{user}}{{b}} archived project {{b}}{{event.project}}{{b}}',
        path: '/projects-archive',
    },
    [types_1.PROJECT_DELETED]: {
        label: 'Project deleted',
        action: '{{b}}{{user}}{{b}} deleted project {{b}}{{event.project}}{{b}}',
        path: '/projects',
    },
    [types_1.SEGMENT_CREATED]: {
        label: 'Segment created',
        action: '{{b}}{{user}}{{b}} created segment {{b}}{{event.data.name}}{{b}}',
        path: '/segments',
    },
    [types_1.SEGMENT_DELETED]: {
        label: 'Segment deleted',
        action: '{{b}}{{user}}{{b}} deleted segment {{b}}{{event.preData.name}}{{b}}',
        path: '/segments',
    },
    [types_1.SEGMENT_UPDATED]: {
        label: 'Segment updated',
        action: '{{b}}{{user}}{{b}} updated segment {{b}}{{event.preData.name}}{{b}}',
        path: '/segments',
    },
    [types_1.SERVICE_ACCOUNT_CREATED]: {
        label: 'Service account created',
        action: '{{b}}{{user}}{{b}} created service account {{b}}{{event.data.name}}{{b}}',
        path: '/admin/service-accounts',
    },
    [types_1.SERVICE_ACCOUNT_DELETED]: {
        label: 'Service account deleted',
        action: '{{b}}{{user}}{{b}} deleted service account {{b}}{{event.preData.name}}{{b}}',
        path: '/admin/service-accounts',
    },
    [types_1.SERVICE_ACCOUNT_UPDATED]: {
        label: 'Service account updated',
        action: '{{b}}{{user}}{{b}} updated service account {{b}}{{event.preData.name}}{{b}}',
        path: '/admin/service-accounts',
    },
    [types_1.USER_CREATED]: {
        label: 'User created',
        action: '{{b}}{{user}}{{b}} created user {{b}}{{event.data.name}}{{b}}',
        path: '/admin/users',
    },
    [types_1.USER_DELETED]: {
        label: 'User deleted',
        action: '{{b}}{{user}}{{b}} deleted user {{b}}{{event.preData.name}}{{b}}',
        path: '/admin/users',
    },
    [types_1.USER_UPDATED]: {
        label: 'User updated',
        action: '{{b}}{{user}}{{b}} updated user {{b}}{{event.preData.name}}{{b}}',
        path: '/admin/users',
    },
    [types_1.RELEASE_PLAN_ADDED]: {
        label: 'Release plan added',
        action: '{{b}}{{user}}{{b}} added release plan {{b}}{{event.data.name}}{{b}} to {{b}}{{feature}}{{b}} for the {{b}}{{event.environment}}{{b}} environment in project {{b}}{{project}}{{b}}',
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [types_1.RELEASE_PLAN_REMOVED]: {
        label: 'Release plan removed',
        action: '{{b}}{{user}}{{b}} removed release plan {{b}}{{event.preData.name}}{{b}} from {{b}}{{feature}}{{b}} for the {{b}}{{event.environment}}{{b}} environment in project {{b}}{{project}}{{b}}',
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [types_1.RELEASE_PLAN_MILESTONE_STARTED]: {
        label: 'Release plan milestone started',
        action: '{{b}}{{user}}{{b}} started milestone {{b}}{{event.data.milestoneName}}{{b}} in release plan {{b}}{{event.data.name}}{{b}} for {{b}}{{feature}}{{b}} for the {{b}}{{event.environment}}{{b}} environment in project {{b}}{{project}}{{b}}',
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
};
//# sourceMappingURL=feature-event-formatter-md-events.js.map