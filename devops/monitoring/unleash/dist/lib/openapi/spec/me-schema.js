"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.meSchema = void 0;
const user_schema_1 = require("./user-schema");
const permission_schema_1 = require("./permission-schema");
const feedback_response_schema_1 = require("./feedback-response-schema");
exports.meSchema = {
    $id: '#/components/schemas/meSchema',
    type: 'object',
    additionalProperties: false,
    required: ['user', 'permissions', 'feedback', 'splash'],
    description: 'Detailed user information',
    properties: {
        user: {
            $ref: '#/components/schemas/userSchema',
        },
        permissions: {
            description: 'User permissions for projects and environments',
            type: 'array',
            items: {
                $ref: '#/components/schemas/permissionSchema',
            },
        },
        feedback: {
            description: 'User feedback information',
            type: 'array',
            items: {
                $ref: '#/components/schemas/feedbackResponseSchema',
            },
        },
        splash: {
            description: 'Splash screen configuration',
            type: 'object',
            additionalProperties: {
                type: 'boolean',
            },
        },
    },
    components: {
        schemas: {
            userSchema: user_schema_1.userSchema,
            permissionSchema: permission_schema_1.permissionSchema,
            feedbackResponseSchema: feedback_response_schema_1.feedbackResponseSchema,
        },
    },
};
//# sourceMappingURL=me-schema.js.map