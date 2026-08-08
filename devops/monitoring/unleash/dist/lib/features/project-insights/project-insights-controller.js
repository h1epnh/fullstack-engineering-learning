"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = __importDefault(require("../../routes/controller"));
const types_1 = require("../../types");
const openapi_1 = require("../../openapi");
const standard_responses_1 = require("../../openapi/util/standard-responses");
class ProjectInsightsController extends controller_1.default {
    constructor(config, services) {
        super(config);
        this.projectInsightsService = services.projectInsightsService;
        this.openApiService = services.openApiService;
        this.flagResolver = config.flagResolver;
        this.route({
            method: 'get',
            path: '/:projectId/insights',
            handler: this.getProjectInsights,
            permission: types_1.NONE,
            middleware: [
                this.openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'getProjectInsights',
                    summary: 'Get an overview of a project insights.',
                    description: 'This endpoint returns insights into the specified projects stats, health, lead time for changes, feature types used, members and change requests.',
                    responses: {
                        200: (0, openapi_1.createResponseSchema)('projectInsightsSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(401, 403, 404),
                    },
                }),
            ],
        });
    }
    async getProjectInsights(req, res) {
        const { projectId } = req.params;
        const insights = await this.projectInsightsService.getProjectInsights(projectId);
        this.openApiService.respondWithValidation(200, res, openapi_1.projectInsightsSchema.$id, (0, types_1.serializeDates)(insights));
    }
}
exports.default = ProjectInsightsController;
//# sourceMappingURL=project-insights-controller.js.map