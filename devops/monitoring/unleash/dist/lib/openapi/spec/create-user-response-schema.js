"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserResponseSchema = void 0;
const user_schema_1 = require("./user-schema");
exports.createUserResponseSchema = {
    $id: '#/components/schemas/createUserResponseSchema',
    type: 'object',
    additionalProperties: false,
    description: 'An Unleash user after creation',
    required: ['id'],
    properties: {
        ...user_schema_1.userSchema.properties,
        rootRole: {
            description: 'Which [root role](https://docs.getunleash.io/reference/rbac#predefined-roles) this user is assigned. Usually a numeric role ID, but can be a string when returning newly created user with an explicit string role.',
            oneOf: [
                {
                    type: 'integer',
                    example: 1,
                    minimum: 0,
                },
                {
                    type: 'string',
                    example: 'Admin',
                    enum: ['Admin', 'Editor', 'Viewer', 'Owner', 'Member'],
                },
            ],
        },
    },
    components: {},
};
//# sourceMappingURL=create-user-response-schema.js.map