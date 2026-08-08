"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("../types/events");
const teamsDefinition = {
    name: 'teams',
    displayName: 'Microsoft Teams',
    description: 'Allows Unleash to post updates to Microsoft Teams.',
    documentationUrl: 'https://docs.getunleash.io/docs/addons/teams',
    howTo: 'The Microsoft Teams integration allows Unleash to post Updates when a feature flag is updated.',
    parameters: [
        {
            name: 'url',
            displayName: 'Microsoft Teams webhook URL',
            description: '(Required)',
            type: 'url',
            required: true,
            sensitive: true,
        },
        {
            name: 'customHeaders',
            displayName: 'Extra HTTP Headers',
            placeholder: `{
  "ISTIO_USER_KEY": "hunter2",
  "SOME_OTHER_CUSTOM_HTTP_HEADER": "SOMEVALUE"
}`,
            description: `(Optional) Used to add extra HTTP Headers to the request the plugin fires off. This must be a valid json object of key-value pairs where both the key and the value are strings`,
            required: false,
            sensitive: true,
            type: 'textfield',
        },
    ],
    events: [
        events_1.FEATURE_CREATED,
        events_1.FEATURE_UPDATED,
        events_1.FEATURE_ARCHIVED,
        events_1.FEATURE_REVIVED,
        events_1.FEATURE_STALE_ON,
        events_1.FEATURE_STALE_OFF,
        events_1.FEATURE_ENVIRONMENT_ENABLED,
        events_1.FEATURE_ENVIRONMENT_DISABLED,
        events_1.FEATURE_STRATEGY_REMOVE,
        events_1.FEATURE_STRATEGY_UPDATE,
        events_1.FEATURE_STRATEGY_ADD,
        events_1.FEATURE_METADATA_UPDATED,
        events_1.FEATURE_VARIANTS_UPDATED,
        events_1.FEATURE_PROJECT_CHANGE,
        events_1.FEATURE_POTENTIALLY_STALE_ON,
    ],
};
exports.default = teamsDefinition;
//# sourceMappingURL=teams-definition.js.map