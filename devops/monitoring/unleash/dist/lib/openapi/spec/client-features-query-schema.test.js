"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('clientFeatureQuerySchema empty', () => {
    const data = {};
    expect((0, validate_1.validateSchema)('#/components/schemas/clientFeaturesQuerySchema', data)).toBeUndefined();
});
test('clientFeatureQuerySchema all fields', () => {
    const data = {
        tag: [['some-tag', 'some-other-tag']],
        project: ['default'],
        namePrefix: 'some-prefix',
        environment: 'some-env',
        inlineSegmentConstraints: true,
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/clientFeaturesQuerySchema', data)).toBeUndefined();
});
//# sourceMappingURL=client-features-query-schema.test.js.map