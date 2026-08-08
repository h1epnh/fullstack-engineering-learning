"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snakeCase_1 = require("./snakeCase");
test('should return snake case from camelCase', () => {
    const resultOne = (0, snakeCase_1.snakeCase)('camelCase');
    const resultTwo = (0, snakeCase_1.snakeCase)('SnaejKase');
    expect(resultOne).toBe('camel_case');
    expect(resultTwo).toBe('snaej_kase');
});
test('should return object with snake case keys', () => {
    const input = {
        sortOrder: 1,
        type: 'production',
        displayName: 'dev',
        enabled: true,
    };
    const output = (0, snakeCase_1.snakeCaseKeys)(input);
    expect(output.sort_order).toBe(1);
    expect(output.type).toBe('production');
    expect(output.display_name).toBe('dev');
    expect(output.enabled).toBe(true);
});
//# sourceMappingURL=snakeCase.test.js.map