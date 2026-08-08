"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('featureUsageSchema', () => {
    const data = {
        featureName: 'some-name',
        version: 2,
        lastHourUsage: [
            {
                environment: 'some-env',
                yes: 50,
                no: 32,
                timestamp: new Date(2020, 6, 1, 17, 50, 3).toISOString(),
            },
        ],
        maturity: 'stable',
        seenApplications: [],
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/featureUsageSchema', data)).toBeUndefined();
});
//# sourceMappingURL=feature-usage-schema.test.js.map