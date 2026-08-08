"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = __importDefault(require("../../routes/controller"));
const types_1 = require("../../types");
const feature_toggle_controller_1 = __importDefault(require("../feature-toggle/feature-toggle-controller"));
const environments_1 = __importDefault(require("../project-environments/environments"));
const health_report_1 = __importDefault(require("../../routes/admin-api/project/health-report"));
const variants_1 = __importDefault(require("../../routes/admin-api/project/variants"));
const openapi_1 = require("../../openapi");
const standard_responses_1 = require("../../openapi/util/standard-responses");
const api_token_1 = require("../../routes/admin-api/project/api-token");
const project_archive_1 = __importDefault(require("../../routes/admin-api/project/project-archive"));
const transaction_1 = require("../../db/transaction");
const dependent_features_controller_1 = __importDefault(require("../dependent-features/dependent-features-controller"));
const project_applications_schema_1 = require("../../openapi/spec/project-applications-schema");
const project_applications_query_parameters_1 = require("../../openapi/spec/project-applications-query-parameters");
const search_utils_1 = require("../feature-search/search-utils");
const project_insights_controller_1 = __importDefault(require("../project-insights/project-insights-controller"));
const feature_lifecycle_controller_1 = __importDefault(require("../feature-lifecycle/feature-lifecycle-controller"));
const project_flag_creators_schema_1 = require("../../openapi/spec/project-flag-creators-schema");
const project_status_controller_1 = __importDefault(require("../project-status/project-status-controller"));
class ProjectController extends controller_1.default {
    constructor(config, services, db) {
        super(config);
        this.projectService = services.projectService;
        this.clientInstanceService = services.clientInstanceService;
        this.openApiService = services.openApiService;
        this.flagResolver = config.flagResolver;
        this.route({
            path: '',
            method: 'get',
            handler: this.getProjects,
            permission: types_1.NONE,
            middleware: [
                this.openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'getProjects',
                    summary: 'Get a list of all projects.',
                    description: 'This endpoint returns an list of all the projects in the Unleash instance.',
                    parameters: [
                        {
                            name: 'archived',
                            in: 'query',
                            required: false,
                            schema: {
                                type: 'boolean',
                            },
                        },
                    ],
                    responses: {
                        200: (0, openapi_1.createResponseSchema)('projectsSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(401, 403),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/:projectId',
            handler: this.getDeprecatedProjectOverview,
            permission: types_1.NONE,
            middleware: [
                this.openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'getDeprecatedProjectOverview',
                    summary: 'Get an overview of a project. (deprecated)',
                    deprecated: true,
                    description: 'This endpoint returns an overview of the specified projects stats, project health, number of members, which environments are configured, and the features in the project.',
                    responses: {
                        200: (0, openapi_1.createResponseSchema)('deprecatedProjectOverviewSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(401, 403, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/:projectId/overview',
            handler: this.getProjectOverview,
            permission: types_1.NONE,
            middleware: [
                this.openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'getProjectOverview',
                    summary: 'Get an overview of a project.',
                    description: 'This endpoint returns an overview of the specified projects stats, project health, number of members, which environments are configured, and the features types in the project.',
                    responses: {
                        200: (0, openapi_1.createResponseSchema)('projectOverviewSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(401, 403, 404),
                    },
                }),
            ],
        });
        /** @deprecated use project insights instead */
        this.route({
            method: 'get',
            path: '/:projectId/dora',
            handler: this.getProjectDora,
            permission: types_1.NONE,
            middleware: [
                this.openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'getProjectDora',
                    summary: 'Get an overview project dora metrics.',
                    description: 'This endpoint returns an overview of the specified dora metrics',
                    responses: {
                        200: (0, openapi_1.createResponseSchema)('projectDoraMetricsSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(401, 403, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/:projectId/applications',
            handler: this.getProjectApplications,
            permission: types_1.NONE,
            middleware: [
                this.openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'getProjectApplications',
                    summary: 'Get a list of all applications for a project.',
                    description: 'This endpoint returns an list of all the applications for a project.',
                    parameters: [...project_applications_query_parameters_1.projectApplicationsQueryParameters],
                    responses: {
                        200: (0, openapi_1.createResponseSchema)('projectApplicationsSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(401, 403, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/:projectId/flag-creators',
            handler: this.getProjectFlagCreators,
            permission: types_1.NONE,
            middleware: [
                this.openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'getProjectFlagCreators',
                    summary: 'Get a list of all flag creators for a project.',
                    description: 'This endpoint returns every user who created a flag in the project.',
                    responses: {
                        200: (0, openapi_1.createResponseSchema)('projectFlagCreatorsSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(401, 403, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/:projectId/sdks/outdated',
            handler: this.getOutdatedProjectSdks,
            permission: types_1.NONE,
            middleware: [
                this.openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'getOutdatedProjectSdks',
                    summary: 'Get outdated project SDKs',
                    description: 'Returns a list of the outdated SDKS with the applications using them.',
                    responses: {
                        200: (0, openapi_1.createResponseSchema)('outdatedSdksSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(404),
                    },
                }),
            ],
        });
        this.use('/', new feature_toggle_controller_1.default(config, services, (0, transaction_1.createKnexTransactionStarter)(db)).router);
        this.use('/', new dependent_features_controller_1.default(config, services).router);
        this.use('/', new environments_1.default(config, services).router);
        this.use('/', new health_report_1.default(config, services).router);
        this.use('/', new variants_1.default(config, services).router);
        this.use('/', new api_token_1.ProjectApiTokenController(config, services).router);
        this.use('/', new project_archive_1.default(config, services, (0, transaction_1.createKnexTransactionStarter)(db)).router);
        this.use('/', new project_insights_controller_1.default(config, services).router);
        this.use('/', new project_status_controller_1.default(config, services).router);
        this.use('/', new feature_lifecycle_controller_1.default(config, services).router);
    }
    async getProjects(req, res) {
        const { user } = req;
        const projects = await this.projectService.getProjects({
            id: 'default',
        }, user.id);
        const projectsWithOwners = await this.projectService.addOwnersToProjects(projects);
        this.openApiService.respondWithValidation(200, res, openapi_1.projectsSchema.$id, { version: 1, projects: (0, types_1.serializeDates)(projectsWithOwners) });
    }
    async getDeprecatedProjectOverview(req, res) {
        const { projectId } = req.params;
        const { archived } = req.query;
        const { user } = req;
        const overview = await this.projectService.getProjectHealth(projectId, archived, user.id);
        this.openApiService.respondWithValidation(200, res, openapi_1.deprecatedProjectOverviewSchema.$id, (0, types_1.serializeDates)(overview));
    }
    async getProjectOverview(req, res) {
        const { projectId } = req.params;
        const { archived } = req.query;
        const { user } = req;
        const overview = await this.projectService.getProjectOverview(projectId, archived, user.id);
        this.openApiService.respondWithValidation(200, res, openapi_1.projectOverviewSchema.$id, (0, types_1.serializeDates)(overview));
    }
    /** @deprecated use projectInsights instead */
    async getProjectDora(req, res) {
        const { projectId } = req.params;
        const dora = await this.projectService.getDoraMetrics(projectId);
        this.openApiService.respondWithValidation(200, res, openapi_1.projectDoraMetricsSchema.$id, dora);
    }
    async getProjectApplications(req, res) {
        const { projectId } = req.params;
        const { normalizedQuery, normalizedSortOrder, normalizedOffset, normalizedLimit, } = (0, search_utils_1.normalizeQueryParams)(req.query, {
            limitDefault: 50,
            maxLimit: 100,
        });
        const applications = await this.projectService.getApplications({
            searchParams: normalizedQuery,
            project: projectId,
            offset: normalizedOffset,
            limit: normalizedLimit,
            sortBy: req.query.sortBy,
            sortOrder: normalizedSortOrder,
        });
        this.openApiService.respondWithValidation(200, res, project_applications_schema_1.projectApplicationsSchema.$id, (0, types_1.serializeDates)(applications));
    }
    async getProjectFlagCreators(req, res) {
        const { projectId } = req.params;
        const flagCreators = await this.projectService.getProjectFlagCreators(projectId);
        this.openApiService.respondWithValidation(200, res, project_flag_creators_schema_1.projectFlagCreatorsSchema.$id, (0, types_1.serializeDates)(flagCreators));
    }
    async getOutdatedProjectSdks(req, res) {
        const { projectId } = req.params;
        const outdatedSdks = await this.clientInstanceService.getOutdatedSdksByProject(projectId);
        this.openApiService.respondWithValidation(200, res, openapi_1.outdatedSdksSchema.$id, { sdks: outdatedSdks });
    }
}
exports.default = ProjectController;
//# sourceMappingURL=project-controller.js.map