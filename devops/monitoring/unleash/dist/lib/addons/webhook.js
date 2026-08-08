"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mustache_1 = __importDefault(require("mustache"));
const addon_1 = __importDefault(require("./addon"));
const webhook_definition_1 = __importDefault(require("./webhook-definition"));
const types_1 = require("../types");
const feature_event_formatter_md_1 = require("./feature-event-formatter-md");
class Webhook extends addon_1.default {
    constructor(args) {
        super(webhook_definition_1.default, args);
        this.msgFormatter = new feature_event_formatter_md_1.FeatureEventFormatterMd({
            unleashUrl: args.unleashUrl,
        });
        this.flagResolver = args.flagResolver;
    }
    async handleEvent(event, parameters, integrationId) {
        let state = 'success';
        const stateDetails = [];
        const { url, bodyTemplate, contentType = 'application/json', authorization, customHeaders, } = parameters;
        const context = {
            event,
            // Stringify twice to avoid escaping in Mustache
            eventJson: JSON.stringify(JSON.stringify(event)),
            eventMarkdown: this.msgFormatter.format(event).text,
        };
        let body;
        let sendingEvent = false;
        if (typeof bodyTemplate === 'string' && bodyTemplate.length > 1) {
            body = mustache_1.default.render(bodyTemplate, context);
        }
        else {
            body = JSON.stringify(event);
            sendingEvent = true;
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
        const requestOpts = {
            method: 'POST',
            headers: {
                'Content-Type': contentType,
                Authorization: authorization || undefined,
                ...extraHeaders,
            },
            body,
        };
        const res = await this.fetchRetry(url, requestOpts);
        this.logger.info(`Handled event "${event.type}".`);
        if (res.ok) {
            const successMessage = `Webhook request was successful with status code: ${res.status}.`;
            stateDetails.push(successMessage);
            this.logger.info(successMessage);
        }
        else {
            state = 'failed';
            const failedMessage = `Webhook request failed with status code: ${res.status}.`;
            stateDetails.push(failedMessage);
            this.logger.warn(failedMessage);
        }
        if (this.flagResolver.isEnabled('webhookDomainLogging')) {
            const domain = new URL(url).hostname;
            this.logger.info(`Webhook invoked`, {
                domain,
            });
        }
        this.registerEvent({
            integrationId,
            state,
            stateDetails: stateDetails.join('\n'),
            event: (0, types_1.serializeDates)(event),
            details: {
                url,
                contentType,
                body: sendingEvent ? event : body,
            },
        });
    }
}
exports.default = Webhook;
//# sourceMappingURL=webhook.js.map