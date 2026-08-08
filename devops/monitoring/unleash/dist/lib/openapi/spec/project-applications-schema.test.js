"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('projectApplicationsSchema', () => {
    const data = {
        total: 55,
        applications: [
            {
                name: 'my-weba-app',
                environments: ['development', 'production'],
                instances: ['instance-414122'],
                sdks: [
                    {
                        name: 'unleash-client-node',
                        versions: ['4.1.1'],
                    },
                ],
            },
        ],
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/projectApplicationsSchema', data)).toBeUndefined();
});
//# sourceMappingURL=project-applications-schema.test.js.map