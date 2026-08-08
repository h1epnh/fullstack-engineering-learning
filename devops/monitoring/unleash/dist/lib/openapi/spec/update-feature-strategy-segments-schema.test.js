"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('updateFeatureStrategySegmentsSchema schema', () => {
    const data = {
        strategyId: '1',
        segmentIds: [1, 2],
        projectId: 'default',
        environmentId: 'default',
        additional: 'property',
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/updateFeatureStrategySegmentsSchema', data)).toBeUndefined();
    expect((0, validate_1.validateSchema)('#/components/schemas/updateFeatureStrategySegmentsSchema', {})).toMatchSnapshot();
    expect((0, validate_1.validateSchema)('#/components/schemas/updateFeatureStrategySegmentsSchema', {
        strategyId: '1',
        segmentIds: [],
    })).toMatchSnapshot();
});
//# sourceMappingURL=update-feature-strategy-segments-schema.test.js.map