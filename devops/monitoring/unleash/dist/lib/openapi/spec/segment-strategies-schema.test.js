"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('segmentStrategiesSchema', () => {
    const validExamples = [
        { strategies: [] },
        {
            strategies: [
                {
                    id: 'test',
                    projectId: '2',
                    featureName: 'featureName',
                    strategyName: 'strategyName',
                    environment: 'environment',
                },
            ],
        },
    ];
    validExamples.forEach((obj) => {
        expect((0, validate_1.validateSchema)('#/components/schemas/segmentStrategiesSchema', obj)).toBeUndefined();
    });
    const invalidExamples = [
        'not an object',
        {},
        { notStrategies: [] },
        {
            strategies: [
                {
                    featureName: 'featureName',
                    strategyName: 'strategyName',
                    environment: 'environment',
                },
            ],
        },
    ];
    invalidExamples.forEach((obj) => {
        expect((0, validate_1.validateSchema)('#/components/schemas/segmentStrategiesSchema', obj)).toMatchSnapshot();
    });
});
//# sourceMappingURL=segment-strategies-schema.test.js.map