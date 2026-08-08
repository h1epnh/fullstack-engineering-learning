"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addon_1 = __importDefault(require("./addon"));
const slack_definition_1 = __importDefault(require("./slack-definition"));
const types_1 = require("../types");
const feature_event_formatter_md_1 = require("./feature-event-formatter-md");
class SlackAddon extends addon_1.default {
    constructor(args) {
        super(slack_definition_1.default, args);
        this.msgFormatter = new feature_event_formatter_md_1.FeatureEventFormatterMd({
            unleashUrl: args.unleashUrl,
            linkStyle: feature_event_formatter_md_1.LinkStyle.SLACK,
        });
        this.flagResolver = args.flagResolver;
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async handleEvent(event, parameters, integrationId) {
        let state = 'success';
        const stateDetails = [];
        const { url, defaultChannel, username = 'Unleash', emojiIcon = ':unleash:', customHeaders, } = parameters;
        const slackChannels = this.findSlackChannels(event);
        if (slackChannels.length === 0) {
            slackChannels.push(defaultChannel);
        }
        let extraHeaders = {};
        if (typeof customHeaders === 'string' && customHeaders.length > 1) {
            try {
                extraHeaders = JSON.parse(customHeaders);
            }
            catch (e) {
                state = 'successWithErrors';
                const badHeadersMessage = 'Could not parse the JSON in the customHeaders parameter.';
                stateDetails.push(badHeadersMessage);
                this.logger.warn(badHeadersMessage);
            }
        }
        const { text: formattedMessage, url: featureLink } = this.msgFormatter.format(event);
        const maxLength = 3000;
        const text = formattedMessage.substring(0, maxLength);
        const requests = slackChannels.map((channel) => {
            const body = {
                username,
                icon_emoji: emojiIcon, // eslint-disable-line camelcase
                text,
                channel: `#${channel}`,
                attachments: [
                    {
                        actions: [
                            {
                                name: 'featureToggle',
                                text: 'Open in Unleash',
                                type: 'button',
                                value: 'featureToggle',
                                style: 'primary',
                                url: featureLink,
                            },
                        ],
                    },
                ],
            };
            const requestOpts = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...extraHeaders,
                },
                body: JSON.stringify(body),
            };
            return this.fetchRetry(url, requestOpts);
        });
        const results = await Promise.all(requests);
        const failedRequests = results.filter((res) => !res.ok);
        const codes = this.getUniqueArray(results.map((res) => res.status)).join(', ');
        this.logger.info(`Handled event ${event.type}.`);
        if (failedRequests.length === 0) {
            const successMessage = `All (${results.length}) Slack webhook requests were successful with status codes: ${codes}.`;
            stateDetails.push(successMessage);
            this.logger.info(successMessage);
        }
        else if (failedRequests.length === results.length) {
            state = 'failed';
            const failedMessage = `All (${results.length}) Slack webhook requests failed with status codes: ${codes}.`;
            stateDetails.push(failedMessage);
            this.logger.warn(failedMessage);
        }
        else {
            state = 'successWithErrors';
            const successWithErrorsMessage = `Some (${failedRequests.length} of ${results.length}) Slack webhook requests failed. Status codes: ${codes}.`;
            stateDetails.push(successWithErrorsMessage);
            this.logger.warn(successWithErrorsMessage);
        }
        this.registerEvent({
            integrationId,
            state,
            stateDetails: stateDetails.join('\n'),
            event: (0, types_1.serializeDates)(event),
            details: {
                url,
                channels: slackChannels,
                username,
                message: `${formattedMessage}${text.length < formattedMessage.length ? ` (trimmed to ${maxLength} characters)` : ''}`,
            },
        });
    }
    getUniqueArray(arr) {
        return [...new Set(arr)];
    }
    findSlackChannels({ tags }) {
        if (tags) {
            return tags
                .filter((tag) => tag.type === 'slack')
                .map((t) => t.value);
        }
        return [];
    }
}
exports.default = SlackAddon;
module.exports = SlackAddon;
//# sourceMappingURL=slack.js.map