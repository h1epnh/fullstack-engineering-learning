"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("../types/events");
const slackDefinition = {
    name: 'slack',
    displayName: 'Slack',
    description: 'Allows Unleash to post updates to Slack.',
    documentationUrl: 'https://docs.getunleash.io/docs/addons/slack',
    deprecated: 'This integration is deprecated. Please try the new Slack App integration instead.',
    alerts: [
        {
            type: 'warning',
            text: `This integration is deprecated. Please try the new Slack App integration instead.`,
        },
    ],
    parameters: [
        {
            name: 'url',
            displayName: 'Slack webhook URL',
            description: '(Required)',
            type: 'url',
            required: true,
            sensitive: true,
        },
        {
            name: 'username',
            displayName: 'Username',
            placeholder: 'Unleash',
            description: 'The username to use when posting messages to slack. Defaults to "Unleash".',
            type: 'text',
            required: false,
            sensitive: false,
        },
        {
            name: 'emojiIcon',
            displayName: 'Emoji Icon',
            placeholder: ':unleash:',
            description: 'The emoji_icon to use when posting messages to slack. Defaults to ":unleash:".',
            type: 'text',
            required: false,
            sensitive: false,
        },
        {
            name: 'defaultChannel',
            displayName: 'Default channel',
            description: '(Required) Default channel to post updates to if not specified in the slack-tag',
            type: 'text',
            required: true,
            sensitive: false,
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
    tagTypes: [
        {
            name: 'slack',
            description: 'Slack tag used by the slack-addon to specify the slack channel.',
            icon: 'S',
        },
    ],
};
exports.default = slackDefinition;
//# sourceMappingURL=slack-definition.js.map