"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGroupSchema = void 0;
const group_schema_1 = require("./group-schema");
exports.createGroupSchema = {
    $id: '#/components/schemas/createGroupSchema',
    type: 'object',
    required: ['name'],
    description: 'A detailed information about a user group',
    properties: {
        name: group_schema_1.groupSchema.properties.name,
        description: group_schema_1.groupSchema.properties.description,
        mappingsSSO: group_schema_1.groupSchema.properties.mappingsSSO,
        rootRole: group_schema_1.groupSchema.properties.rootRole,
        users: {
            type: 'array',
            description: 'A list of users belonging to this group',
            items: {
                type: 'object',
                description: 'A minimal user object',
                required: ['user'],
                properties: {
                    user: {
                        type: 'object',
                        description: 'A minimal user object',
                        required: ['id'],
                        properties: {
                            id: {
                                description: 'The user id',
                                type: 'integer',
                                minimum: 0,
                                example: 123,
                            },
                        },
                    },
                },
            },
        },
    },
    components: {},
};
//# sourceMappingURL=create-group-schema.js.map