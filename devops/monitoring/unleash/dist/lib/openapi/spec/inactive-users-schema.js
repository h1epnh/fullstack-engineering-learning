"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inactiveUsersSchema = void 0;
const inactive_user_schema_1 = require("./inactive-user-schema");
exports.inactiveUsersSchema = {
    $id: '#/components/schemas/inactiveUsersSchema',
    type: 'object',
    additionalProperties: false,
    description: 'A list of users that has been flagged as inactive',
    required: ['version', 'inactiveUsers'],
    properties: {
        version: {
            description: 'The version of this schema. Used to keep track of compatibility',
            type: 'integer',
            minimum: 1,
            example: 1,
        },
        inactiveUsers: {
            description: 'The list of users that are flagged as inactive',
            type: 'array',
            items: {
                $ref: '#/components/schemas/inactiveUserSchema',
            },
        },
    },
    components: {
        inactiveUserSchema: inactive_user_schema_1.inactiveUserSchema,
    },
};
//# sourceMappingURL=inactive-users-schema.js.map