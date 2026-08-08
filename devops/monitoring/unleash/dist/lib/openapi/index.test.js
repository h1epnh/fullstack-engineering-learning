"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
test('all schema files should be added to the schemas object', () => {
    const schemaFileNames = fs_1.default
        .readdirSync(path_1.default.join(__dirname, 'spec'))
        .filter((fileName) => fileName.endsWith('-schema.ts'));
    const expectedSchemaNames = schemaFileNames.map((fileName) => {
        return fileName
            .replace(/\.ts$/, '')
            .replace(/-./g, (x) => x[1].toUpperCase());
    });
    const addedSchemaNames = Object.keys(index_1.schemas);
    expect(expectedSchemaNames.sort()).toEqual(addedSchemaNames.sort());
});
test('removeJsonSchemaProps', () => {
    expect((0, index_1.removeJsonSchemaProps)({ a: 'b', $id: 'c', components: {} })).toMatchInlineSnapshot(`
        {
          "a": "b",
        }
    `);
});
describe('createOpenApiSchema', () => {
    test('if no baseurl do not return servers', () => {
        expect((0, index_1.createOpenApiSchema)({
            unleashUrl: 'https://example.com',
            baseUriPath: '',
        }).servers).toEqual([]);
    });
    test('if baseurl is set leave it in serverUrl', () => {
        expect((0, index_1.createOpenApiSchema)({
            unleashUrl: 'https://example.com/demo2',
            baseUriPath: '/demo2',
        }).servers?.[0].url).toEqual('https://example.com/demo2');
    });
    test('if baseurl does not start with /, cowardly refuses to strip', () => {
        expect((0, index_1.createOpenApiSchema)({
            unleashUrl: 'https://example.com/demo2',
            baseUriPath: 'example',
        }).servers?.[0].url).toEqual('https://example.com/demo2');
    });
    test('avoids double trailing slash', () => {
        expect((0, index_1.createOpenApiSchema)({
            unleashUrl: 'https://example.com/example/',
            baseUriPath: 'example',
        }).servers?.[0].url).toEqual('https://example.com');
        expect((0, index_1.createOpenApiSchema)({
            unleashUrl: 'https://example.com/example/',
            baseUriPath: '/example',
        }).servers?.[0].url).toEqual('https://example.com/example');
    });
});
//# sourceMappingURL=index.test.js.map