"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../types");
const openapi_1 = require("../../openapi");
const controller_1 = __importDefault(require("../../routes/controller"));
const personal_dashboard_project_details_schema_1 = require("../../openapi/spec/personal-dashboard-project-details-schema");
class PersonalDashboardController extends controller_1.default {
    constructor(config, { openApiService, personalDashboardService, }) {
        super(config);
        this.openApiService = openApiService;
        this.personalDashboardService = personalDashboardService;
        this.route({
            method: 'get',
            path: '',
            handler: this.getPersonalDashboard,
            permission: types_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Unstable'],
                    summary: 'Get personal dashboard',
                    description: 'Return all projects and flags that are relevant to the user.',
                    operationId: 'getPersonalDashboard',
                    responses: {
                        200: (0, openapi_1.createResponseSchema)('personalDashboardSchema'),
                        ...(0, openapi_1.getStandardResponses)(401, 403, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/:projectId',
            handler: this.getPersonalDashboardProjectDetails,
            permission: types_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Unstable'],
                    summary: 'Get personal project details',
                    description: 'Return personal dashboard project events, owners, user roles and onboarding status',
                    operationId: 'getPersonalDashboardProjectDetails',
                    responses: {
                        200: (0, openapi_1.createResponseSchema)('personalDashboardProjectDetailsSchema'),
                        ...(0, openapi_1.getStandardResponses)(401, 403, 404),
                    },
                }),
            ],
        });
    }
    async getPersonalDashboard(req, res) {
        const user = req.user;
        const [flags, projects, projectOwners, admins] = await Promise.all([
            this.personalDashboardService.getPersonalFeatures(user.id),
            this.personalDashboardService.getPersonalProjects(user.id),
            this.personalDashboardService.getProjectOwners(user.id),
            this.personalDashboardService.getAdmins(),
        ]);
        this.openApiService.respondWithValidation(200, res, openapi_1.personalDashboardSchema.$id, { projects, flags, projectOwners, admins });
    }
    async getPersonalDashboardProjectDetails(req, res) {
        const user = req.user;
        const projectDetails = await this.personalDashboardService.getPersonalProjectDetails(user.id, req.params.projectId);
        this.openApiService.respondWithValidation(200, res, personal_dashboard_project_details_schema_1.personalDashboardProjectDetailsSchema.$id, (0, types_1.serializeDates)({
            ...projectDetails,
        }));
    }
}
exports.default = PersonalDashboardController;
//# sourceMappingURL=personal-dashboard-controller.js.map