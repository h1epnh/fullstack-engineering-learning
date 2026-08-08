"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constraint_value_types_1 = require("./constraint-value-types");
/* Number type */
test('should require number', async () => {
    try {
        await constraint_value_types_1.constraintNumberTypeSchema.validateAsync('test');
    }
    catch (error) {
        expect(error.details[0].message).toEqual('"value" must be a number');
    }
});
test('should allow strings that can be parsed to a number', async () => {
    await constraint_value_types_1.constraintNumberTypeSchema.validateAsync('5');
});
test('should allow floating point numbers', async () => {
    await constraint_value_types_1.constraintNumberTypeSchema.validateAsync(5.72);
});
test('should allow numbers', async () => {
    await constraint_value_types_1.constraintNumberTypeSchema.validateAsync(5);
});
test('should allow negative numbers', async () => {
    await constraint_value_types_1.constraintNumberTypeSchema.validateAsync(-5);
});
/* String types */
test('should require a list of strings', async () => {
    expect.assertions(1);
    try {
        await constraint_value_types_1.constraintStringTypeSchema.validateAsync(['test', 1]);
    }
    catch (error) {
        expect(error.details[0].message).toEqual('"[1]" must be a string');
    }
});
test('should succeed with a list of strings', async () => {
    expect.assertions(0);
    await constraint_value_types_1.constraintStringTypeSchema.validateAsync([
        'test',
        'another-test',
        'supervalue',
    ]);
});
/* Date type */
test('should fail an invalid date', async () => {
    expect.assertions(1);
    const invalidDate = 'Tuesday the awesome day';
    try {
        await constraint_value_types_1.constraintDateTypeSchema.validateAsync(invalidDate);
    }
    catch (error) {
        expect(error.details[0].message).toEqual('"value" must be a valid date');
    }
});
test('Should pass a valid date', async () => {
    expect.assertions(0);
    const invalidDate = '2022-01-29T13:00:00.000Z';
    try {
        await constraint_value_types_1.constraintDateTypeSchema.validateAsync(invalidDate);
    }
    catch (error) {
        expect(error.details[0].message).toEqual('"value" must be a valid date');
    }
});
//# sourceMappingURL=constraint-value-types.test.js.map