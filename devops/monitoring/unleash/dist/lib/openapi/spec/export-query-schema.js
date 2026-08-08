"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportQuerySchema = void 0;
const commonProps = {
    environment: {
        type: 'string',
        example: 'development',
        description: 'The environment to export from',
    },
    downloadFile: {
        type: 'boolean',
        example: true,
        description: 'Whether to return a downloadable file',
    },
};
exports.exportQuerySchema = {
    $id: '#/components/schemas/exportQuerySchema',
    type: 'object',
    description: 'Available query parameters for  the [deprecated export/import](https://docs.getunleash.io/reference/deploy/import-export) functionality.',
    anyOf: [
        {
            required: ['environment', 'features'],
            properties: {
                ...commonProps,
                features: {
                    type: 'array',
                    example: ['MyAwesomeFeature'],
                    items: {
                        type: 'string',
                        minLength: 1,
                    },
                    description: 'Selects features to export by name. If the list is empty all features are returned.',
                },
            },
        },
        {
            required: ['environment', 'tag'],
            properties: {
                ...commonProps,
                tag: {
                    type: 'string',
                    example: 'release',
                    description: 'Selects features to export by tag.',
                },
            },
        },
        {
            required: ['environment', 'project'],
            properties: {
                ...commonProps,
                project: {
                    type: 'string',
                    example: 'my-project',
                    description: 'Selects project to export the features from. Used when no tags or features are provided.',
                },
            },
        },
    ],
    components: {
        schemas: {},
    },
};
//# sourceMappingURL=export-query-schema.js.map