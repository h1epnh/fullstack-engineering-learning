"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicSignupTokensSchema = void 0;
const user_schema_1 = require("./user-schema");
const role_schema_1 = require("./role-schema");
const public_signup_token_schema_1 = require("./public-signup-token-schema");
exports.publicSignupTokensSchema = {
    $id: '#/components/schemas/publicSignupTokensSchema',
    type: 'object',
    description: 'A wrapper object containing all the public signup tokens',
    additionalProperties: false,
    required: ['tokens'],
    properties: {
        tokens: {
            type: 'array',
            description: 'An array of all the public signup tokens',
            example: [
                {
                    secret: 'a3c84b25409ea8ca1782ef17f94a42fc',
                    url: 'https://my_unleash_instance/new-user?invite=a3c84b25409ea8ca1782ef17f94a42fc',
                    name: 'Invite public viewers',
                    enabled: false,
                    expiresAt: '2023-04-12T11:13:31.960Z',
                    createdAt: '2023-04-12T11:13:31.960Z',
                    createdBy: 'someone',
                    users: null,
                    role: {
                        id: 3,
                        type: 'root',
                        name: 'Viewer',
                    },
                },
            ],
            items: {
                $ref: '#/components/schemas/publicSignupTokenSchema',
            },
        },
    },
    components: {
        schemas: {
            publicSignupTokenSchema: public_signup_token_schema_1.publicSignupTokenSchema,
            userSchema: user_schema_1.userSchema,
            roleSchema: role_schema_1.roleSchema,
        },
    },
};
//# sourceMappingURL=public-signup-tokens-schema.js.map