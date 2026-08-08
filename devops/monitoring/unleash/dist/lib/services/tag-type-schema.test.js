"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tag_type_schema_1 = require("./tag-type-schema");
test('should require a URLFriendly name but allow empty description and icon', () => {
    const simpleTagType = {
        name: 'io with space',
    };
    const { error } = tag_type_schema_1.tagTypeSchema.validate(simpleTagType);
    expect(error.details[0].message).toEqual('"name" must be URL friendly');
});
test('should require a stringy description and icon', () => {
    const tagType = {
        name: 'url-safe',
        description: 515,
        icon: 123,
    };
    const { error } = tag_type_schema_1.tagTypeSchema.validate(tagType);
    expect(error.details[0].message).toEqual('"description" must be a string');
    expect(error.details[1].message).toEqual('"icon" must be a string');
});
test('Should validate if all requirements are fulfilled', () => {
    const validTagType = {
        name: 'url-safe',
        description: 'some string',
        icon: '#',
    };
    const { error } = tag_type_schema_1.tagTypeSchema.validate(validTagType);
    expect(error).toBe(undefined);
});
//# sourceMappingURL=tag-type-schema.test.js.map