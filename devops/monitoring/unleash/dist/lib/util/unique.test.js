"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unique_1 = require("./unique");
test('should filter unique objects by key', () => {
    expect((0, unique_1.uniqueByKey)([
        { name: 'name1', value: 'val1' },
        { name: 'name1', value: 'val1' },
        { name: 'name1', value: 'val2' },
        { name: 'name1', value: 'val4' },
        { name: 'name2', value: 'val5' },
    ], 'name')).toStrictEqual([
        { name: 'name1', value: 'val4' },
        { name: 'name2', value: 'val5' },
    ]);
});
//# sourceMappingURL=unique.test.js.map