"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiTokenController = exports.tokenTypeToCreatePermission = void 0;
const controller_1 = __importDefault(require("../controller"));
const permissions_1 = require("../../types/permissions");
const api_token_1 = require("../../types/models/api-token");
const api_token_schema_1 = require("../../schema/api-token-schema");
const create_request_schema_1 = require("../../openapi/util/create-request-schema");
const create_response_schema_1 = require("../../openapi/util/create-response-schema");
const api_tokens_schema_1 = require("../../openapi/spec/api-tokens-schema");
const serialize_dates_1 = require("../../types/serialize-dates");
const api_token_schema_2 = require("../../openapi/spec/api-token-schema");
const standard_responses_1 = require("../../openapi/util/standard-responses");
const error_1 = require("../../error");
const tokenTypeToCreatePermission = (tokenType) => {
    switch (tokenType) {
        case api_token_1.ApiTokenType.ADMIN:
            return permissions_1.ADMIN;
        case api_token_1.ApiTokenType.CLIENT:
            return permissions_1.CREATE_CLIENT_API_TOKEN;
        case api_token_1.ApiTokenType.FRONTEND:
            return permissions_1.CREATE_FRONTEND_API_TOKEN;
    }
};
exports.tokenTypeToCreatePermission = tokenTypeToCreatePermission;
const permissionToTokenType = (permission) => {
    if ([
        permissions_1.CREATE_FRONTEND_API_TOKEN,
        permissions_1.READ_FRONTEND_API_TOKEN,
        permissions_1.DELETE_FRONTEND_API_TOKEN,
        permissions_1.UPDATE_FRONTEND_API_TOKEN,
    ].includes(permission)) {
        return api_token_1.ApiTokenType.FRONTEND;
    }
    else if ([
        permissions_1.CREATE_CLIENT_API_TOKEN,
        permissions_1.READ_CLIENT_API_TOKEN,
        permissions_1.DELETE_CLIENT_API_TOKEN,
        permissions_1.UPDATE_CLIENT_API_TOKEN,
    ].includes(permission)) {
        return api_token_1.ApiTokenType.CLIENT;
    }
    else if (permissions_1.ADMIN === permission) {
        return api_token_1.ApiTokenType.ADMIN;
    }
    else {
        return undefined;
    }
};
const tokenTypeToUpdatePermission = (tokenType) => {
    switch (tokenType) {
        case api_token_1.ApiTokenType.ADMIN:
            return permissions_1.ADMIN;
        case api_token_1.ApiTokenType.CLIENT:
            return permissions_1.UPDATE_CLIENT_API_TOKEN;
        case api_token_1.ApiTokenType.FRONTEND:
            return permissions_1.UPDATE_FRONTEND_API_TOKEN;
    }
};
const tokenTypeToDeletePermission = (tokenType) => {
    switch (tokenType) {
        case api_token_1.ApiTokenType.ADMIN:
            return permissions_1.ADMIN;
        case api_token_1.ApiTokenType.CLIENT:
            return permissions_1.DELETE_CLIENT_API_TOKEN;
        case api_token_1.ApiTokenType.FRONTEND:
            return permissions_1.DELETE_FRONTEND_API_TOKEN;
    }
};
class ApiTokenController extends controller_1.default {
    constructor(config, { apiTokenService, accessService, frontendApiService, openApiService, }) {
        super(config);
        this.apiTokenService = apiTokenService;
        this.accessService = accessService;
        this.frontendApiService = frontendApiService;
        this.openApiService = openApiService;
        this.flagResolver = config.flagResolver;
        this.logger = config.getLogger('api-token-controller.js');
        this.route({
            method: 'get',
            path: '',
            handler: this.getAllApiTokens,
            permission: [permissions_1.ADMIN, permissions_1.READ_CLIENT_API_TOKEN, permissions_1.READ_FRONTEND_API_TOKEN],
            middleware: [
                openApiService.validPath({
                    tags: ['API tokens'],
                    operationId: 'getAllApiTokens',
                    summary: 'Get API tokens',
                    description: 'Retrieves all API tokens that exist in the Unleash instance.',
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('apiTokensSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(401, 403),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/:name',
            handler: this.getApiTokensByName,
            permission: [permissions_1.ADMIN, permissions_1.READ_CLIENT_API_TOKEN, permissions_1.READ_FRONTEND_API_TOKEN],
            middleware: [
                openApiService.validPath({
                    tags: ['API tokens'],
                    operationId: 'getApiTokensByName',
                    summary: 'Get API tokens by name',
                    description: 'Retrieves all API tokens that match a given token name. Because token names are not unique, this endpoint will always return a list. If no tokens with the provided name exist, the list will be empty. Otherwise, it will contain all the tokens with the given name.',
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('apiTokensSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(401, 403),
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '',
            handler: this.createApiToken,
            permission: [
                permissions_1.ADMIN,
                permissions_1.CREATE_CLIENT_API_TOKEN,
                permissions_1.CREATE_FRONTEND_API_TOKEN,
            ],
            middleware: [
                openApiService.validPath({
                    tags: ['API tokens'],
                    operationId: 'createApiToken',
                    requestBody: (0, create_request_schema_1.createRequestSchema)('createApiTokenSchema'),
                    summary: 'Create API token',
                    description: `Create an API token of a specific type: one of ${Object.values(api_token_1.ApiTokenType).join(', ')}.`,
                    responses: {
                        201: (0, create_response_schema_1.resourceCreatedResponseSchema)('apiTokenSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(401, 403, 415),
                    },
                }),
            ],
        });
        this.route({
            method: 'put',
            path: '/:token',
            handler: this.updateApiToken,
            permission: [
                permissions_1.ADMIN,
                permissions_1.UPDATE_CLIENT_API_TOKEN,
                permissions_1.UPDATE_FRONTEND_API_TOKEN,
            ],
            middleware: [
                openApiService.validPath({
                    tags: ['API tokens'],
                    operationId: 'updateApiToken',
                    summary: 'Update API token',
                    description: "Updates an existing API token with a new expiry date. The `token` path parameter is the token's `secret`. If the token does not exist, this endpoint returns a 200 OK, but does nothing.",
                    requestBody: (0, create_request_schema_1.createRequestSchema)('updateApiTokenSchema'),
                    responses: {
                        200: standard_responses_1.emptyResponse,
                        ...(0, standard_responses_1.getStandardResponses)(401, 403, 415),
                    },
                }),
            ],
        });
        this.route({
            method: 'delete',
            path: '/:token',
            handler: this.deleteApiToken,
            acceptAnyContentType: true,
            permission: [
                permissions_1.ADMIN,
                permissions_1.DELETE_CLIENT_API_TOKEN,
                permissions_1.DELETE_FRONTEND_API_TOKEN,
            ],
            middleware: [
                openApiService.validPath({
                    tags: ['API tokens'],
                    summary: 'Delete API token',
                    description: "Deletes an existing API token. The `token` path parameter is the token's `secret`. If the token does not exist, this endpoint returns a 200 OK, but does nothing.",
                    operationId: 'deleteApiToken',
                    responses: {
                        200: standard_responses_1.emptyResponse,
                        ...(0, standard_responses_1.getStandardResponses)(401, 403),
                    },
                }),
            ],
        });
    }
    async getAllApiTokens(req, res) {
        const { user } = req;
        const tokens = await this.accessibleTokens(user);
        this.openApiService.respondWithValidation(200, res, api_tokens_schema_1.apiTokensSchema.$id, { tokens: (0, serialize_dates_1.serializeDates)(tokens) });
    }
    async getApiTokensByName(req, res) {
        const { user } = req;
        const { name } = req.params;
        const tokens = await this.accessibleTokensByName(name, user);
        this.openApiService.respondWithValidation(200, res, api_tokens_schema_1.apiTokensSchema.$id, { tokens: (0, serialize_dates_1.serializeDates)(tokens) });
    }
    async createApiToken(req, res) {
        const createToken = await api_token_schema_1.createApiToken.validateAsync(req.body);
        const permissionRequired = (0, exports.tokenTypeToCreatePermission)(createToken.type);
        if (createToken.type.toUpperCase() === 'ADMIN') {
            throw new error_1.OperationDeniedError(`Admin tokens are disabled in this instance. Use a Service account or a PAT to access admin operations instead`);
        }
        const hasPermission = await this.accessService.hasPermission(req.user, permissionRequired);
        if (hasPermission) {
            const token = await this.apiTokenService.createApiToken(createToken, req.audit);
            this.openApiService.respondWithValidation(201, res, api_token_schema_2.apiTokenSchema.$id, (0, serialize_dates_1.serializeDates)(token), { location: `api-tokens` });
        }
        else {
            throw new error_1.OperationDeniedError(`You don't have the necessary access [${permissionRequired}] to perform this operation`);
        }
    }
    async updateApiToken(req, res) {
        const { token } = req.params;
        const { expiresAt } = req.body;
        if (!expiresAt) {
            this.logger.error(req.body);
            return res.status(400).send();
        }
        let tokenToUpdate;
        try {
            tokenToUpdate = await this.apiTokenService.getToken(token);
        }
        catch (error) { }
        if (!tokenToUpdate) {
            res.status(200).end();
            return;
        }
        const permissionRequired = tokenTypeToUpdatePermission(tokenToUpdate.type);
        const hasPermission = await this.accessService.hasPermission(req.user, permissionRequired);
        if (!hasPermission) {
            throw new error_1.OperationDeniedError(`You do not have the required access [${permissionRequired}] to perform this operation`);
        }
        await this.apiTokenService.updateExpiry(token, new Date(expiresAt), req.audit);
        return res.status(200).end();
    }
    async deleteApiToken(req, res) {
        const { token } = req.params;
        let tokenToUpdate;
        try {
            tokenToUpdate = await this.apiTokenService.getToken(token);
        }
        catch (error) { }
        if (!tokenToUpdate) {
            res.status(200).end();
            return;
        }
        const permissionRequired = tokenTypeToDeletePermission(tokenToUpdate.type);
        const hasPermission = await this.accessService.hasPermission(req.user, permissionRequired);
        if (!hasPermission) {
            throw new error_1.OperationDeniedError(`You do not have the required access [${permissionRequired}] to perform this operation`);
        }
        await this.apiTokenService.delete(token, req.audit);
        await this.frontendApiService.deleteClientForFrontendApiToken(token);
        res.status(200).end();
    }
    async accessibleTokensByName(tokenName, user) {
        const allTokens = await this.accessibleTokens(user);
        return allTokens.filter((token) => token.tokenName === tokenName);
    }
    async accessibleTokens(user) {
        const allTokens = await this.apiTokenService.getAllTokens();
        if (user.isAPI && user.permissions.includes(permissions_1.ADMIN)) {
            return allTokens;
        }
        const userPermissions = await this.accessService.getPermissionsForUser(user);
        const allowedTokenTypes = [
            permissions_1.ADMIN,
            permissions_1.READ_CLIENT_API_TOKEN,
            permissions_1.READ_FRONTEND_API_TOKEN,
        ]
            .filter((readPerm) => userPermissions.some((p) => p.permission === readPerm || p.permission === permissions_1.ADMIN))
            .map(permissionToTokenType)
            .filter((t) => t);
        return allTokens.filter((token) => allowedTokenTypes.includes(token.type));
    }
}
exports.ApiTokenController = ApiTokenController;
//# sourceMappingURL=api-token.js.map