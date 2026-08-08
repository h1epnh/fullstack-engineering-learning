"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('setStrategySortOrderSchema', () => {
    const data = [
        { id: 'strategy-1', sortOrder: 1 },
        { id: 'strategy-2', sortOrder: 2 },
        { id: 'strategy-3', sortOrder: 3 },
    ];
    expect((0, validate_1.validateSchema)('#/components/schemas/setStrategySortOrderSchema', data)).toBeUndefined();
});
test('setStrategySortOrderSchema missing sortOrder', () => {
    expect((0, validate_1.validateSchema)('#/components/schemas/setStrategySortOrderSchema', [
        { id: 'strategy-1' },
    ])).toMatchSnapshot();
});
test('setStrategySortOrderSchema missing id', () => {
    expect((0, validate_1.validateSchema)('#/components/schemas/setStrategySortOrderSchema', [
        { sortOrder: 123 },
        { sortOrder: 7 },
    ])).toMatchSnapshot();
});
test('setStrategySortOrderSchema wrong sortOrder type', () => {
    expect((0, validate_1.validateSchema)('#/components/schemas/setStrategySortOrderSchema', [
        { id: 'strategy-1', sortOrder: 'test' },
    ])).toMatchSnapshot();
});
test('setStrategySortOrderSchema no additional parameters', () => {
    expect((0, validate_1.validateSchema)('#/components/schemas/setStrategySortOrderSchema', [
        { id: 'strategy-1', sortOrder: 1 },
        { id: 'strategy-2', sortOrder: 2, extra: 'test' },
        { id: 'strategy-3', sortOrder: 3 },
    ])).toMatchSnapshot();
});
//# sourceMappingURL=set-strategy-sort-order-schema.test.js.map