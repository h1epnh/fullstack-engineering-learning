"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('exportQuerySchema', () => {
    const data = {
        environment: 'production',
        features: ['firstFeature', 'secondFeature'],
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/exportQuerySchema', data)).toBeUndefined();
});
//# sourceMappingURL=export-query-schema.test.js.map