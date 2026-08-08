"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const create_request_schema_1 = require("./create-request-schema");
test('createRequestSchema', () => {
    expect((0, create_request_schema_1.createRequestSchema)('schemaName')).toMatchInlineSnapshot(`
        {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/schemaName",
              },
            },
          },
          "description": "schemaName",
          "required": true,
        }
    `);
});
//# sourceMappingURL=create-request-schema.test.js.map