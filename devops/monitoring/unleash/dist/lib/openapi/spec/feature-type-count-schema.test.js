"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('featureTypeCountSchema', () => {
    const data = {
        type: 'release',
        count: 1,
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/featureTypeCountSchema', data)).toBeUndefined();
    expect((0, validate_1.validateSchema)('#/components/schemas/featureTypeCountSchema', {})).toMatchSnapshot();
});
//# sourceMappingURL=feature-type-count-schema.test.js.map