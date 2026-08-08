"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splashResponseSchema = void 0;
const splash_request_schema_1 = require("./splash-request-schema");
exports.splashResponseSchema = {
    ...splash_request_schema_1.splashRequestSchema,
    $id: '#/components/schemas/splashResponseSchema',
    additionalProperties: false,
    description: 'Data related to a user having seen a splash screen.',
    required: [...splash_request_schema_1.splashRequestSchema.required, 'seen'],
    properties: {
        ...splash_request_schema_1.splashRequestSchema.properties,
        seen: {
            type: 'boolean',
            description: 'Indicates whether the user has seen the splash screen or not.',
            example: true,
        },
    },
    components: {},
};
//# sourceMappingURL=splash-response-schema.js.map