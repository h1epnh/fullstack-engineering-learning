"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('sortOrderSchema', () => {
    const data = {
        a: 1,
        b: 2,
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/sortOrderSchema', data)).toBeUndefined();
});
test('sortOrderSchema invalid value type', () => {
    expect((0, validate_1.validateSchema)('#/components/schemas/sortOrderSchema', { a: '1' })).toMatchSnapshot();
});
//# sourceMappingURL=sort-order-schema.test.js.map