"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('projectSchema', () => {
    const data = {
        name: 'Default',
        id: 'default',
        description: 'Default project',
        health: 74,
        featureCount: 10,
        memberCount: 3,
        updatedAt: '2022-06-28T17:33:53.963Z',
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/projectSchema', {})).not.toBeUndefined();
    expect((0, validate_1.validateSchema)('#/components/schemas/projectSchema', data)).toBeUndefined();
});
test('projectSchema with only required', () => {
    const data = {
        name: 'Default',
        id: 'default',
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/projectSchema', {})).not.toBeUndefined();
    expect((0, validate_1.validateSchema)('#/components/schemas/projectSchema', data)).toBeUndefined();
});
//# sourceMappingURL=project-schema.test.js.map