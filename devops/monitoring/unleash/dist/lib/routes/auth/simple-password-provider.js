"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimplePasswordProvider = void 0;
const permissions_1 = require("../../types/permissions");
const controller_1 = __importDefault(require("../controller"));
const create_request_schema_1 = require("../../openapi/util/create-request-schema");
const create_response_schema_1 = require("../../openapi/util/create-response-schema");
const user_schema_1 = require("../../openapi/spec/user-schema");
const serialize_dates_1 = require("../../types/serialize-dates");
const openapi_1 = require("../../openapi");
class SimplePasswordProvider extends controller_1.default {
    constructor(config, { userService, openApiService, }) {
        super(config);
        this.logger = config.getLogger('/auth/password-provider.js');
        this.openApiService = openApiService;
        this.userService = userService;
        this.route({
            method: 'post',
            path: '/login',
            handler: this.login,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Auth'],
                    summary: 'Log in',
                    description: 'Logs in the user and creates an active session',
                    operationId: 'login',
                    requestBody: (0, create_request_schema_1.createRequestSchema)('loginSchema'),
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('userSchema'),
                        ...(0, openapi_1.getStandardResponses)(401),
                    },
                }),
            ],
        });
    }
    async login(req, res) {
        const { username, password } = req.body;
        const userAgent = req.get('user-agent');
        const user = await this.userService.loginUser(username, password, {
            userAgent,
            ip: req.ip,
        });
        req.session.user = user;
        this.openApiService.respondWithValidation(200, res, user_schema_1.userSchema.$id, (0, serialize_dates_1.serializeDates)(user));
    }
}
exports.SimplePasswordProvider = SimplePasswordProvider;
//# sourceMappingURL=simple-password-provider.js.map