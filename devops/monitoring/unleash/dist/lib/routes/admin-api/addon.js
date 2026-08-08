"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = __importDefault(require("../controller"));
const permissions_1 = require("../../types/permissions");
const create_request_schema_1 = require("../../openapi/util/create-request-schema");
const create_response_schema_1 = require("../../openapi/util/create-response-schema");
const addon_schema_1 = require("../../openapi/spec/addon-schema");
const serialize_dates_1 = require("../../types/serialize-dates");
const addons_schema_1 = require("../../openapi/spec/addons-schema");
const standard_responses_1 = require("../../openapi/util/standard-responses");
const base_pagination_parameters_1 = require("../../openapi/spec/base-pagination-parameters");
const integration_events_schema_1 = require("../../openapi/spec/integration-events-schema");
const error_1 = require("../../error");
const PATH = '/';
class AddonController extends controller_1.default {
    constructor(config, { addonService, openApiService, integrationEventsService, }) {
        super(config);
        this.logger = config.getLogger('/admin-api/addon.ts');
        this.addonService = addonService;
        this.openApiService = openApiService;
        this.integrationEventsService = integrationEventsService;
        this.flagResolver = config.flagResolver;
        this.route({
            method: 'get',
            path: '',
            permission: permissions_1.NONE,
            handler: this.getAddons,
            middleware: [
                openApiService.validPath({
                    summary: 'Get all addons and providers',
                    description: 'Retrieve all addons and providers that are defined on this Unleash instance.',
                    tags: ['Addons'],
                    operationId: 'getAddons',
                    responses: {
                        ...(0, standard_responses_1.getStandardResponses)(401),
                        200: (0, create_response_schema_1.createResponseSchema)('addonsSchema'),
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '',
            handler: this.createAddon,
            permission: permissions_1.CREATE_ADDON,
            middleware: [
                openApiService.validPath({
                    summary: 'Create a new addon',
                    description: 'Create an addon instance. The addon must use one of the providers available on this Unleash instance.',
                    tags: ['Addons'],
                    operationId: 'createAddon',
                    requestBody: (0, create_request_schema_1.createRequestSchema)('addonCreateUpdateSchema'),
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('addonSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(400, 401, 403, 413, 415),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: `${PATH}:id`,
            handler: this.getAddon,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    summary: 'Get a specific addon',
                    description: 'Retrieve information about the addon whose ID matches the ID in the request URL.',
                    tags: ['Addons'],
                    operationId: 'getAddon',
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('addonSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(401),
                    },
                }),
            ],
        });
        this.route({
            method: 'put',
            path: `${PATH}:id`,
            handler: this.updateAddon,
            permission: permissions_1.UPDATE_ADDON,
            middleware: [
                openApiService.validPath({
                    summary: 'Update an addon',
                    description: `Update the addon with a specific ID. Any fields in the update object will be updated. Properties that are not included in the update object will not be affected. To empty a property, pass \`null\` as that property's value.

Note: passing \`null\` as a value for the description property will set it to an empty string.`,
                    tags: ['Addons'],
                    operationId: 'updateAddon',
                    requestBody: (0, create_request_schema_1.createRequestSchema)('addonCreateUpdateSchema'),
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('addonSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(400, 401, 403, 404, 413, 415),
                    },
                }),
            ],
        });
        this.route({
            method: 'delete',
            path: `${PATH}:id`,
            handler: this.deleteAddon,
            acceptAnyContentType: true,
            permission: permissions_1.DELETE_ADDON,
            middleware: [
                openApiService.validPath({
                    summary: 'Delete an addon',
                    description: 'Delete the addon specified by the ID in the request path.',
                    tags: ['Addons'],
                    operationId: 'deleteAddon',
                    responses: {
                        200: standard_responses_1.emptyResponse,
                        ...(0, standard_responses_1.getStandardResponses)(401, 403, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: `${PATH}:id/events`,
            handler: this.getIntegrationEvents,
            permission: permissions_1.ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Addons'],
                    operationId: 'getIntegrationEvents',
                    summary: 'Get integration events for a specific integration configuration.',
                    description: 'Returns a list of integration events belonging to a specific integration configuration, identified by its id.',
                    parameters: [...base_pagination_parameters_1.basePaginationParameters],
                    responses: {
                        ...(0, standard_responses_1.getStandardResponses)(401, 403, 404),
                        200: (0, create_response_schema_1.createResponseSchema)(integration_events_schema_1.integrationEventsSchema.$id),
                    },
                }),
            ],
        });
    }
    async getAddons(req, res) {
        const addons = await this.addonService.getAddons();
        const providers = this.addonService.getProviderDefinitions();
        this.openApiService.respondWithValidation(200, res, addons_schema_1.addonsSchema.$id, {
            addons: (0, serialize_dates_1.serializeDates)(addons),
            providers: (0, serialize_dates_1.serializeDates)(providers),
        });
    }
    async getAddon(req, res) {
        const { id } = req.params;
        const addon = await this.addonService.getAddon(id);
        this.openApiService.respondWithValidation(200, res, addon_schema_1.addonSchema.$id, (0, serialize_dates_1.serializeDates)(addon));
    }
    async updateAddon(req, res) {
        const { id } = req.params;
        const data = req.body;
        const addon = await this.addonService.updateAddon(id, data, req.audit);
        this.openApiService.respondWithValidation(200, res, addon_schema_1.addonSchema.$id, (0, serialize_dates_1.serializeDates)(addon));
    }
    async createAddon(req, res) {
        const data = req.body;
        const addon = await this.addonService.createAddon(data, req.audit);
        this.openApiService.respondWithValidation(201, res, addon_schema_1.addonSchema.$id, (0, serialize_dates_1.serializeDates)(addon));
    }
    async deleteAddon(req, res) {
        const { id } = req.params;
        await this.addonService.removeAddon(id, req.audit);
        res.status(200).end();
    }
    async getIntegrationEvents(req, res) {
        const { id } = req.params;
        if (Number.isNaN(Number(id))) {
            throw new error_1.BadDataError('Invalid integration configuration id');
        }
        const { limit = '50', offset = '0' } = req.query;
        const normalizedLimit = Number(limit) > 0 && Number(limit) <= 100 ? Number(limit) : 50;
        const normalizedOffset = Number(offset) > 0 ? Number(offset) : 0;
        const integrationEvents = await this.integrationEventsService.getPaginatedEvents(id, normalizedLimit, normalizedOffset);
        this.openApiService.respondWithValidation(200, res, integration_events_schema_1.integrationEventsSchema.$id, {
            integrationEvents: (0, serialize_dates_1.serializeDates)(integrationEvents),
        });
    }
}
exports.default = AddonController;
module.exports = AddonController;
//# sourceMappingURL=addon.js.map