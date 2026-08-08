"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('contextFieldSchema', () => {
    const data = {
        name: '',
        description: '',
        stickiness: false,
        sortOrder: 0,
        createdAt: '2022-01-01T00:00:00.000Z',
        legalValues: [
            { value: 'a' },
            { value: 'b', description: '' },
            { value: 'c', description: 'd' },
        ],
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/contextFieldSchema', data)).toBeUndefined();
});
test('contextFieldSchema empty', () => {
    expect((0, validate_1.validateSchema)('#/components/schemas/contextFieldSchema', {})).toMatchSnapshot();
});
//# sourceMappingURL=context-field-schema.test.js.map