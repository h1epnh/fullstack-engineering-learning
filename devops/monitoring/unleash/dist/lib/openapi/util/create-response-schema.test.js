"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const create_response_schema_1 = require("./create-response-schema");
test('createResponseSchema', () => {
    expect((0, create_response_schema_1.createResponseSchema)('schemaName')).toMatchInlineSnapshot(`
        {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/schemaName",
              },
            },
          },
          "description": "schemaName",
        }
    `);
});
test('createResponseSchemaWithDifferentMedia', () => {
    expect((0, create_response_schema_1.createResponseSchemas)('my-schema', {
        'application/json': (0, create_response_schema_1.schemaNamed)('schemaName'),
        'text/css': (0, create_response_schema_1.schemaTyped)('string'),
    })).toMatchInlineSnapshot(`
      {
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/schemaName",
            },
          },
          "text/css": {
            "schema": {
              "type": "string",
            },
          },
        },
        "description": "my-schema",
      }
  `);
});
//# sourceMappingURL=create-response-schema.test.js.map