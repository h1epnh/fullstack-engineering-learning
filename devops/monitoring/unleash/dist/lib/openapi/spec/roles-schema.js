"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rolesSchema = void 0;
const role_schema_1 = require("./role-schema");
exports.rolesSchema = {
    $id: '#/components/schemas/rolesSchema',
    type: 'object',
    description: 'A list of roles',
    additionalProperties: false,
    required: ['version', 'roles'],
    properties: {
        version: {
            type: 'integer',
            description: 'The version of the role schema used',
            minimum: 1,
            example: 1,
        },
        roles: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/roleSchema',
            },
            description: 'A list of roles',
        },
    },
    components: {
        schemas: {
            roleSchema: role_schema_1.roleSchema,
        },
    },
};
//# sourceMappingURL=roles-schema.js.map