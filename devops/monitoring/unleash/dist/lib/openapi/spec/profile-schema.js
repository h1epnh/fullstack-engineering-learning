"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileSchema = void 0;
const feature_schema_1 = require("./feature-schema");
const role_schema_1 = require("./role-schema");
exports.profileSchema = {
    $id: '#/components/schemas/profileSchema',
    type: 'object',
    additionalProperties: false,
    description: 'User profile overview',
    required: ['rootRole', 'projects', 'features', 'subscriptions'],
    properties: {
        rootRole: {
            $ref: '#/components/schemas/roleSchema',
        },
        projects: {
            description: 'Which projects this user is a member of',
            type: 'array',
            items: {
                type: 'string',
            },
            example: ['my-projectA', 'my-projectB'],
        },
        subscriptions: {
            description: 'Which email subscriptions this user is subscribed to',
            type: 'array',
            items: {
                type: 'string',
            },
            example: ['productivity-report'],
        },
        features: {
            description: 'Deprecated, always returns empty array',
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureSchema',
            },
            example: [],
        },
    },
    components: {
        schemas: {
            featureSchema: feature_schema_1.featureSchema,
            roleSchema: role_schema_1.roleSchema,
        },
    },
};
//# sourceMappingURL=profile-schema.js.map