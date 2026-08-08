"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthCheckController = void 0;
const controller_1 = __importDefault(require("./controller"));
const permissions_1 = require("../types/permissions");
const create_response_schema_1 = require("../openapi/util/create-response-schema");
class HealthCheckController extends controller_1.default {
    constructor(config, { openApiService }) {
        super(config);
        this.logger = config.getLogger('health-check.js');
        this.openApiService = openApiService;
        this.route({
            method: 'get',
            path: '',
            handler: this.getHealth,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Operational'],
                    operationId: 'getHealth',
                    summary: 'Get instance operational status',
                    description: 'This operation returns information about whether this Unleash instance is healthy and ready to serve requests or not. Typically used by your deployment orchestrator (e.g. Kubernetes, Docker Swarm, Mesos, et al.).',
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('healthCheckSchema'),
                        500: (0, create_response_schema_1.createResponseSchema)('healthCheckSchema'),
                    },
                }),
            ],
        });
    }
    async getHealth(_, res) {
        res.status(200).json({ health: 'GOOD' });
    }
}
exports.HealthCheckController = HealthCheckController;
//# sourceMappingURL=health-check.js.map