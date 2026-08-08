"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersGroupsBaseSchema = void 0;
const group_schema_1 = require("./group-schema");
const user_schema_1 = require("./user-schema");
const group_user_model_schema_1 = require("./group-user-model-schema");
exports.usersGroupsBaseSchema = {
    $id: '#/components/schemas/usersGroupsBaseSchema',
    type: 'object',
    additionalProperties: false,
    description: 'An overview of user groups and users.',
    properties: {
        groups: {
            type: 'array',
            description: 'A list of user groups and their configuration.',
            items: {
                $ref: '#/components/schemas/groupSchema',
            },
            example: [
                {
                    id: 1,
                    name: 'unleash-e2e-7095756699593281',
                    userCount: 1,
                    rootRole: null,
                },
            ],
        },
        users: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/userSchema',
            },
            description: 'A list of users.',
            example: [
                {
                    id: 4,
                    name: 'unleash-e2e-user2-7095756699593281',
                    email: 'unleash-e2e-user2-7095756699593281@test.com',
                    accountType: 'User',
                },
                {
                    id: 1,
                    username: 'admin',
                    accountType: 'User',
                },
            ],
        },
    },
    components: {
        schemas: {
            groupSchema: group_schema_1.groupSchema,
            groupUserModelSchema: group_user_model_schema_1.groupUserModelSchema,
            userSchema: user_schema_1.userSchema,
        },
    },
};
//# sourceMappingURL=users-groups-base-schema.js.map