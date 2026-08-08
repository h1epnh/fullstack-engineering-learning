"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersSearchSchema = void 0;
const user_schema_1 = require("./user-schema");
exports.usersSearchSchema = {
    $id: '#/components/schemas/usersSearchSchema',
    type: 'array',
    description: 'A list of users',
    items: {
        $ref: '#/components/schemas/userSchema',
    },
    components: {
        schemas: {
            userSchema: user_schema_1.userSchema,
        },
    },
};
//# sourceMappingURL=users-search-schema.js.map