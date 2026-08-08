"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('uiConfigSchema', () => {
    const data = {
        slogan: 'a',
        version: 'a',
        unleashUrl: 'a',
        baseUriPath: 'a',
        environment: 'a',
        disablePasswordAuth: false,
        segmentValuesLimit: 0,
        strategySegmentsLimit: 0,
        versionInfo: {
            current: {},
            latest: {},
            isLatest: true,
            instanceId: 'a',
        },
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/uiConfigSchema', data)).toBeUndefined();
});
//# sourceMappingURL=ui-config-schema.test.js.map