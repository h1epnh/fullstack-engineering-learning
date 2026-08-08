"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicSignupController = void 0;
const controller_1 = __importDefault(require("../controller"));
const types_1 = require("../../types");
const openapi_1 = require("../../openapi");
class PublicSignupController extends controller_1.default {
    constructor(config, { publicSignupTokenService, accessService, userService, openApiService, }) {
        super(config);
        this.publicSignupTokenService = publicSignupTokenService;
        this.accessService = accessService;
        this.userService = userService;
        this.openApiService = openApiService;
        this.logger = config.getLogger('public-signup-controller.js');
        this.route({
            method: 'get',
            path: '/tokens',
            handler: this.getAllPublicSignupTokens,
            permission: types_1.ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Public signup tokens'],
                    summary: 'Get public signup tokens',
                    description: 'Retrieves all existing public signup tokens.',
                    operationId: 'getAllPublicSignupTokens',
                    responses: {
                        200: (0, openapi_1.createResponseSchema)('publicSignupTokensSchema'),
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '/tokens',
            handler: this.createPublicSignupToken,
            permission: types_1.ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Public signup tokens'],
                    operationId: 'createPublicSignupToken',
                    summary: 'Create a public signup token',
                    description: 'Lets administrators create a invite link to share with colleagues.  People that join using the public invite are assigned the `Viewer` role',
                    requestBody: (0, openapi_1.createRequestSchema)('publicSignupTokenCreateSchema'),
                    responses: {
                        201: (0, openapi_1.resourceCreatedResponseSchema)('publicSignupTokenSchema'),
                        ...(0, openapi_1.getStandardResponses)(400, 401, 403),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/tokens/:token',
            handler: this.getPublicSignupToken,
            permission: types_1.ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Public signup tokens'],
                    summary: 'Retrieve a token',
                    description: "Get information about a specific token. The `:token` part of the URL should be the token's secret.",
                    operationId: 'getPublicSignupToken',
                    responses: {
                        200: (0, openapi_1.createResponseSchema)('publicSignupTokenSchema'),
                        ...(0, openapi_1.getStandardResponses)(401, 403),
                    },
                }),
            ],
        });
        this.route({
            method: 'put',
            path: '/tokens/:token',
            handler: this.updatePublicSignupToken,
            permission: types_1.ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Public signup tokens'],
                    operationId: 'updatePublicSignupToken',
                    summary: 'Update a public signup token',
                    description: "Update information about a specific token. The `:token` part of the URL should be the token's secret.",
                    requestBody: (0, openapi_1.createRequestSchema)('publicSignupTokenUpdateSchema'),
                    responses: {
                        200: (0, openapi_1.createResponseSchema)('publicSignupTokenSchema'),
                        ...(0, openapi_1.getStandardResponses)(400, 401, 403),
                    },
                }),
            ],
        });
    }
    async getAllPublicSignupTokens(req, res) {
        const tokens = await this.publicSignupTokenService.getAllTokens();
        this.openApiService.respondWithValidation(200, res, openapi_1.publicSignupTokensSchema.$id, { tokens: (0, types_1.serializeDates)(tokens) });
    }
    async getPublicSignupToken(req, res) {
        const { token } = req.params;
        const result = await this.publicSignupTokenService.get(token);
        this.openApiService.respondWithValidation(200, res, openapi_1.publicSignupTokenSchema.$id, (0, types_1.serializeDates)(result));
    }
    async createPublicSignupToken(req, res) {
        const token = await this.publicSignupTokenService.createNewPublicSignupToken(req.body, req.audit);
        this.openApiService.respondWithValidation(201, res, openapi_1.publicSignupTokenSchema.$id, (0, types_1.serializeDates)(token), { location: `tokens/${token.secret}` });
    }
    async updatePublicSignupToken(req, res) {
        const { token } = req.params;
        const { expiresAt, enabled } = req.body;
        if (!expiresAt && enabled === undefined) {
            this.logger.error(req.body);
            return res.status(400).send();
        }
        const result = await this.publicSignupTokenService.update(token, {
            ...(enabled === undefined ? {} : { enabled }),
            ...(expiresAt ? { expiresAt: new Date(expiresAt) } : {}),
        }, req.audit);
        this.openApiService.respondWithValidation(200, res, openapi_1.publicSignupTokenSchema.$id, (0, types_1.serializeDates)(result));
    }
}
exports.PublicSignupController = PublicSignupController;
//# sourceMappingURL=public-signup.js.map