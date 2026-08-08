"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectApplicationSdkSchema = void 0;
exports.projectApplicationSdkSchema = {
    $id: '#/components/schemas/projectApplicationSdkSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'versions'],
    description: 'A project application instance SDK.',
    properties: {
        name: {
            type: 'string',
            description: 'Name of the SDK package that the application is using.',
            example: 'unleash-client-node',
        },
        versions: {
            description: 'The versions of the SDK that the application is using.',
            type: 'array',
            items: {
                type: 'string',
            },
            example: ['4.1.1'],
        },
    },
    components: {},
};
//# sourceMappingURL=project-application-sdk-schema.js.map