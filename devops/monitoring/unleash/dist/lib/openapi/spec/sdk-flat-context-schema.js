"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sdkFlatContextSchema = void 0;
const sdk_context_schema_1 = require("./sdk-context-schema");
const { properties, ...standardProperties } = sdk_context_schema_1.sdkContextSchema.properties;
exports.sdkFlatContextSchema = {
    $id: '#/components/schemas/sdkFlatContextSchema',
    description: 'The Unleash context with flattened properties',
    type: 'object',
    required: ['appName'],
    additionalProperties: true,
    properties: standardProperties,
    components: {},
};
//# sourceMappingURL=sdk-flat-context-schema.js.map