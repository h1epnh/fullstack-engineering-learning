"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web_api_1 = require("@slack/web-api");
const addon_1 = __importDefault(require("./addon"));
const slack_app_definition_1 = __importDefault(require("./slack-app-definition"));
const types_1 = require("../types");
const feature_event_formatter_md_1 = require("./feature-event-formatter-md");
class SlackAppAddon extends addon_1.default {
    constructor(args) {
        super(slack_app_definition_1.default, args);
        this.msgFormatter = new feature_event_formatter_md_1.FeatureEventFormatterMd({
            unleashUrl: args.unleashUrl,
            linkStyle: feature_event_formatter_md_1.LinkStyle.SLACK,
        });
        this.flagResolver = args.flagResolver;
    }
    async handleEvent(event, parameters, integrationId) {
        let state = 'success';
        const stateDetails = [];
        let channels = [];
        let message = '';
        try {
            const { accessToken, defaultChannels } = parameters;
            if (!accessToken) {
                const noAccessTokenMessage = 'No access token provided.';
                this.logger.warn(noAccessTokenMessage);
                this.registerEarlyFailureEvent(integrationId, event, noAccessTokenMessage);
                return;
            }
            const taggedChannels = this.findTaggedChannels(event);
            channels = this.getUniqueArray(taggedChannels.concat(this.getDefaultChannels(defaultChannels)));
            if (!channels.length) {
                const noSlackChannelsMessage = `No Slack channels found for event ${event.type}.`;
                this.logger.debug(noSlackChannelsMessage);
                this.registerEarlyFailureEvent(integrationId, event, noSlackChannelsMessage);
                return;
            }
            this.logger.debug(`Found candidate channels: ${JSON.stringify(channels)}.`);
            if (!this.slackClient || this.accessToken !== accessToken) {
                const client = new web_api_1.WebClient(accessToken);
                client.on(web_api_1.WebClientEvent.RATE_LIMITED, (numSeconds) => {
                    this.logger.debug(`Rate limit reached for event ${event.type}. Retry scheduled after ${numSeconds} seconds`);
                });
                this.slackClient = client;
                this.accessToken = accessToken;
            }
            const { text: formattedMessage, url } = this.msgFormatter.format(event);
            const maxLength = 3000;
            const text = formattedMessage.substring(0, maxLength);
            message = `${formattedMessage}${text.length < formattedMessage.length ? ` (trimmed to ${maxLength} characters)` : ''}`;
            const blocks = [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text,
                    },
                },
            ];
            if (url) {
                blocks.push({
                    type: 'actions',
                    elements: [
                        {
                            type: 'button',
                            url,
                            text: {
                                type: 'plain_text',
                                text: 'Open in Unleash',
                            },
                            value: 'featureToggle',
                            style: 'primary',
                        },
                    ],
                });
            }
            const requests = channels.map((name) => {
                return this.slackClient.chat.postMessage({
                    channel: name,
                    text,
                    blocks,
                    unfurl_links: false,
                });
            });
            const results = await Promise.allSettled(requests);
            const failedRequests = results.filter(({ status }) => status === 'rejected');
            const errors = this.getUniqueArray(failedRequests.map(({ reason }) => this.parseError(reason))).join(' ');
            if (failedRequests.length === 0) {
                const successMessage = `All (${results.length}) Slack client calls were successful.`;
                stateDetails.push(successMessage);
                this.logger.info(successMessage);
            }
            else if (failedRequests.length === results.length) {
                state = 'failed';
                const failedMessage = `All (${results.length}) Slack client calls failed with the following errors: ${errors}`;
                stateDetails.push(failedMessage);
                this.logger.warn(failedMessage);
            }
            else {
                state = 'successWithErrors';
                const successWithErrorsMessage = `Some (${failedRequests.length} of ${results.length}) Slack client calls failed. Errors: ${errors}`;
                stateDetails.push(successWithErrorsMessage);
                this.logger.warn(successWithErrorsMessage);
            }
        }
        catch (error) {
            state = 'failed';
            const eventErrorMessage = `Error handling event ${event.type}.`;
            stateDetails.push(eventErrorMessage);
            this.logger.warn(eventErrorMessage);
            const errorMessage = this.parseError(error);
            stateDetails.push(errorMessage);
            this.logger.warn(errorMessage, error);
        }
        finally {
            this.registerEvent({
                integrationId,
                state,
                stateDetails: stateDetails.join('\n'),
                event: (0, types_1.serializeDates)(event),
                details: {
                    channels,
                    message,
                },
            });
        }
    }
    getUniqueArray(arr) {
        return [...new Set(arr)];
    }
    registerEarlyFailureEvent(integrationId, event, earlyFailureMessage) {
        this.registerEvent({
            integrationId,
            state: 'failed',
            stateDetails: earlyFailureMessage,
            event: (0, types_1.serializeDates)(event),
            details: {
                channels: [],
                message: '',
            },
        });
    }
    findTaggedChannels({ tags }) {
        if (tags) {
            return tags
                .filter((tag) => tag.type === 'slack')
                .map((t) => t.value);
        }
        return [];
    }
    getDefaultChannels(defaultChannels) {
        if (defaultChannels) {
            return defaultChannels.split(',').map((c) => c.trim());
        }
        return [];
    }
    parseError(error) {
        if ('code' in error) {
            if (error.code === web_api_1.ErrorCode.PlatformError) {
                const { data } = error;
                return `A platform error occurred: ${JSON.stringify(data)}`;
            }
            if (error.code === web_api_1.ErrorCode.RequestError) {
                const { original } = error;
                return `A request error occurred: ${JSON.stringify(original)}`;
            }
            if (error.code === web_api_1.ErrorCode.RateLimitedError) {
                const { retryAfter } = error;
                return `A rate limit error occurred: retry after ${retryAfter} seconds`;
            }
            if (error.code === web_api_1.ErrorCode.HTTPError) {
                const { statusCode } = error;
                return `An HTTP error occurred: status code ${statusCode}`;
            }
        }
        return error.message;
    }
}
exports.default = SlackAppAddon;
module.exports = SlackAppAddon;
//# sourceMappingURL=slack-app.js.map