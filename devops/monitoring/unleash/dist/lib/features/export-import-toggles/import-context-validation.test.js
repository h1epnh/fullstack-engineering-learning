"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const import_context_validation_1 = require("./import-context-validation");
test('has value context field', () => {
    expect((0, import_context_validation_1.isValidField)({ name: 'contextField', legalValues: [{ value: 'value1' }] }, [{ name: 'contextField', legalValues: [{ value: 'value1' }] }])).toBe(true);
});
test('no matching field value', () => {
    expect((0, import_context_validation_1.isValidField)({ name: 'contextField', legalValues: [{ value: 'value1' }] }, [{ name: 'contextField', legalValues: [{ value: 'value2' }] }])).toBe(false);
});
test('subset field value', () => {
    expect((0, import_context_validation_1.isValidField)({ name: 'contextField', legalValues: [{ value: 'value1' }] }, [
        {
            name: 'contextField',
            legalValues: [{ value: 'value2' }, { value: 'value1' }],
        },
    ])).toBe(true);
});
//# sourceMappingURL=import-context-validation.test.js.map