"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constraint_types_1 = require("./constraint-types");
const legalValues = [
    { value: '100' },
    { value: '200' },
    { value: '300' },
];
test('semver validation should throw with bad format', () => {
    const badSemver = 'a.b.c';
    expect.assertions(1);
    try {
        (0, constraint_types_1.validateSemver)(badSemver);
    }
    catch (e) {
        expect(e.message).toContain(`the provided value is not a valid semver format. The value provided was: ${badSemver}`);
    }
});
test('semver valdiation should pass with correct format', () => {
    const validSemver = '1.2.3';
    expect.assertions(0);
    try {
        (0, constraint_types_1.validateSemver)(validSemver);
    }
    catch (e) {
        expect(e.message).toContain(`the provided value is not a valid semver format. The value provided was: ${validSemver}`);
    }
});
test('semver validation should fail partial semver', () => {
    const partial = '1.2';
    expect.assertions(1);
    try {
        (0, constraint_types_1.validateSemver)(partial);
    }
    catch (e) {
        expect(e.message).toContain(`the provided value is not a valid semver format. The value provided was: ${partial}`);
    }
});
test('semver validation should fail with leading v', () => {
    const leadingV = 'v1.2.0';
    expect.assertions(1);
    try {
        (0, constraint_types_1.validateSemver)(leadingV);
    }
    catch (e) {
        expect(e.message).toContain(`the provided value is not a valid semver format. The value provided was: ${leadingV}`);
    }
});
/* Legal values tests */
test('should fail validation if value does not exist in single legal value', () => {
    const value = '500';
    expect.assertions(1);
    try {
        (0, constraint_types_1.validateLegalValues)(legalValues, value);
    }
    catch (error) {
        expect(error.message).toContain(`${value} is not specified as a legal value on this context field`);
    }
});
test('should pass validation if value exists in single legal value', () => {
    const value = '100';
    expect.assertions(0);
    try {
        (0, constraint_types_1.validateLegalValues)(legalValues, value);
    }
    catch (error) {
        expect(error.message).toContain(`${value} is not specified as a legal value on this context field`);
    }
});
test('should fail validation if one of the values does not exist in multiple legal values', () => {
    const values = ['500', '100'];
    expect.assertions(1);
    try {
        (0, constraint_types_1.validateLegalValues)(legalValues, values);
    }
    catch (error) {
        expect(error.message).toContain(`input values are not specified as a legal value on this context field`);
    }
});
test('should pass validation if all of the values exists in legal values', () => {
    const values = ['200', '100'];
    expect.assertions(0);
    try {
        (0, constraint_types_1.validateLegalValues)(legalValues, values);
    }
    catch (error) {
        expect(error.message).toContain(`input values are not specified as a legal value on this context field`);
    }
});
//# sourceMappingURL=constraint-types.test.js.map