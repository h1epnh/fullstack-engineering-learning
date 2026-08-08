"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addon_1 = __importDefault(require("./addon"));
const new_relic_definition_1 = __importDefault(require("./new-relic-definition"));
const mustache_1 = __importDefault(require("mustache"));
const types_1 = require("../types");
const feature_event_formatter_md_1 = require("./feature-event-formatter-md");
const node_zlib_1 = require("node:zlib");
const util_1 = require("util");
const asyncGzip = (0, util_1.promisify)(node_zlib_1.gzip);
class NewRelicAddon extends addon_1.default {
    constructor(config) {
        super(new_relic_definition_1.default, config);
        this.msgFormatter = new feature_event_formatter_md_1.FeatureEventFormatterMd({
            unleashUrl: config.unleashUrl,
        });
        this.flagResolver = config.flagResolver;
    }
    async handleEvent(event, parameters, integrationId) {
        let state = 'success';
        const stateDetails = [];
        const { url, licenseKey, customHeaders, bodyTemplate } = parameters;
        const context = {
            event,
        };
        let text;
        if (typeof bodyTemplate === 'string' && bodyTemplate.length > 1) {
            text = mustache_1.default.render(bodyTemplate, context);
        }
        else {
            text = `%%% \n ${this.msgFormatter.format(event).text} \n %%% `;
        }
        const body = {
            eventType: 'UnleashServiceEvent',
            unleashEventType: event.type,
            featureName: event.featureName,
            environment: event.environment,
            createdBy: event.createdBy,
            createdByUserId: event.createdByUserId,
            createdAt: event.createdAt.getTime(),
            ...event.data,
        };
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
                'Api-Key': licenseKey,
                'Content-Type': 'application/json',
                'Content-Encoding': 'gzip',
                ...extraHeaders,
            },
            body: await asyncGzip(JSON.stringify(body)),
        };
        const res = await this.fetchRetry(url, requestOpts);
        this.logger.info(`Handled event "${event.type}".`);
        if (res.ok) {
            const successMessage = `New Relic Events API request was successful with status code: ${res.status}.`;
            stateDetails.push(successMessage);
            this.logger.info(successMessage);
        }
        else {
            state = 'failed';
            const failedMessage = `New Relic Events API request failed with status code: ${res.status}.`;
            stateDetails.push(failedMessage);
            this.logger.warn(failedMessage);
        }
        this.registerEvent({
            integrationId,
            state,
            stateDetails: stateDetails.join('\n'),
            event: (0, types_1.serializeDates)(event),
            details: {
                url,
                body,
            },
        });
    }
}
exports.default = NewRelicAddon;
//# sourceMappingURL=new-relic.js.map