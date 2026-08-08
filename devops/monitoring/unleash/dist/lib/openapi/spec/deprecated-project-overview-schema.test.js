"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('deprecatedProjectOverviewSchema', () => {
    const data = {
        name: 'project',
        version: 3,
        featureNaming: {
            description: 'naming description',
            example: 'a',
            pattern: '[aZ]',
        },
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/deprecatedProjectOverviewSchema', data)).toBeUndefined();
    expect((0, validate_1.validateSchema)('#/components/schemas/deprecatedProjectOverviewSchema', {})).toMatchSnapshot();
});
//# sourceMappingURL=deprecated-project-overview-schema.test.js.map