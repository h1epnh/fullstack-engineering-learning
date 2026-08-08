"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = __importDefault(require("../controller"));
const permissions_1 = require("../../types/permissions");
const anonymise_1 = require("../../util/anonymise");
const create_request_schema_1 = require("../../openapi/util/create-request-schema");
const create_response_schema_1 = require("../../openapi/util/create-response-schema");
const user_schema_1 = require("../../openapi/spec/user-schema");
const serialize_dates_1 = require("../../types/serialize-dates");
const users_schema_1 = require("../../openapi/spec/users-schema");
const users_search_schema_1 = require("../../openapi/spec/users-search-schema");
const reset_password_schema_1 = require("../../openapi/spec/reset-password-schema");
const standard_responses_1 = require("../../openapi/util/standard-responses");
const users_groups_base_schema_1 = require("../../openapi/spec/users-groups-base-schema");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const date_fns_1 = require("date-fns");
const admin_count_schema_1 = require("../../openapi/spec/admin-count-schema");
const error_1 = require("../../error");
const create_user_response_schema_1 = require("../../openapi/spec/create-user-response-schema");
const openapi_1 = require("../../openapi");
class UserAdminController extends controller_1.default {
    constructor(config, { userService, accountService, accessService, resetTokenService, settingService, openApiService, groupService, }) {
        super(config);
        this.userService = userService;
        this.accountService = accountService;
        this.accessService = accessService;
        this.resetTokenService = resetTokenService;
        this.settingService = settingService;
        this.openApiService = openApiService;
        this.groupService = groupService;
        this.logger = config.getLogger('routes/user-controller.ts');
        this.flagResolver = config.flagResolver;
        this.isEnterprise = config.isEnterprise;
        this.route({
            method: 'post',
            path: '/validate-password',
            handler: this.validateUserPassword,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Users'],
                    operationId: 'validateUserPassword',
                    summary: 'Validate password for a user',
                    description: 'Validate the password strength. Minimum 10 characters, uppercase letter, number, special character.',
                    requestBody: (0, create_request_schema_1.createRequestSchema)('passwordSchema'),
                    responses: {
                        200: standard_responses_1.emptyResponse,
                        ...(0, standard_responses_1.getStandardResponses)(400, 401, 415),
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '/:id/change-password',
            handler: this.changeUserPassword,
            permission: permissions_1.ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Users'],
                    operationId: 'changeUserPassword',
                    summary: 'Change password for a user',
                    description: 'Change password for a user as an admin',
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            schema: {
                                type: 'integer',
                            },
                            description: 'a user id',
                        },
                    ],
                    requestBody: (0, create_request_schema_1.createRequestSchema)('passwordSchema'),
                    responses: {
                        200: standard_responses_1.emptyResponse,
                        ...(0, standard_responses_1.getStandardResponses)(400, 401, 403),
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '/reset-password',
            handler: this.resetUserPassword,
            permission: permissions_1.ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Users'],
                    operationId: 'resetUserPassword',
                    summary: 'Reset user password',
                    description: 'Reset user password as an admin',
                    requestBody: (0, create_request_schema_1.createRequestSchema)('idSchema'),
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('resetPasswordSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(400, 401, 403, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '',
            handler: this.getUsers,
            permission: permissions_1.ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Users'],
                    operationId: 'getUsers',
                    summary: 'Get all users and [root roles](https://docs.getunleash.io/reference/rbac#predefined-roles)',
                    description: 'Will return all users and all available root roles for the Unleash instance.',
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('usersSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(401, 403),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/search',
            handler: this.searchUsers,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Users'],
                    operationId: 'searchUsers',
                    summary: 'Search users',
                    description: ' It will preform a simple search based on name and email matching the given query. Requires minimum 2 characters',
                    parameters: [
                        {
                            name: 'q',
                            description: 'The pattern to search in the username or email',
                            schema: { type: 'string' },
                            in: 'query',
                        },
                    ],
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('usersSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(401),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/access',
            handler: this.getBaseUsersAndGroups,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Users'],
                    operationId: 'getBaseUsersAndGroups',
                    summary: 'Get basic user and group information',
                    description: 'Get a subset of user and group information eligible even for non-admin users',
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('usersGroupsBaseSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(401),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/:id/permissions',
            permission: permissions_1.ADMIN,
            handler: this.getPermissions,
            middleware: [
                openApiService.validPath({
                    tags: ['Unstable'],
                    operationId: 'getUserPermissions',
                    summary: 'Returns the list of permissions for the user',
                    description: 'Gets a list of permissions for a user, additional project and environment can be specified.',
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            schema: {
                                type: 'integer',
                            },
                            description: 'a user id',
                        },
                        {
                            name: 'project',
                            in: 'query',
                            required: false,
                            schema: {
                                type: 'string',
                            },
                        },
                        {
                            name: 'environment',
                            in: 'query',
                            required: false,
                            schema: {
                                type: 'string',
                            },
                        },
                    ],
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)(openapi_1.userAccessOverviewSchema.$id),
                        ...(0, standard_responses_1.getStandardResponses)(401, 403, 415),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/admin-count',
            handler: this.getAdminCount,
            permission: permissions_1.ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Users'],
                    operationId: 'getAdminCount',
                    summary: 'Get total count of admin accounts',
                    description: 'Get a total count of admins with password, without password and admin service accounts',
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('adminCountSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(401, 403),
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '',
            handler: this.createUser,
            permission: permissions_1.ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Users'],
                    operationId: 'createUser',
                    summary: 'Create a new user',
                    description: 'Creates a new user with the given root role.',
                    requestBody: (0, create_request_schema_1.createRequestSchema)('createUserSchema'),
                    responses: {
                        201: (0, create_response_schema_1.resourceCreatedResponseSchema)('createUserResponseSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(400, 401, 403),
                    },
                }),
                (0, express_rate_limit_1.default)({
                    windowMs: (0, date_fns_1.minutesToMilliseconds)(1),
                    max: config.rateLimiting.createUserMaxPerMinute,
                    validate: false,
                    standardHeaders: true,
                    legacyHeaders: false,
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/:id',
            handler: this.getUser,
            permission: permissions_1.ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Users'],
                    operationId: 'getUser',
                    summary: 'Get user',
                    description: 'Will return a single user by id',
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            schema: {
                                type: 'integer',
                            },
                            description: 'a user id',
                        },
                    ],
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('userSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(400, 401, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'put',
            path: '/:id',
            handler: this.updateUser,
            permission: permissions_1.ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Users'],
                    operationId: 'updateUser',
                    summary: 'Update a user',
                    description: 'Only the explicitly specified fields get updated.',
                    requestBody: (0, create_request_schema_1.createRequestSchema)('updateUserSchema'),
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            schema: {
                                type: 'integer',
                            },
                            description: 'a user id',
                        },
                    ],
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('createUserResponseSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(400, 401, 403, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'delete',
            path: '/scim-users',
            acceptAnyContentType: true,
            handler: this.deleteScimUsers,
            permission: permissions_1.ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Users'],
                    operationId: 'deleteScimUsers',
                    summary: 'Delete all SCIM users',
                    description: 'Deletes all users managed by SCIM',
                    responses: {
                        200: standard_responses_1.emptyResponse,
                        ...(0, standard_responses_1.getStandardResponses)(401, 403),
                    },
                }),
            ],
        });
        this.route({
            method: 'delete',
            path: '/:id',
            acceptAnyContentType: true,
            handler: this.deleteUser,
            permission: permissions_1.ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Users'],
                    operationId: 'deleteUser',
                    summary: 'Delete a user',
                    description: 'Deletes the user with the given userId',
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            schema: {
                                type: 'integer',
                            },
                            description: 'a user id',
                        },
                    ],
                    responses: {
                        200: standard_responses_1.emptyResponse,
                        ...(0, standard_responses_1.getStandardResponses)(401, 403, 404),
                    },
                }),
            ],
        });
    }
    async resetUserPassword(req, res) {
        const { user } = req;
        const receiver = req.body.id;
        const receiverUser = await this.userService.getByEmail(receiver);
        await this.throwIfScimUser(receiverUser);
        const resetPasswordUrl = await this.userService.createResetPasswordEmail(receiver, user);
        this.openApiService.respondWithValidation(200, res, reset_password_schema_1.resetPasswordSchema.$id, { resetPasswordUrl: resetPasswordUrl.toString() });
    }
    async getUsers(req, res) {
        const users = await this.userService.getAll();
        const rootRoles = await this.accessService.getRootRoles();
        const inviteLinks = await this.resetTokenService.getActiveInvitations();
        const usersWithInviteLinks = users.map((user) => {
            const inviteLink = inviteLinks[user.id] || '';
            return { ...user, inviteLink };
        });
        this.openApiService.respondWithValidation(200, res, users_schema_1.usersSchema.$id, {
            users: (0, serialize_dates_1.serializeDates)(usersWithInviteLinks),
            rootRoles,
        });
    }
    anonymiseUsers(users) {
        return users.map((u) => ({
            ...u,
            name: (0, anonymise_1.anonymise)(u.name),
            username: (0, anonymise_1.anonymise)(u.username),
            email: (0, anonymise_1.anonymise)(u.email || 'random'),
            imageUrl: 'https://gravatar.com/avatar/21232f297a57a5a743894a0e4a801fc3?size=42&default=retro',
        }));
    }
    async searchUsers(req, res) {
        const { q } = req.query;
        let users = typeof q === 'string' && q.length > 1
            ? await this.userService.search(q)
            : [];
        if (this.flagResolver.isEnabled('anonymiseEventLog')) {
            users = this.anonymiseUsers(users);
        }
        this.openApiService.respondWithValidation(200, res, users_search_schema_1.usersSearchSchema.$id, (0, serialize_dates_1.serializeDates)(users));
    }
    async getBaseUsersAndGroups(req, res) {
        const allUsers = await this.accountService.getAll();
        let users = allUsers.map((u) => {
            return {
                id: u.id,
                name: u.name,
                username: u.username,
                email: u.email,
                accountType: u.accountType,
            };
        });
        if (this.flagResolver.isEnabled('anonymiseEventLog')) {
            users = this.anonymiseUsers(users);
        }
        const allGroups = await this.groupService.getAll();
        const groups = allGroups.map((g) => {
            return {
                id: g.id,
                name: g.name,
                userCount: g.users.length,
                rootRole: g.rootRole,
            };
        });
        this.openApiService.respondWithValidation(200, res, users_groups_base_schema_1.usersGroupsBaseSchema.$id, {
            users: (0, serialize_dates_1.serializeDates)(users),
            groups: (0, serialize_dates_1.serializeDates)(groups),
        });
    }
    async getUser(req, res) {
        const { id } = req.params;
        const user = await this.userService.getUser(id);
        this.openApiService.respondWithValidation(200, res, user_schema_1.userSchema.$id, (0, serialize_dates_1.serializeDates)(user));
    }
    async createUser(req, res) {
        const { username, email, name, rootRole, sendEmail, password } = req.body;
        const normalizedRootRole = Number.isInteger(Number(rootRole))
            ? Number(rootRole)
            : rootRole;
        const createdUser = await this.userService.createUser({
            username,
            email,
            name,
            password,
            rootRole: normalizedRootRole,
        }, req.audit);
        const inviteLink = await this.userService.newUserInviteLink(createdUser, req.audit);
        // send email defaults to true
        const emailSent = (sendEmail !== undefined ? sendEmail : true)
            ? await this.userService.sendWelcomeEmail(createdUser, inviteLink)
            : false;
        const responseData = {
            ...(0, serialize_dates_1.serializeDates)(createdUser),
            inviteLink,
            emailSent,
            rootRole: normalizedRootRole,
        };
        this.openApiService.respondWithValidation(201, res, create_user_response_schema_1.createUserResponseSchema.$id, responseData, { location: `${responseData.id}` });
    }
    async updateUser(req, res) {
        const { user, params, body } = req;
        const { id } = params;
        const { name, email, rootRole } = body;
        await this.throwIfScimUser({ id });
        const normalizedRootRole = Number.isInteger(Number(rootRole))
            ? Number(rootRole)
            : rootRole;
        const updateUser = await this.userService.updateUser({
            id,
            name,
            email,
            rootRole: normalizedRootRole,
        }, req.audit);
        this.openApiService.respondWithValidation(200, res, create_user_response_schema_1.createUserResponseSchema.$id, {
            ...(0, serialize_dates_1.serializeDates)(updateUser),
            rootRole: normalizedRootRole,
        });
    }
    async deleteUser(req, res) {
        const { user, params } = req;
        const { id } = params;
        await this.userService.deleteUser(+id, req.audit);
        res.status(200).send();
    }
    async validateUserPassword(req, res) {
        const { password } = req.body;
        this.userService.validatePassword(password);
        res.status(200).send();
    }
    async changeUserPassword(req, res) {
        const { id } = req.params;
        const { password } = req.body;
        await this.throwIfScimUser({ id });
        await this.userService.changePassword(+id, password);
        res.status(200).send();
    }
    async getAdminCount(req, res) {
        const adminCount = await this.accountService.getAdminCount();
        this.openApiService.respondWithValidation(200, res, admin_count_schema_1.adminCountSchema.$id, adminCount);
    }
    async getPermissions(req, res) {
        const { project, environment } = req.query;
        const user = await this.userService.getUser(req.params.id);
        const rootRole = await this.accessService.getRootRoleForUser(user.id);
        let projectRoles = [];
        if (project) {
            const projectRoleIds = await this.accessService.getProjectRolesForUser(project, user.id);
            projectRoles = await Promise.all(projectRoleIds.map((roleId) => this.accessService.getRole(roleId)));
        }
        const overview = await this.accessService.getAccessOverviewForUser(user, project, environment);
        this.openApiService.respondWithValidation(200, res, openapi_1.userAccessOverviewSchema.$id, {
            overview,
            user: (0, serialize_dates_1.serializeDates)(user),
            rootRole,
            projectRoles,
        });
    }
    async throwIfScimUser({ id, scimId, }) {
        if (!this.isEnterprise)
            return;
        const isScimUser = await this.isScimUser({ id, scimId });
        if (!isScimUser)
            return;
        const { enabled } = await this.settingService.getWithDefault('scim', {
            enabled: false,
        });
        if (!enabled)
            return;
        throw new error_1.ForbiddenError('This user is managed by your SCIM provider and cannot be changed manually');
    }
    async isScimUser({ id, scimId, }) {
        return (Boolean(scimId) ||
            Boolean((await this.userService.getUser(id)).scimId));
    }
    async deleteScimUsers(req, res) {
        const { audit } = req;
        await this.userService.deleteScimUsers(audit);
        res.status(200).send();
    }
}
exports.default = UserAdminController;
//# sourceMappingURL=user-admin.js.map