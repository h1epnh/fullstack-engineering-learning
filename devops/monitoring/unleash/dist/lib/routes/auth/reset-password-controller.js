"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = __importDefault(require("../controller"));
const permissions_1 = require("../../types/permissions");
const create_request_schema_1 = require("../../openapi/util/create-request-schema");
const create_response_schema_1 = require("../../openapi/util/create-response-schema");
const token_user_schema_1 = require("../../openapi/spec/token-user-schema");
const standard_responses_1 = require("../../openapi/util/standard-responses");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const date_fns_1 = require("date-fns");
class ResetPasswordController extends controller_1.default {
    constructor(config, { userService, openApiService, }) {
        super(config);
        this.logger = config.getLogger('lib/routes/auth/reset-password-controller.ts');
        this.openApiService = openApiService;
        this.userService = userService;
        this.route({
            method: 'get',
            path: '/validate',
            handler: this.validateToken,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    summary: 'Validates a token',
                    description: 'If the token is valid returns the user that owns the token',
                    tags: ['Auth'],
                    operationId: 'validateToken',
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('tokenUserSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(401, 415),
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '/password',
            handler: this.changePassword,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Auth'],
                    summary: `Changes a user password`,
                    description: 'Allows users with a valid reset token to reset their password without remembering their old password',
                    operationId: 'changePassword',
                    requestBody: (0, create_request_schema_1.createRequestSchema)('changePasswordSchema'),
                    responses: {
                        200: standard_responses_1.emptyResponse,
                        ...(0, standard_responses_1.getStandardResponses)(401, 403, 415),
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '/validate-password',
            handler: this.validatePassword,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Auth'],
                    summary: 'Validates password',
                    description: 'Verifies that the password adheres to the [Unleash password guidelines](https://docs.getunleash.io/reference/deploy/securing-unleash#password-requirements)',
                    operationId: 'validatePassword',
                    requestBody: (0, create_request_schema_1.createRequestSchema)('validatePasswordSchema'),
                    responses: {
                        200: standard_responses_1.emptyResponse,
                        ...(0, standard_responses_1.getStandardResponses)(400, 415),
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '/password-email',
            handler: this.sendResetPasswordEmail,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Auth'],
                    summary: 'Reset password',
                    description: 'Requests a password reset email for the user. This email can be used to reset the password for a user that has forgotten their password',
                    operationId: 'sendResetPasswordEmail',
                    requestBody: (0, create_request_schema_1.createRequestSchema)('emailSchema'),
                    responses: {
                        200: standard_responses_1.emptyResponse,
                        ...(0, standard_responses_1.getStandardResponses)(401, 404, 415),
                    },
                }),
                (0, express_rate_limit_1.default)({
                    windowMs: (0, date_fns_1.minutesToMilliseconds)(1),
                    max: config.rateLimiting.passwordResetMaxPerMinute,
                    validate: false,
                    standardHeaders: true,
                    legacyHeaders: false,
                }),
            ],
        });
    }
    async sendResetPasswordEmail(req, res) {
        const { email } = req.body;
        await this.userService.createResetPasswordEmail(email);
        res.status(200).end();
    }
    async validatePassword(req, res) {
        const { password } = req.body;
        this.userService.validatePassword(password);
        res.status(200).end();
    }
    async validateToken(req, res) {
        const { token } = req.query;
        const user = await this.userService.getUserForToken(token);
        await this.logout(req);
        this.openApiService.respondWithValidation(200, res, token_user_schema_1.tokenUserSchema.$id, user);
    }
    async changePassword(req, res) {
        await this.logout(req);
        const { token, password } = req.body;
        await this.userService.resetPassword(token, password);
        res.status(200).end();
    }
    async logout(req) {
        if (req.session) {
            req.session.destroy(() => { });
        }
    }
}
exports.default = ResetPasswordController;
//# sourceMappingURL=reset-password-controller.js.map