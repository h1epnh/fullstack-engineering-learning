"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvironmentsController = void 0;
const controller_1 = __importDefault(require("../controller"));
const permissions_1 = require("../../types/permissions");
const create_request_schema_1 = require("../../openapi/util/create-request-schema");
const create_response_schema_1 = require("../../openapi/util/create-response-schema");
const environments_schema_1 = require("../../openapi/spec/environments-schema");
const environment_schema_1 = require("../../openapi/spec/environment-schema");
const standard_responses_1 = require("../../openapi/util/standard-responses");
const environments_project_schema_1 = require("../../openapi/spec/environments-project-schema");
class EnvironmentsController extends controller_1.default {
    constructor(config, { environmentService, openApiService, }) {
        super(config);
        this.logger = config.getLogger('admin-api/environments-controller.ts');
        this.openApiService = openApiService;
        this.service = environmentService;
        this.route({
            method: 'get',
            path: '',
            handler: this.getAllEnvironments,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Environments'],
                    summary: 'Get all environments',
                    description: 'Retrieves all environments that exist in this Unleash instance.',
                    operationId: 'getAllEnvironments',
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('environmentsSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(401, 403),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/:name',
            handler: this.getEnvironment,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Environments'],
                    operationId: 'getEnvironment',
                    summary: 'Get the environment with `name`',
                    description: 'Retrieves the environment with `name` if it exists in this Unleash instance',
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('environmentSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(401, 403, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/project/:projectId',
            handler: this.getProjectEnvironments,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Environments'],
                    operationId: 'getProjectEnvironments',
                    summary: 'Get the environments available to a project',
                    description: 'Gets the environments that are available for this project. An environment is available for a project if enabled in the [project configuration](https://docs.getunleash.io/reference/environments#enable-an-environment)',
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('environmentsProjectSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(401, 403, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'put',
            path: '/sort-order',
            handler: this.updateSortOrder,
            permission: permissions_1.ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Environments'],
                    summary: 'Update environment sort orders',
                    description: 'Updates sort orders for the named environments. Environments not specified are unaffected.',
                    operationId: 'updateSortOrder',
                    requestBody: (0, create_request_schema_1.createRequestSchema)('sortOrderSchema'),
                    responses: {
                        200: standard_responses_1.emptyResponse,
                        ...(0, standard_responses_1.getStandardResponses)(401, 403, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '/:name/on',
            acceptAnyContentType: true,
            handler: this.toggleEnvironmentOn,
            permission: permissions_1.ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Environments'],
                    summary: 'Toggle the environment with `name` on',
                    description: 'Makes it possible to enable this environment for a project. An environment must first be globally enabled using this endpoint before it can be enabled for a project',
                    operationId: 'toggleEnvironmentOn',
                    responses: {
                        204: standard_responses_1.emptyResponse,
                        ...(0, standard_responses_1.getStandardResponses)(401, 403, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '/:name/off',
            acceptAnyContentType: true,
            handler: this.toggleEnvironmentOff,
            permission: permissions_1.ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Environments'],
                    summary: 'Toggle the environment with `name` off',
                    description: 'Removes this environment from the list of available environments for projects to use',
                    operationId: 'toggleEnvironmentOff',
                    responses: {
                        204: standard_responses_1.emptyResponse,
                        ...(0, standard_responses_1.getStandardResponses)(401, 403, 404),
                    },
                }),
            ],
        });
    }
    async getAllEnvironments(req, res) {
        this.openApiService.respondWithValidation(200, res, environments_schema_1.environmentsSchema.$id, { version: 1, environments: await this.service.getAll() });
    }
    async updateSortOrder(req, res) {
        await this.service.updateSortOrder(req.body);
        res.status(200).end();
    }
    async toggleEnvironmentOn(req, res) {
        const { name } = req.params;
        await this.service.toggleEnvironment(name, true);
        res.status(204).end();
    }
    async toggleEnvironmentOff(req, res) {
        const { name } = req.params;
        await this.service.toggleEnvironment(name, false);
        res.status(204).end();
    }
    async getEnvironment(req, res) {
        this.openApiService.respondWithValidation(200, res, environment_schema_1.environmentSchema.$id, await this.service.get(req.params.name));
    }
    async getProjectEnvironments(req, res) {
        this.openApiService.respondWithValidation(200, res, environments_project_schema_1.environmentsProjectSchema.$id, {
            version: 1,
            environments: (await this.service.getProjectEnvironments(req.params.projectId)),
        });
    }
}
exports.EnvironmentsController = EnvironmentsController;
//# sourceMappingURL=environments.js.map