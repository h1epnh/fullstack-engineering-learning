"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicInviteController = void 0;
const controller_1 = __importDefault(require("./controller"));
const permissions_1 = require("../types/permissions");
const create_request_schema_1 = require("../openapi/util/create-request-schema");
const create_response_schema_1 = require("../openapi/util/create-response-schema");
const serialize_dates_1 = require("../types/serialize-dates");
const standard_responses_1 = require("../openapi/util/standard-responses");
const user_schema_1 = require("../openapi/spec/user-schema");
class PublicInviteController extends controller_1.default {
    constructor(config, { publicSignupTokenService, openApiService, }) {
        super(config);
        this.publicSignupTokenService = publicSignupTokenService;
        this.openApiService = openApiService;
        this.logger = config.getLogger('validate-invite-token-controller.js');
        this.route({
            method: 'get',
            path: '/:token/validate',
            handler: this.validate,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Public signup tokens'],
                    operationId: 'validatePublicSignupToken',
                    summary: `Validate signup token`,
                    description: `Check whether the provided public sign-up token exists, has not expired and is enabled`,
                    responses: {
                        200: standard_responses_1.emptyResponse,
                        ...(0, standard_responses_1.getStandardResponses)(400),
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '/:token/signup',
            handler: this.addTokenUser,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Public signup tokens'],
                    operationId: 'addPublicSignupTokenUser',
                    summary: 'Add a user via a signup token',
                    description: 'Create a user with the viewer root role and link them to the provided signup token',
                    requestBody: (0, create_request_schema_1.createRequestSchema)('createInvitedUserSchema'),
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('userSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(400, 409),
                    },
                }),
            ],
        });
    }
    async validate(req, res) {
        const { token } = req.params;
        const valid = await this.publicSignupTokenService.validate(token);
        if (valid) {
            res.status(200).end();
        }
        else {
            res.status(400).end();
        }
    }
    async addTokenUser(req, res) {
        const { token } = req.params;
        const valid = await this.publicSignupTokenService.validate(token);
        if (!valid) {
            res.status(400).end();
            return;
        }
        const user = await this.publicSignupTokenService.addTokenUser(token, req.body, req.audit);
        this.openApiService.respondWithValidation(201, res, user_schema_1.userSchema.$id, (0, serialize_dates_1.serializeDates)(user));
    }
}
exports.PublicInviteController = PublicInviteController;
//# sourceMappingURL=public-invite.js.map