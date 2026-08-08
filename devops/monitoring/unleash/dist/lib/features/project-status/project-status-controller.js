"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = __importDefault(require("../../routes/controller"));
const types_1 = require("../../types");
const standard_responses_1 = require("../../openapi/util/standard-responses");
const openapi_1 = require("../../openapi");
class ProjectStatusController extends controller_1.default {
    constructor(config, services) {
        super(config);
        this.projectStatusService = services.projectStatusService;
        this.openApiService = services.openApiService;
        this.flagResolver = config.flagResolver;
        this.route({
            method: 'get',
            path: '/:projectId/status',
            handler: this.getProjectStatus,
            permission: types_1.NONE,
            middleware: [
                this.openApiService.validPath({
                    tags: ['Unstable'],
                    operationId: 'getProjectStatus',
                    summary: 'Get project status',
                    description: 'This endpoint returns information on the status the project, including activities, health, resources, and aggregated flag lifecycle data.',
                    responses: {
                        200: (0, openapi_1.createResponseSchema)('projectStatusSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(401, 403, 404),
                    },
                }),
            ],
        });
    }
    async getProjectStatus(req, res) {
        const { projectId } = req.params;
        const status = await this.projectStatusService.getProjectStatus(projectId);
        this.openApiService.respondWithValidation(200, res, openapi_1.projectStatusSchema.$id, (0, types_1.serializeDates)(status));
    }
}
exports.default = ProjectStatusController;
//# sourceMappingURL=project-status-controller.js.map