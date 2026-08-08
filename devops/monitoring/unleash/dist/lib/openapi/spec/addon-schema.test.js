"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('addonSchema', () => {
    const data = {
        provider: 'some-provider',
        enabled: true,
        description: null,
        id: 5,
        parameters: {
            someKey: 'some-value',
        },
        events: ['some-event'],
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/addonSchema', data)).toBeUndefined();
});
//# sourceMappingURL=addon-schema.test.js.map