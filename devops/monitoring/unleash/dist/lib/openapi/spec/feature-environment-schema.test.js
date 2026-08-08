"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('featureEnvironmentSchema', () => {
    const data = {
        name: '',
        enabled: true,
        strategies: [
            {
                id: '',
                name: '',
                constraints: [{ contextName: '', operator: 'IN' }],
                parameters: { a: '' },
            },
        ],
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/featureEnvironmentSchema', data)).toBeUndefined();
});
test('featureEnvironmentSchema empty', () => {
    expect((0, validate_1.validateSchema)('#/components/schemas/featureEnvironmentSchema', {})).toMatchSnapshot();
});
//# sourceMappingURL=feature-environment-schema.test.js.map