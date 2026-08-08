"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('eventsSchema', () => {
    const data = {
        version: 1,
        events: [
            {
                id: 899,
                type: 'feature-created',
                createdBy: 'user@company.com',
                createdAt: '2022-05-31T13:32:20.560Z',
                data: {
                    name: 'new-feature',
                    description: 'Toggle description',
                    type: 'release',
                    project: 'my-project',
                    stale: false,
                    variants: [],
                    createdAt: '2022-05-31T13:32:20.547Z',
                    lastSeenAt: null,
                    impressionData: true,
                },
                preData: null,
                tags: [],
                featureName: 'new-feature',
                project: 'my-project',
                environment: null,
            },
        ],
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/eventsSchema', data)).toBeUndefined();
});
test('eventsSchema types', () => {
    const data = {
        version: 1,
        events: [
            {
                // @ts-expect-error
                id: '1',
                type: 'feature-created',
                createdBy: 'user@company.com',
                createdAt: '2022-05-31T13:32:20.560Z',
                data: {
                    name: 'new-feature',
                    description: 'Toggle description',
                    type: 'release',
                    project: 'my-project',
                    stale: false,
                    variants: [],
                    createdAt: '2022-05-31T13:32:20.547Z',
                    lastSeenAt: null,
                    impressionData: true,
                },
                preData: null,
                tags: [
                    {
                        type: '',
                        // @ts-expect-error
                        value: 1,
                    },
                ],
                featureName: 'new-feature',
                project: 'my-project',
                environment: null,
            },
        ],
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/eventsSchema', data)).not.toBeUndefined();
});
//# sourceMappingURL=events-schema.test.js.map