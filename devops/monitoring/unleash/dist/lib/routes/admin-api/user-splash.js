"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = __importDefault(require("../controller"));
const permissions_1 = require("../../types/permissions");
const create_response_schema_1 = require("../../openapi/util/create-response-schema");
const splash_request_schema_1 = require("../../openapi/spec/splash-request-schema");
const openapi_1 = require("../../openapi");
class UserSplashController extends controller_1.default {
    constructor(config, { userSplashService, openApiService, }) {
        super(config);
        this.logger = config.getLogger('splash-controller.ts');
        this.userSplashService = userSplashService;
        this.openApiService = openApiService;
        this.route({
            method: 'post',
            path: '/:id',
            acceptAnyContentType: true,
            handler: this.updateSplashSettings,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Admin UI'],
                    operationId: 'updateSplashSettings',
                    summary: 'Update splash settings',
                    description: 'This operation updates splash settings for a user, indicating that they have seen a particualar splash screen.',
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('splashResponseSchema'),
                        ...(0, openapi_1.getStandardResponses)(400, 401, 403, 415),
                    },
                }),
            ],
        });
    }
    async updateSplashSettings(req, res) {
        const { user } = req;
        const { id } = req.params;
        const splash = {
            splashId: id,
            userId: user.id,
            seen: true,
        };
        this.openApiService.respondWithValidation(200, res, splash_request_schema_1.splashRequestSchema.$id, await this.userSplashService.updateSplash(splash));
    }
}
module.exports = UserSplashController;
exports.default = UserSplashController;
//# sourceMappingURL=user-splash.js.map