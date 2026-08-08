import type { FromSchema } from 'json-schema-to-ts';
export declare const createGroupSchema: {
    readonly $id: "#/components/schemas/createGroupSchema";
    readonly type: "object";
    readonly required: readonly ["name"];
    readonly description: "A detailed information about a user group";
    readonly properties: {
        readonly name: {
            readonly description: "The name of the group";
            readonly type: "string";
            readonly example: "DX team";
        };
        readonly description: {
            readonly description: "A custom description of the group";
            readonly type: "string";
            readonly nullable: true;
            readonly example: "Current members of the DX squad";
        };
        readonly mappingsSSO: {
            readonly description: "A list of SSO groups that should map to this Unleash group";
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
            readonly example: readonly ["SSOGroup1", "SSOGroup2"];
        };
        readonly rootRole: {
            readonly type: "number";
            readonly nullable: true;
            readonly description: "A role id that is used as the root role for all users in this group. This can be either the id of the Viewer, Editor or Admin role.";
            readonly example: 1;
        };
        readonly users: {
            readonly type: "array";
            readonly description: "A list of users belonging to this group";
            readonly items: {
                readonly type: "object";
                readonly description: "A minimal user object";
                readonly required: readonly ["user"];
                readonly properties: {
                    readonly user: {
                        readonly type: "object";
                        readonly description: "A minimal user object";
                        readonly required: readonly ["id"];
                        readonly properties: {
                            readonly id: {
                                readonly description: "The user id";
                                readonly type: "integer";
                                readonly minimum: 0;
                                readonly example: 123;
                            };
                        };
                    };
                };
            };
        };
    };
    readonly components: {};
};
export type CreateGroupSchema = FromSchema<typeof createGroupSchema>;
//# sourceMappingURL=create-group-schema.d.ts.map