"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissions_1 = require("../../types/permissions");
const controller_1 = __importDefault(require("../controller"));
const create_request_schema_1 = require("../../openapi/util/create-request-schema");
const openapi_1 = require("../../openapi");
class ConstraintController extends controller_1.default {
    constructor(config, { featureToggleService, openApiService, }) {
        super(config);
        this.featureService = featureToggleService;
        this.openApiService = openApiService;
        this.logger = config.getLogger('/admin-api/validation.ts');
        this.route({
            method: 'post',
            path: '/validate',
            handler: this.validateConstraint,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    operationId: 'validateConstraint',
                    requestBody: (0, create_request_schema_1.createRequestSchema)('constraintSchema'),
                    summary: 'Validate constraint',
                    description: 'Validates a constraint definition. Checks whether the context field exists and whether the applied configuration is valid. Additional properties are not allowed on data objects that you send to this endpoint.',
                    responses: {
                        204: { description: 'The constraint is valid' },
                        ...(0, openapi_1.getStandardResponses)(400, 401, 403, 415),
                    },
                }),
            ],
        });
    }
    async validateConstraint(req, res) {
        await this.featureService.validateConstraint(req.body);
        res.status(204).send();
    }
}
exports.default = ConstraintController;
//# sourceMappingURL=constraints.js.map