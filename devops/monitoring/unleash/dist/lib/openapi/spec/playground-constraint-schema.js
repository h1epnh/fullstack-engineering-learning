"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.playgroundConstraintSchema = void 0;
const constraint_schema_1 = require("./constraint-schema");
exports.playgroundConstraintSchema = {
    $id: '#/components/schemas/playgroundConstraintSchema',
    additionalProperties: false,
    ...constraint_schema_1.constraintSchemaBase,
    required: [...constraint_schema_1.constraintSchemaBase.required, 'result'],
    properties: {
        ...constraint_schema_1.constraintSchemaBase.properties,
        result: {
            description: 'Whether this was evaluated as true or false.',
            type: 'boolean',
        },
    },
};
//# sourceMappingURL=playground-constraint-schema.js.map