"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.constraintSchema = exports.constraintSchemaBase = void 0;
const constants_1 = require("../../util/constants");
exports.constraintSchemaBase = {
    type: 'object',
    required: ['contextName', 'operator'],
    description: 'A strategy constraint. For more information, refer to [the strategy constraint reference documentation](https://docs.getunleash.io/reference/activation-strategies#constraints)',
    properties: {
        contextName: {
            description: 'The name of the context field that this constraint should apply to.',
            example: 'appName',
            type: 'string',
        },
        operator: {
            description: 'The operator to use when evaluating this constraint. For more information about the various operators, refer to [the strategy constraint operator documentation](https://docs.getunleash.io/reference/activation-strategies#constraint-operators).',
            type: 'string',
            enum: constants_1.ALL_OPERATORS,
            example: 'IN',
        },
        caseInsensitive: {
            description: 'Whether the operator should be case sensitive or not. Defaults to `false` (being case sensitive).',
            type: 'boolean',
            default: false,
        },
        inverted: {
            description: 'Whether the result should be negated or not. If `true`, will turn a `true` result into a `false` result and vice versa.',
            type: 'boolean',
            default: false,
        },
        values: {
            type: 'array',
            description: 'The context values that should be used for constraint evaluation. Use this property instead of `value` for properties that accept multiple values.',
            items: {
                type: 'string',
            },
            example: ['my-app', 'my-other-app'],
        },
        value: {
            description: 'The context value that should be used for constraint evaluation. Use this property instead of `values` for properties that only accept single values.',
            type: 'string',
            example: 'my-app',
        },
    },
    components: {},
};
exports.constraintSchema = {
    $id: '#/components/schemas/constraintSchema',
    additionalProperties: false,
    ...exports.constraintSchemaBase,
};
//# sourceMappingURL=constraint-schema.js.map