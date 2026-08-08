"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRequestSchema = void 0;
const createRequestSchema = (schemaName) => {
    return {
        description: schemaName,
        required: true,
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
exports.createRequestSchema = createRequestSchema;
//# sourceMappingURL=create-request-schema.js.map