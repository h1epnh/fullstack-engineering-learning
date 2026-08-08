"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = __importDefault(require("../controller"));
const permissions_1 = require("../../types/permissions");
const create_request_schema_1 = require("../../openapi/util/create-request-schema");
const create_response_schema_1 = require("../../openapi/util/create-response-schema");
const standard_responses_1 = require("../../openapi/util/standard-responses");
const util_1 = require("../../util");
const types_1 = require("../../types");
const application_overview_schema_1 = require("../../openapi/spec/application-overview-schema");
const applications_query_parameters_1 = require("../../openapi/spec/applications-query-parameters");
const search_utils_1 = require("../../features/feature-search/search-utils");
const application_environment_instances_schema_1 = require("../../openapi/spec/application-environment-instances-schema");
const outdated_sdks_schema_1 = require("../../openapi/spec/outdated-sdks-schema");
class MetricsController extends controller_1.default {
    constructor(config, { clientInstanceService, openApiService, }) {
        super(config);
        this.logger = config.getLogger('/admin-api/metrics.ts');
        this.clientInstanceService = clientInstanceService;
        this.openApiService = openApiService;
        this.flagResolver = config.flagResolver;
        // deprecated routes
        this.get('/seen-toggles', this.deprecated);
        this.get('/seen-apps', this.deprecated);
        this.get('/feature-toggles', this.deprecated);
        this.get('/feature-toggles/:name', this.deprecated);
        this.route({
            method: 'post',
            path: '/applications/:appName',
            handler: this.createApplication,
            permission: permissions_1.UPDATE_APPLICATION,
            middleware: [
                openApiService.validPath({
                    tags: ['Metrics'],
                    operationId: 'createApplication',
                    summary: 'Create an application to connect reported metrics',
                    description: 'Is used to report usage as well which sdk the application uses',
                    responses: {
                        202: standard_responses_1.emptyResponse,
                        ...(0, standard_responses_1.getStandardResponses)(400, 401, 403),
                    },
                    requestBody: (0, create_request_schema_1.createRequestSchema)('createApplicationSchema'),
                }),
            ],
        });
        this.route({
            method: 'delete',
            path: '/applications/:appName',
            handler: this.deleteApplication,
            permission: permissions_1.UPDATE_APPLICATION,
            acceptAnyContentType: true,
            middleware: [
                openApiService.validPath({
                    tags: ['Metrics'],
                    operationId: 'deleteApplication',
                    summary: 'Delete an application',
                    description: `Delete the application specified in the request URL. Returns 200 OK if the application was successfully deleted or if it didn't exist`,
                    responses: {
                        200: standard_responses_1.emptyResponse,
                        ...(0, standard_responses_1.getStandardResponses)(401, 403),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/applications',
            handler: this.getApplications,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Metrics'],
                    summary: 'Get all applications',
                    description: 'Returns all applications registered with Unleash. Applications can be created via metrics reporting or manual creation',
                    parameters: [...applications_query_parameters_1.applicationsQueryParameters],
                    operationId: 'getApplications',
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('applicationsSchema'),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/applications/:appName',
            handler: this.getApplication,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Metrics'],
                    operationId: 'getApplication',
                    summary: 'Get application data',
                    description: 'Returns data about the specified application (`appName`). The data contains information on the name of the application, sdkVersion (which sdk reported these metrics, typically `unleash-client-node:3.4.1` or `unleash-client-java:7.1.0`), as well as data about how to display this application in a list.',
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('applicationSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(404),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/applications/:appName/overview',
            handler: this.getApplicationOverview,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Metrics'],
                    operationId: 'getApplicationOverview',
                    summary: 'Get application overview',
                    description: 'Returns an overview of the specified application (`appName`).',
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('applicationOverviewSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(404),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/instances/:appName/environment/:environment',
            handler: this.getApplicationEnvironmentInstances,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Metrics'],
                    operationId: 'getApplicationEnvironmentInstances',
                    summary: 'Get application environment instances (Last 24h)',
                    description: 'Returns an overview of the instances for the given `appName` and `environment` that have received traffic in the last 24 hours.',
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('applicationEnvironmentInstancesSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(404),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/sdks/outdated',
            handler: this.getOutdatedSdks,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Metrics'],
                    operationId: 'getOutdatedSdks',
                    summary: 'Get outdated SDKs',
                    description: 'Returns a list of the outdated SDKS with the applications using them.',
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('outdatedSdksSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(404),
                    },
                }),
            ],
        });
    }
    async deprecated(req, res) {
        res.status(410).json({
            lastHour: {},
            lastMinute: {},
            maturity: 'deprecated',
        });
    }
    async deleteApplication(req, res) {
        const { appName } = req.params;
        await this.clientInstanceService.deleteApplication(appName);
        res.status(200).end();
    }
    async createApplication(req, res) {
        const input = {
            ...req.body,
            appName: req.params.appName,
        };
        await this.clientInstanceService.createApplication(input);
        res.status(202).end();
    }
    async getApplications(req, res) {
        const { user } = req;
        const { normalizedQuery, normalizedSortOrder, normalizedOffset, normalizedLimit, } = (0, search_utils_1.normalizeQueryParams)(req.query, {
            limitDefault: 1000,
            maxLimit: 1000,
        });
        const applications = await this.clientInstanceService.getApplications({
            searchParams: normalizedQuery,
            offset: normalizedOffset,
            limit: normalizedLimit,
            sortBy: req.query.sortBy,
            sortOrder: normalizedSortOrder,
        }, (0, util_1.extractUserIdFromUser)(user));
        res.json(applications);
    }
    async getApplication(req, res) {
        const { appName } = req.params;
        const appDetails = await this.clientInstanceService.getApplication(appName);
        res.json(appDetails);
    }
    async getApplicationOverview(req, res) {
        const { appName } = req.params;
        const { user } = req;
        const overview = await this.clientInstanceService.getApplicationOverview(appName, (0, util_1.extractUserIdFromUser)(user));
        this.openApiService.respondWithValidation(200, res, application_overview_schema_1.applicationOverviewSchema.$id, (0, types_1.serializeDates)(overview));
    }
    async getOutdatedSdks(req, res) {
        const outdatedSdks = await this.clientInstanceService.getOutdatedSdks();
        this.openApiService.respondWithValidation(200, res, outdated_sdks_schema_1.outdatedSdksSchema.$id, { sdks: outdatedSdks });
    }
    async getApplicationEnvironmentInstances(req, res) {
        const { appName, environment } = req.params;
        const instances = await this.clientInstanceService.getRecentApplicationEnvironmentInstances(appName, environment);
        this.openApiService.respondWithValidation(200, res, application_environment_instances_schema_1.applicationEnvironmentInstancesSchema.$id, (0, types_1.serializeDates)({ instances }));
    }
}
exports.default = MetricsController;
//# sourceMappingURL=metrics.js.map