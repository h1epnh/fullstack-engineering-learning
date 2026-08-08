"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = __importDefault(require("../../controller"));
const permissions_1 = require("../../../types/permissions");
const create_response_schema_1 = require("../../../openapi/util/create-response-schema");
const standard_responses_1 = require("../../../openapi/util/standard-responses");
const serialize_dates_1 = require("../../../types/serialize-dates");
const health_report_schema_1 = require("../../../openapi/spec/health-report-schema");
class ProjectHealthReport extends controller_1.default {
    constructor(config, { projectHealthService, openApiService, }) {
        super(config);
        this.logger = config.getLogger('/admin-api/project/health-report');
        this.projectHealthService = projectHealthService;
        this.openApiService = openApiService;
        this.route({
            method: 'get',
            path: '/:projectId/health-report',
            handler: this.getProjectHealthReport,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Projects'],
                    deprecated: true,
                    operationId: 'getProjectHealthReport',
                    summary: 'Get a health report for a project.',
                    description: 'This endpoint returns a health report for the specified project. This data is used for [the technical debt insights](https://docs.getunleash.io/reference/technical-debt)',
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('healthReportSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(401, 403, 404),
                    },
                }),
            ],
        });
    }
    async getProjectHealthReport(req, res) {
        const { projectId } = req.params;
        const overview = await this.projectHealthService.getProjectHealthReport(projectId);
        this.openApiService.respondWithValidation(200, res, health_report_schema_1.healthReportSchema.$id, (0, serialize_dates_1.serializeDates)(overview));
    }
}
exports.default = ProjectHealthReport;
//# sourceMappingURL=health-report.js.map