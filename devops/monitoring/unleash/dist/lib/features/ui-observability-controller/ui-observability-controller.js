"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UiObservabilityController = void 0;
const controller_1 = __importDefault(require("../../routes/controller"));
const permissions_1 = require("../../types/permissions");
const standard_responses_1 = require("../../openapi/util/standard-responses");
const openapi_1 = require("../../openapi");
const version = 1;
class UiObservabilityController extends controller_1.default {
    constructor(config, { openApiService }) {
        super(config);
        this.logger = config.getLogger('/admin-api/ui-observability.js');
        this.route({
            method: 'post',
            path: '',
            handler: this.recordUiError,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Admin UI'],
                    operationId: 'uiObservability',
                    summary: 'Accepts errors from the UI client',
                    description: 'This endpoint accepts error reports from the UI client, so that we can add observability on UI errors.',
                    requestBody: (0, openapi_1.createRequestSchema)('recordUiErrorSchema'),
                    responses: {
                        204: standard_responses_1.emptyResponse,
                        ...(0, standard_responses_1.getStandardResponses)(401, 403),
                    },
                }),
            ],
        });
    }
    async recordUiError(req, res) {
        this.logger.error(`UI Observability Error: ${req.body.errorMessage}`, req.body.errorStack);
        res.status(204).end();
    }
}
exports.UiObservabilityController = UiObservabilityController;
//# sourceMappingURL=ui-observability-controller.js.map