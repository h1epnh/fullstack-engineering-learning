"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissions_1 = require("../../types/permissions");
const controller_1 = __importDefault(require("../controller"));
const anonymise_1 = require("../../util/anonymise");
const create_response_schema_1 = require("../../openapi/util/create-response-schema");
const events_schema_1 = require("../../../lib/openapi/spec/events-schema");
const serialize_dates_1 = require("../../../lib/types/serialize-dates");
const feature_events_schema_1 = require("../../../lib/openapi/spec/feature-events-schema");
const standard_responses_1 = require("../../../lib/openapi/util/standard-responses");
const create_request_schema_1 = require("../../openapi/util/create-request-schema");
const openapi_1 = require("../../openapi");
const ANON_KEYS = ['email', 'username', 'createdBy'];
const version = 1;
class EventController extends controller_1.default {
    constructor(config, { eventService, openApiService, }) {
        super(config);
        this.eventService = eventService;
        this.flagResolver = config.flagResolver;
        this.openApiService = openApiService;
        this.route({
            method: 'get',
            path: '/events',
            handler: this.getEvents,
            permission: permissions_1.ADMIN,
            middleware: [
                openApiService.validPath({
                    operationId: 'getEvents',
                    tags: ['Events'],
                    responses: {
                        ...(0, standard_responses_1.getStandardResponses)(401),
                        200: (0, create_response_schema_1.createResponseSchema)('eventsSchema'),
                    },
                    parameters: [
                        {
                            name: 'project',
                            description: 'The name of the project whose events you want to retrieve',
                            schema: { type: 'string' },
                            in: 'query',
                        },
                    ],
                    description: 'Returns **the last 100** events from the Unleash instance when called without a query parameter. When called with a `project` parameter, returns **all events** for the specified project.\n\nIf the provided project does not exist, the list of events will be empty.',
                    summary: 'Get the most recent events from the Unleash instance or all events related to a project.',
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/events/:featureName',
            handler: this.getEventsForToggle,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    operationId: 'getEventsForToggle',
                    tags: ['Events'],
                    responses: {
                        ...(0, standard_responses_1.getStandardResponses)(401),
                        200: (0, create_response_schema_1.createResponseSchema)('featureEventsSchema'),
                    },
                    description: 'Returns all events related to the specified feature flag. If the feature flag does not exist, the list of events will be empty.',
                    summary: 'Get all events related to a specific feature flag.',
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '/events/search',
            handler: this.deprecatedSearchEvents,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    operationId: 'deprecatedSearchEvents',
                    tags: ['Events'],
                    deprecated: true,
                    summary: 'Search for events (deprecated)',
                    description: 'Allows searching for events matching the search criteria in the request body',
                    requestBody: (0, create_request_schema_1.createRequestSchema)('deprecatedSearchEventsSchema'),
                    responses: { 200: (0, create_response_schema_1.createResponseSchema)('eventsSchema') },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/event-creators',
            handler: this.getEventCreators,
            permission: permissions_1.NONE,
            middleware: [
                this.openApiService.validPath({
                    tags: ['Events'],
                    operationId: 'getEventCreators',
                    summary: 'Get a list of all users that have created events',
                    description: 'Returns a list of all users that have created events in the system.',
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('eventCreatorsSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(401, 403, 404),
                    },
                }),
            ],
        });
    }
    maybeAnonymiseEvents(events) {
        if (this.flagResolver.isEnabled('anonymiseEventLog')) {
            return (0, anonymise_1.anonymiseKeys)(events, ANON_KEYS);
        }
        return events;
    }
    async getEvents(req, res) {
        const { project } = req.query;
        let eventList;
        if (project) {
            eventList = await this.eventService.deprecatedSearchEvents({
                project,
            });
        }
        else {
            eventList = await this.eventService.getEvents();
        }
        const response = {
            version,
            events: (0, serialize_dates_1.serializeDates)(this.maybeAnonymiseEvents(eventList.events)),
            totalEvents: eventList.totalEvents,
        };
        this.openApiService.respondWithValidation(200, res, events_schema_1.eventsSchema.$id, response);
    }
    async getEventsForToggle(req, res) {
        const feature = req.params.featureName;
        const eventList = await this.eventService.deprecatedSearchEvents({
            feature,
        });
        const response = {
            version,
            toggleName: feature,
            events: (0, serialize_dates_1.serializeDates)(this.maybeAnonymiseEvents(eventList.events)),
            totalEvents: eventList.totalEvents,
        };
        this.openApiService.respondWithValidation(200, res, feature_events_schema_1.featureEventsSchema.$id, response);
    }
    async deprecatedSearchEvents(req, res) {
        const eventList = await this.eventService.deprecatedSearchEvents(req.body);
        const response = {
            version,
            events: (0, serialize_dates_1.serializeDates)(this.maybeAnonymiseEvents(eventList.events)),
            totalEvents: eventList.totalEvents,
        };
        this.openApiService.respondWithValidation(200, res, feature_events_schema_1.featureEventsSchema.$id, response);
    }
    async getEventCreators(req, res) {
        const flagCreators = await this.eventService.getEventCreators();
        this.openApiService.respondWithValidation(200, res, openapi_1.eventCreatorsSchema.$id, (0, serialize_dates_1.serializeDates)(flagCreators));
    }
}
exports.default = EventController;
//# sourceMappingURL=event.js.map