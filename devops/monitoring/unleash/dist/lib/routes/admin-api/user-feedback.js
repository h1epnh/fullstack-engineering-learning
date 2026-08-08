"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = __importDefault(require("../controller"));
const permissions_1 = require("../../types/permissions");
const serialize_dates_1 = require("../../types/serialize-dates");
const date_fns_1 = require("date-fns");
const create_request_schema_1 = require("../../openapi/util/create-request-schema");
const create_response_schema_1 = require("../../openapi/util/create-response-schema");
const bad_data_error_1 = __importDefault(require("../../error/bad-data-error"));
const openapi_1 = require("../../openapi");
class UserFeedbackController extends controller_1.default {
    constructor(config, { userFeedbackService, openApiService, }) {
        super(config);
        this.logger = config.getLogger('feedback-controller.ts');
        this.userFeedbackService = userFeedbackService;
        this.openApiService = openApiService;
        this.route({
            method: 'post',
            path: '',
            handler: this.createFeedback,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Admin UI'],
                    operationId: 'createFeedback',
                    summary: 'Send Unleash feedback',
                    description: 'Sends feedback gathered from the Unleash UI to the Unleash server. Must be called with a token with an identifiable user (either from being sent from the UI or from using a [PAT](https://docs.getunleash.io/reference/api-tokens-and-client-keys#personal-access-tokens)).',
                    requestBody: (0, create_request_schema_1.createRequestSchema)('feedbackCreateSchema'),
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('feedbackResponseSchema'),
                        ...(0, openapi_1.getStandardResponses)(400, 401, 415),
                    },
                }),
            ],
        });
        this.route({
            method: 'put',
            path: '/:id',
            handler: this.updateFeedback,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Admin UI'],
                    operationId: 'updateFeedback',
                    summary: 'Update Unleash feedback',
                    description: 'Updates the feedback with the provided ID. Only provided fields are updated. Fields left out are left untouched. Must be called with a token with an identifiable user (either from being sent from the UI or from using a [PAT](https://docs.getunleash.io/reference/api-tokens-and-client-keys#personal-access-tokens)).',
                    requestBody: (0, create_request_schema_1.createRequestSchema)('feedbackUpdateSchema'),
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('feedbackResponseSchema'),
                        ...(0, openapi_1.getStandardResponses)(400, 401, 415),
                    },
                }),
            ],
        });
    }
    async createFeedback(req, res) {
        if (!req.body.feedbackId) {
            throw new bad_data_error_1.default('Missing feedbackId');
        }
        const updated = await this.userFeedbackService.updateFeedback({
            feedbackId: req.body.feedbackId,
            userId: req.user.id,
            given: new Date(),
            neverShow: req.body.neverShow || false,
        });
        this.openApiService.respondWithValidation(200, res, openapi_1.feedbackResponseSchema.$id, (0, serialize_dates_1.serializeDates)(updated));
    }
    async updateFeedback(req, res) {
        const updated = await this.userFeedbackService.updateFeedback({
            feedbackId: req.params.id,
            userId: req.user.id,
            neverShow: req.body.neverShow || false,
            given: (req.body.given && (0, date_fns_1.parseISO)(req.body.given)) || new Date(),
        });
        this.openApiService.respondWithValidation(200, res, openapi_1.feedbackResponseSchema.$id, (0, serialize_dates_1.serializeDates)(updated));
    }
}
module.exports = UserFeedbackController;
exports.default = UserFeedbackController;
//# sourceMappingURL=user-feedback.js.map