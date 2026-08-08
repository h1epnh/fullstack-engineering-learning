"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('addonsSchema', () => {
    const data = {
        addons: [
            {
                parameters: { someKey: 'some-value' },
                events: ['some-event'],
                enabled: true,
                provider: 'some-name',
                description: null,
                id: 5,
            },
        ],
        providers: [
            {
                name: 'some-name',
                displayName: 'some-display-name',
                documentationUrl: 'some-url',
                description: 'some-description',
                parameters: [
                    {
                        name: 'some-name',
                        displayName: 'some-display-name',
                        type: 'some-type',
                        required: true,
                        sensitive: true,
                    },
                ],
            },
        ],
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/addonsSchema', data)).toBeUndefined();
});
//# sourceMappingURL=addons-schema.test.js.map