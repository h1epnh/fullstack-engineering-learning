"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissionSchema = void 0;
exports.permissionSchema = {
    $id: '#/components/schemas/permissionSchema',
    type: 'object',
    additionalProperties: false,
    required: ['permission'],
    description: 'Project and environment permissions',
    properties: {
        permission: {
            description: '[Project](https://docs.getunleash.io/reference/rbac#project-permissions) or [environment](https://docs.getunleash.io/reference/rbac#environment-permissions) permission name',
            type: 'string',
            example: 'UPDATE_FEATURE_STRATEGY',
        },
        project: {
            description: 'The project this permission applies to',
            type: 'string',
            example: 'my-project',
        },
        environment: {
            description: 'The environment this permission applies to',
            type: 'string',
            example: 'development',
        },
    },
    components: {},
};
//# sourceMappingURL=permission-schema.js.map