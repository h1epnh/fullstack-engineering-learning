"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addon_1 = __importDefault(require("./addon"));
const teams_definition_1 = __importDefault(require("./teams-definition"));
const types_1 = require("../types");
const feature_event_formatter_md_1 = require("./feature-event-formatter-md");
const events_1 = require("../types/events");
class TeamsAddon extends addon_1.default {
    constructor(args) {
        if (args.flagResolver.isEnabled('teamsIntegrationChangeRequests')) {
            teams_definition_1.default.events = [
                ...teams_definition_1.default.events,
                events_1.CHANGE_ADDED,
                events_1.CHANGE_DISCARDED,
                events_1.CHANGE_EDITED,
                events_1.CHANGE_REQUEST_APPLIED,
                events_1.CHANGE_REQUEST_APPROVAL_ADDED,
                events_1.CHANGE_REQUEST_APPROVED,
                events_1.CHANGE_REQUEST_CANCELLED,
                events_1.CHANGE_REQUEST_CREATED,
                events_1.CHANGE_REQUEST_DISCARDED,
                events_1.CHANGE_REQUEST_REJECTED,
                events_1.CHANGE_REQUEST_SENT_TO_REVIEW,
                events_1.CHANGE_REQUEST_SCHEDULED,
                events_1.CHANGE_REQUEST_SCHEDULED_APPLICATION_SUCCESS,
                events_1.CHANGE_REQUEST_SCHEDULED_APPLICATION_FAILURE,
                events_1.CHANGE_REQUEST_SCHEDULE_SUSPENDED,
            ];
        }
        super(teams_definition_1.default, args);
        this.msgFormatter = new feature_event_formatter_md_1.FeatureEventFormatterMd({
            unleashUrl: args.unleashUrl,
        });
        this.flagResolver = args.flagResolver;
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async handleEvent(event, parameters, integrationId) {
        let state = 'success';
        const stateDetails = [];
        const { url, customHeaders } = parameters;
        const { createdBy } = event;
        const { text, url: featureLink } = this.msgFormatter.format(event);
        const body = {
            themeColor: '0076D7',
            summary: 'Message',
            sections: [
                {
                    activityTitle: text,
                    activitySubtitle: 'Unleash notification update',
                    facts: [
                        {
                            name: 'User',
                            value: createdBy,
                        },
                        {
                            name: 'Action',
                            value: event.type,
                        },
                    ],
                },
            ],
            potentialAction: [
                {
                    '@type': 'OpenUri',
                    name: 'Go to feature',
                    targets: [
                        {
                            os: 'default',
                            uri: featureLink,
                        },
                    ],
                },
            ],
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
            headers: { 'Content-Type': 'application/json', ...extraHeaders },
            body: JSON.stringify(body),
        };
        const res = await this.fetchRetry(url, requestOpts);
        this.logger.info(`Handled event "${event.type}".`);
        if (res.ok) {
            const successMessage = `Teams webhook request was successful with status code: ${res.status}.`;
            stateDetails.push(successMessage);
            this.logger.info(successMessage);
        }
        else {
            state = 'failed';
            const failedMessage = `Teams webhook request failed with status code: ${res.status}.`;
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
exports.default = TeamsAddon;
//# sourceMappingURL=teams.js.map