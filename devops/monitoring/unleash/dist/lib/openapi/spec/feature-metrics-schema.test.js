"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('featureMetricsSchema', () => {
    const data = {
        maturity: 'stable',
        version: 2,
        data: [
            {
                environment: 'some-env',
                timestamp: new Date(2020, 6, 1, 17, 50, 3).toISOString(),
                yes: 50,
                no: 1,
            },
        ],
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/featureMetricsSchema', data)).toBeUndefined();
});
//# sourceMappingURL=feature-metrics-schema.test.js.map