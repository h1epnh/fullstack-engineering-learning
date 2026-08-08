"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('strategySchema', () => {
    const data = {
        description: '',
        title: '',
        name: '',
        displayName: '',
        editable: false,
        deprecated: false,
        parameters: [
            {
                name: '',
                type: '',
                description: '',
                required: true,
            },
        ],
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/strategySchema', data)).toBeUndefined();
    // allow null descriptions
    expect((0, validate_1.validateSchema)('#/components/schemas/strategySchema', {
        ...data,
        description: null,
    })).toBeUndefined();
    expect((0, validate_1.validateSchema)('#/components/schemas/strategySchema', {})).toMatchSnapshot();
    const { title, ...noTitle } = { ...data };
    expect((0, validate_1.validateSchema)('#/components/schemas/strategySchema', noTitle)).toBeUndefined();
});
//# sourceMappingURL=strategy-schema.test.js.map