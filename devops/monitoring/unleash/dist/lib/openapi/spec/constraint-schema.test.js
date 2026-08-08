"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('constraintSchema', () => {
    const data = {
        contextName: 'a',
        operator: 'NUM_LTE',
        value: '1',
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/constraintSchema', data)).toBeUndefined();
});
test('constraintSchema invalid value type', () => {
    expect((0, validate_1.validateSchema)('#/components/schemas/constraintSchema', {
        contextName: 'a',
        operator: 'NUM_LTE',
        value: 1,
    })).toMatchSnapshot();
});
test('constraintSchema invalid operator name', () => {
    expect((0, validate_1.validateSchema)('#/components/schemas/constraintSchema', {
        contextName: 'a',
        operator: 'b',
        value: '1',
    })).toMatchSnapshot();
});
//# sourceMappingURL=constraint-schema.test.js.map