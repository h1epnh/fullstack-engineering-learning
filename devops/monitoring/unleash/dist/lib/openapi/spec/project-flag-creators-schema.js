"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectFlagCreatorsSchema = void 0;
exports.projectFlagCreatorsSchema = {
    $id: '#/components/schemas/projectFlagCreatorsSchema',
    type: 'array',
    description: 'A list of project flag creators',
    items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'name'],
        properties: {
            id: {
                type: 'integer',
                example: 50,
                description: 'The user id.',
            },
            name: {
                description: "Name of the user. If the user has no set name, the API falls back to using the user's username (if they have one) or email (if neither name or username is set).",
                type: 'string',
                example: 'User',
            },
        },
    },
    components: {
        schemas: {},
    },
};
//# sourceMappingURL=project-flag-creators-schema.js.map