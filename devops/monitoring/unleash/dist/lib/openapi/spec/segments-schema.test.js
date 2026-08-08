"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('updateEnvironmentSchema', () => {
    const data = {
        segments: [],
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/segmentsSchema', data)).toBeUndefined();
    expect((0, validate_1.validateSchema)('#/components/schemas/segmentsSchema', {
        segments: [],
        additional: 'property',
    })).toBeUndefined();
    expect((0, validate_1.validateSchema)('#/components/schemas/segmentsSchema', {})).toMatchSnapshot();
    expect((0, validate_1.validateSchema)('#/components/schemas/segmentsSchema', 'not an object')).toMatchSnapshot();
});
//# sourceMappingURL=segments-schema.test.js.map