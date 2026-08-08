"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('projectOverviewSchema', () => {
    const data = {
        name: 'project',
        version: 3,
        featureNaming: {
            description: 'naming description',
            example: 'a',
            pattern: '[aZ]',
        },
        featureTypeCounts: [
            {
                type: 'release',
                count: 1,
            },
        ],
        onboardingStatus: {
            status: 'onboarding-started',
        },
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/projectOverviewSchema', data)).toBeUndefined();
    expect((0, validate_1.validateSchema)('#/components/schemas/projectOverviewSchema', {})).toMatchSnapshot();
});
//# sourceMappingURL=project-overview-schema.test.js.map