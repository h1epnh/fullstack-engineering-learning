"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupsSchema = void 0;
const group_schema_1 = require("./group-schema");
const group_user_model_schema_1 = require("./group-user-model-schema");
const user_schema_1 = require("./user-schema");
exports.groupsSchema = {
    $id: '#/components/schemas/groupsSchema',
    type: 'object',
    additionalProperties: false,
    description: 'A list of [user groups](https://docs.getunleash.io/reference/rbac#user-groups)',
    properties: {
        groups: {
            description: 'A list of groups',
            type: 'array',
            items: {
                $ref: '#/components/schemas/groupSchema',
            },
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
//# sourceMappingURL=groups-schema.js.map