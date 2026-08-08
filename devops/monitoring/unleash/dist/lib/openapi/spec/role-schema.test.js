"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('roleSchema', () => {
    const data = {
        id: 1,
        description: '',
        name: '',
        type: '',
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/roleSchema', data)).toBeUndefined();
    expect((0, validate_1.validateSchema)('#/components/schemas/roleSchema', {})).toMatchSnapshot();
});
//# sourceMappingURL=role-schema.test.js.map