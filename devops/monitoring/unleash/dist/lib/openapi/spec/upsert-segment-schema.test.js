"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('upsertSegmentSchema', () => {
    const validObjects = [
        {
            name: 'segment',
            constraints: [],
        },
        {
            name: 'segment',
            description: 'description',
            constraints: [],
        },
        {
            name: 'segment',
            description: 'description',
            constraints: [],
            additional: 'property',
        },
    ];
    validObjects.forEach((obj) => expect((0, validate_1.validateSchema)('#/components/schemas/upsertSegmentSchema', obj)).toBeUndefined());
    const invalidObjects = [
        {
            name: 'segment',
        },
        {
            description: 'description',
            constraints: [],
        },
        {},
    ];
    invalidObjects.forEach((obj) => expect((0, validate_1.validateSchema)('#/components/schemas/upsertSegmentSchema', obj)).toMatchSnapshot());
});
//# sourceMappingURL=upsert-segment-schema.test.js.map