"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('clientFeaturesDeltaSchema all fields', () => {
    const data = {
        events: [
            {
                eventId: 1,
                type: 'feature-removed',
                featureName: 'removed-event',
                project: 'default',
            },
            {
                eventId: 1,
                type: 'feature-updated',
                feature: {
                    impressionData: false,
                    enabled: false,
                    name: 'base_feature',
                    description: null,
                    project: 'default',
                    stale: false,
                    type: 'release',
                    variants: [],
                    strategies: [],
                },
            },
            {
                eventId: 1,
                type: 'segment-removed',
                segmentId: 33,
            },
            {
                eventId: 1,
                type: 'segment-updated',
                segment: {
                    id: 3,
                    name: 'hello',
                    constraints: [],
                },
            },
        ],
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/clientFeaturesDeltaSchema', data)).toBeUndefined();
});
//# sourceMappingURL=client-features-delta-schema.test.js.map