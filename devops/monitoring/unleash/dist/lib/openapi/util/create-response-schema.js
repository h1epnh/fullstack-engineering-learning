"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resourceCreatedResponseSchema = exports.createCsvResponseSchema = exports.createResponseSchema = exports.schemaTyped = exports.schemaNamed = exports.createResponseSchemas = void 0;
const createResponseSchemas = (description, content) => {
    return {
        description,
        content: content,
    };
};
exports.createResponseSchemas = createResponseSchemas;
const schemaNamed = (schemaName) => {
    return {
        schema: {
            $ref: schemaName.startsWith('#')
                ? schemaName
                : `#/components/schemas/${schemaName}`,
        },
    };
};
exports.schemaNamed = schemaNamed;
const schemaTyped = (type) => {
    return {
        schema: {
            type,
        },
    };
};
exports.schemaTyped = schemaTyped;
const createResponseSchema = (schemaName) => {
    return (0, exports.createResponseSchemas)(schemaName, {
        'application/json': (0, exports.schemaNamed)(schemaName),
    });
};
exports.createResponseSchema = createResponseSchema;
const createCsvResponseSchema = (schemaName, example) => {
    return (0, exports.createResponseSchemas)(schemaName, {
        'text/csv': { example, ...(0, exports.schemaTyped)('string') },
    });
};
exports.createCsvResponseSchema = createCsvResponseSchema;
const resourceCreatedResponseSchema = (schemaName) => {
    return {
        headers: {
            location: {
                description: 'The location of the newly created resource.',
                schema: {
                    type: 'string',
                    format: 'uri',
                },
            },
        },
        description: 'The resource was successfully created.',
        content: {
            'application/json': {
                schema: {
                    $ref: schemaName.startsWith('#')
                        ? schemaName
                        : `#/components/schemas/${schemaName}`,
                },
            },
        },
    };
};
exports.resourceCreatedResponseSchema = resourceCreatedResponseSchema;
//# sourceMappingURL=create-response-schema.js.map