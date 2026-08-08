"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersSchema = void 0;
const user_schema_1 = require("./user-schema");
const role_schema_1 = require("./role-schema");
exports.usersSchema = {
    $id: '#/components/schemas/usersSchema',
    type: 'object',
    additionalProperties: false,
    description: 'Users and root roles',
    required: ['users'],
    properties: {
        users: {
            type: 'array',
            description: 'A list of users in the Unleash instance.',
            items: {
                $ref: '#/components/schemas/userSchema',
            },
        },
        rootRoles: {
            type: 'array',
            description: 'A list of [root roles](https://docs.getunleash.io/reference/rbac#predefined-roles) in the Unleash instance.',
            items: {
                $ref: '#/components/schemas/roleSchema',
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
//# sourceMappingURL=users-schema.js.map