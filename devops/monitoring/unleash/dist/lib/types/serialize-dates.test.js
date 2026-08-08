"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const serialize_dates_1 = require("./serialize-dates");
test('serializeDates primitives', () => {
    expect((0, serialize_dates_1.serializeDates)(undefined)).toEqual(undefined);
    expect((0, serialize_dates_1.serializeDates)(null)).toEqual(null);
    expect((0, serialize_dates_1.serializeDates)(1)).toEqual(1);
    expect((0, serialize_dates_1.serializeDates)('a')).toEqual('a');
});
test('serializeDates arrays', () => {
    const now = new Date();
    const iso = now.toISOString();
    expect((0, serialize_dates_1.serializeDates)([])).toEqual([]);
    expect((0, serialize_dates_1.serializeDates)([1])).toEqual([1]);
    expect((0, serialize_dates_1.serializeDates)(['2'])).toEqual(['2']);
    expect((0, serialize_dates_1.serializeDates)([{ a: 1 }])).toEqual([{ a: 1 }]);
    expect((0, serialize_dates_1.serializeDates)([{ a: now }])).toEqual([{ a: iso }]);
});
test('serializeDates object', () => {
    const now = new Date();
    const iso = now.toISOString();
    const obj = {
        a: 1,
        b: '2',
        c: now,
        d: { e: now },
        f: [{ g: now }],
    };
    expect((0, serialize_dates_1.serializeDates)({})).toEqual({});
    expect((0, serialize_dates_1.serializeDates)(obj).a).toEqual(1);
    expect((0, serialize_dates_1.serializeDates)(obj).b).toEqual('2');
    expect((0, serialize_dates_1.serializeDates)(obj).c).toEqual(iso);
    expect((0, serialize_dates_1.serializeDates)(obj).d.e).toEqual(iso);
    expect((0, serialize_dates_1.serializeDates)(obj).f[0].g).toEqual(iso);
});
//# sourceMappingURL=serialize-dates.test.js.map