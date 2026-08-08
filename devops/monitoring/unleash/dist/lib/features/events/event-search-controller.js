"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissions_1 = require("../../types/permissions");
const create_response_schema_1 = require("../../openapi/util/create-response-schema");
const serialize_dates_1 = require("../../../lib/types/serialize-dates");
const event_search_query_parameters_1 = require("../../openapi/spec/event-search-query-parameters");
const openapi_1 = require("../../openapi");
const search_utils_1 = require("../../features/feature-search/search-utils");
const controller_1 = __importDefault(require("../../routes/controller"));
const util_1 = require("../../util");
const feature_event_formatter_md_1 = require("../../addons/feature-event-formatter-md");
const ANON_KEYS = ['email', 'username', 'createdBy'];
const version = 1;
class EventSearchController extends controller_1.default {
    constructor(config, { eventService, openApiService, }) {
        super(config);
        this.eventService = eventService;
        this.flagResolver = config.flagResolver;
        this.openApiService = openApiService;
        this.msgFormatter = new feature_event_formatter_md_1.FeatureEventFormatterMd({
            unleashUrl: config.server.unleashUrl,
            formatStyle: 'markdown',
        });
        this.route({
            method: 'get',
            path: '',
            handler: this.searchEvents,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    operationId: 'searchEvents',
                    tags: ['Events'],
                    summary: 'Search for events',
                    description: 'Allows searching for events that match the query parameter criteria.',
                    parameters: [...event_search_query_parameters_1.eventSearchQueryParameters],
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('eventSearchResponseSchema'),
                    },
                }),
            ],
        });
    }
    async searchEvents(req, res) {
        const { user } = req;
        const { normalizedLimit, normalizedOffset } = (0, search_utils_1.normalizeQueryParams)(req.query, {
            limitDefault: 50,
            maxLimit: 1000,
        });
        const { events, totalEvents } = await this.eventService.searchEvents({
            ...req.query,
            offset: normalizedOffset,
            limit: normalizedLimit,
        }, (0, util_1.extractUserIdFromUser)(user));
        const enrichedEvents = this.enrichEvents(events);
        this.openApiService.respondWithValidation(200, res, openapi_1.eventSearchResponseSchema.$id, (0, serialize_dates_1.serializeDates)({
            events: (0, serialize_dates_1.serializeDates)(this.maybeAnonymiseEvents(enrichedEvents)),
            total: totalEvents,
        }));
    }
    enrichEvents(events) {
        return events.map((event) => {
            const { label, text: summary } = this.msgFormatter.format(event);
            return {
                ...event,
                label,
                summary,
            };
        });
    }
    maybeAnonymiseEvents(events) {
        if (this.flagResolver.isEnabled('anonymiseEventLog')) {
            return (0, util_1.anonymiseKeys)(events, ANON_KEYS);
        }
        return events;
    }
}
exports.default = EventSearchController;
//# sourceMappingURL=event-search-controller.js.map