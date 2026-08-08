"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('updateEnvironmentSchema', () => {
    const data = {
        id: 1,
        name: 'release',
        constraints: [],
        createdAt: '2022-07-25 06:00:00',
        createdBy: 'test',
        description: 'a description',
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/adminSegmentSchema', data)).toBeUndefined();
    expect((0, validate_1.validateSchema)('#/components/schemas/adminSegmentSchema', {
        id: 1,
        name: 'release',
        constraints: [],
        createdAt: '2022-07-25 06:00:00',
    })).toBeUndefined();
    expect((0, validate_1.validateSchema)('#/components/schemas/adminSegmentSchema', {
        id: 1,
        name: 'release',
        constraints: [],
        createdAt: '2022-07-25 06:00:00',
        additional: 'property',
    })).toMatchSnapshot();
    expect((0, validate_1.validateSchema)('#/components/schemas/adminSegmentSchema', {
        id: 1,
        name: 'release',
        constraints: [],
        createdAt: 'wrong-format',
    })).toMatchSnapshot();
    expect((0, validate_1.validateSchema)('#/components/schemas/adminSegmentSchema', {
        name: 'release',
        constraints: [],
    })).toMatchSnapshot();
    expect((0, validate_1.validateSchema)('#/components/schemas/adminSegmentSchema', 'not an object')).toMatchSnapshot();
});
//# sourceMappingURL=admin-segment-schema.test.js.map