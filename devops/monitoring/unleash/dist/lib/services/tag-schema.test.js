"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tag_schema_1 = require("./tag-schema");
test('should require url friendly type if defined', () => {
    const tag = {
        value: 'io`dasd',
        type: 'io`dasd',
    };
    const { error } = tag_schema_1.tagSchema.validate(tag);
    if (error === undefined) {
        fail('Did not receive an expected error');
    }
    expect(error.details[0].message).toEqual('"type" must be URL friendly');
});
//# sourceMappingURL=tag-schema.test.js.map