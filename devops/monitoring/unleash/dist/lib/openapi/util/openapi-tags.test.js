"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const openapi_tags_1 = require("./openapi-tags");
test('no duplicate tags', () => {
    openapi_tags_1.openApiTags.reduce((acc, tag) => {
        expect(acc).not.toContain(tag.name);
        return [...acc, tag.name];
    }, []);
});
test('The list of OpenAPI tags is sorted', () => {
    const tags = openapi_tags_1.openApiTags.map((tag) => tag.name);
    const sorted = [...tags].sort((a, b) => a.localeCompare(b));
    expect(tags).toStrictEqual(sorted);
});
//# sourceMappingURL=openapi-tags.test.js.map