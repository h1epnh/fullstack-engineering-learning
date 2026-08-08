"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InactiveUsersController = void 0;
const controller_1 = __importDefault(require("../../routes/controller"));
const types_1 = require("../../types");
const openapi_1 = require("../../openapi");
const util_1 = require("../../util");
class InactiveUsersController extends controller_1.default {
    constructor(config, { inactiveUsersService, openApiService, }) {
        super(config);
        this.logger = config.getLogger('user/inactive/inactive-users-controller.ts');
        this.inactiveUsersService = inactiveUsersService;
        this.openApiService = openApiService;
        this.flagResolver = config.flagResolver;
        this.userInactivityThresholdInDays =
            config.userInactivityThresholdInDays;
        this.route({
            method: 'get',
            path: '',
            handler: this.getInactiveUsers,
            permission: types_1.ADMIN,
            middleware: [
                openApiService.validPath({
                    operationId: 'getInactiveUsers',
                    summary: 'Gets inactive users',
                    description: `Gets all inactive users. An inactive user is a user that has not logged in in the last ${this.userInactivityThresholdInDays} days`,
                    tags: ['Users'],
                    responses: {
                        200: (0, openapi_1.createResponseSchema)('inactiveUsersSchema'),
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '/delete',
            handler: this.deleteInactiveUsers,
            permission: types_1.ADMIN,
            middleware: [
                openApiService.validPath({
                    operationId: 'deleteInactiveUsers',
                    summary: 'Deletes inactive users',
                    description: `Deletes all inactive users. An inactive user is a user that has not logged in in the last ${this.userInactivityThresholdInDays} days`,
                    tags: ['Users'],
                    requestBody: (0, openapi_1.createRequestSchema)('idsSchema'),
                    responses: {
                        200: openapi_1.emptyResponse,
                        ...(0, openapi_1.getStandardResponses)(400, 401, 403),
                    },
                }),
            ],
        });
    }
    async getInactiveUsers(_req, res) {
        this.logger.info('Hitting inactive users');
        let inactiveUsers = await this.inactiveUsersService.getInactiveUsers();
        if (this.flagResolver.isEnabled('anonymiseEventLog')) {
            inactiveUsers = this.anonymiseUsers(inactiveUsers);
        }
        this.openApiService.respondWithValidation(200, res, openapi_1.inactiveUsersSchema.$id, { version: 1, inactiveUsers });
    }
    anonymiseUsers(users) {
        return users.map((u) => ({
            ...u,
            name: (0, util_1.anonymise)(u.name || ''),
            username: (0, util_1.anonymise)(u.username || ''),
            email: (0, util_1.anonymise)(u.email || 'random'),
            imageUrl: 'https://gravatar.com/avatar/21232f297a57a5a743894a0e4a801fc3?size=42&default=retro',
        }));
    }
    async deleteInactiveUsers(req, res) {
        await this.inactiveUsersService.deleteInactiveUsers(req.audit, req.body.ids.filter((inactiveUser) => inactiveUser !== req.user.id));
        res.status(200).send();
    }
}
exports.InactiveUsersController = InactiveUsersController;
//# sourceMappingURL=inactive-users-controller.js.map