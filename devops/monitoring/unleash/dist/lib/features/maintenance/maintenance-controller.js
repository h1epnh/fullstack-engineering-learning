"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../types");
const controller_1 = __importDefault(require("../../routes/controller"));
const openapi_1 = require("../../openapi");
const maintenance_schema_1 = require("../../openapi/spec/maintenance-schema");
class MaintenanceController extends controller_1.default {
    constructor(config, { maintenanceService, openApiService, }) {
        super(config);
        this.maintenanceService = maintenanceService;
        this.openApiService = openApiService;
        this.logger = config.getLogger('routes/admin-api/maintenance');
        this.route({
            method: 'post',
            path: '',
            permission: [types_1.ADMIN, types_1.UPDATE_MAINTENANCE_MODE],
            handler: this.toggleMaintenance,
            middleware: [
                this.openApiService.validPath({
                    summary: 'Enabled/disabled maintenance mode',
                    description: 'Lets administrators put Unleash into a mostly read-only mode. While Unleash is in maintenance mode, users can not change any configuration settings',
                    tags: ['Maintenance'],
                    operationId: 'toggleMaintenance',
                    responses: {
                        204: openapi_1.emptyResponse,
                        ...(0, openapi_1.getStandardResponses)(400, 401, 403),
                    },
                    requestBody: (0, openapi_1.createRequestSchema)('toggleMaintenanceSchema'),
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '',
            permission: [types_1.ADMIN, types_1.UPDATE_MAINTENANCE_MODE],
            handler: this.getMaintenance,
            middleware: [
                this.openApiService.validPath({
                    summary: 'Get maintenance mode status',
                    description: 'Tells you whether maintenance mode is enabled or disabled',
                    tags: ['Maintenance'],
                    operationId: 'getMaintenance',
                    responses: {
                        200: (0, openapi_1.createResponseSchema)('maintenanceSchema'),
                        ...(0, openapi_1.getStandardResponses)(401, 403),
                    },
                }),
            ],
        });
    }
    async toggleMaintenance(req, res) {
        await this.maintenanceService.toggleMaintenanceMode(req.body, req.audit);
        res.status(204).end();
    }
    async getMaintenance(req, res) {
        const settings = await this.maintenanceService.getMaintenanceSetting();
        this.openApiService.respondWithValidation(200, res, maintenance_schema_1.maintenanceSchema.$id, settings);
    }
}
exports.default = MaintenanceController;
module.exports = MaintenanceController;
//# sourceMappingURL=maintenance-controller.js.map