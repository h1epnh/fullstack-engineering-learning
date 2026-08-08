"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAccessOverviewSchema = void 0;
const user_schema_1 = require("./user-schema");
const role_schema_1 = require("./role-schema");
const permission = {
    type: 'object',
    required: ['id', 'name', 'displayName', 'type'],
    additionalProperties: false,
    properties: {
        id: {
            type: 'integer',
            description: 'The ID of the permission',
            example: 1,
        },
        name: {
            type: 'string',
            description: 'The name of the permission',
            example: 'CREATE_FEATURE_STRATEGY',
        },
        displayName: {
            type: 'string',
            description: 'The display name of the permission',
            example: 'Create activation strategies',
        },
        type: {
            type: 'string',
            description: 'The type of the permission',
            example: 'environment',
        },
        environment: {
            type: 'string',
            nullable: true,
            description: 'The environment that the permission applies to',
            example: 'dev',
        },
    },
};
const permissionWithHasPermission = {
    ...permission,
    required: [...permission.required, 'hasPermission'],
    properties: {
        ...permission.properties,
        hasPermission: {
            type: 'boolean',
            description: 'Whether the user has this permission',
            example: true,
        },
    },
};
exports.userAccessOverviewSchema = {
    $id: '#/components/schemas/userAccessOverviewSchema',
    type: 'object',
    required: ['overview', 'user', 'rootRole', 'projectRoles'],
    additionalProperties: false,
    description: 'Describes the access overview (list of permissions and metadata) for a user.',
    properties: {
        overview: {
            type: 'object',
            required: ['root', 'project', 'environment'],
            additionalProperties: false,
            description: 'The access overview (list of permissions) for the user',
            properties: {
                root: {
                    type: 'array',
                    description: 'The list of root permissions',
                    items: permissionWithHasPermission,
                },
                project: {
                    type: 'array',
                    description: 'The list of project permissions',
                    items: permissionWithHasPermission,
                },
                environment: {
                    type: 'array',
                    description: 'The list of environment permissions',
                    items: permissionWithHasPermission,
                },
            },
        },
        user: {
            description: 'The user that this access overview is for',
            $ref: user_schema_1.userSchema.$id,
        },
        rootRole: {
            description: 'The name of the root role that this user has',
            $ref: role_schema_1.roleSchema.$id,
        },
        projectRoles: {
            type: 'array',
            description: 'The list of project roles that this user has in the selected project',
            items: {
                type: 'object',
                required: [...role_schema_1.roleSchema.required, 'permissions'],
                additionalProperties: false,
                properties: {
                    ...role_schema_1.roleSchema.properties,
                    permissions: {
                        type: 'array',
                        description: 'The permissions that this role has',
                        items: permission,
                    },
                },
            },
        },
    },
    components: {
        schemas: {
            userSchema: user_schema_1.userSchema,
            roleSchema: role_schema_1.roleSchema,
        },
    },
};
//# sourceMappingURL=user-access-overview-schema.js.map