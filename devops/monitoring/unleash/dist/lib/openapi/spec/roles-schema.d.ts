import type { FromSchema } from 'json-schema-to-ts';
export declare const rolesSchema: {
    readonly $id: "#/components/schemas/rolesSchema";
    readonly type: "object";
    readonly description: "A list of roles";
    readonly additionalProperties: false;
    readonly required: readonly ["version", "roles"];
    readonly properties: {
        readonly version: {
            readonly type: "integer";
            readonly description: "The version of the role schema used";
            readonly minimum: 1;
            readonly example: 1;
        };
        readonly roles: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/components/schemas/roleSchema";
            };
            readonly description: "A list of roles";
        };
    };
    readonly components: {
        readonly schemas: {
            readonly roleSchema: {
                readonly $id: "#/components/schemas/roleSchema";
                readonly type: "object";
                readonly description: "A role holds permissions to allow Unleash to decide what actions a role holder is allowed to perform";
                readonly additionalProperties: false;
                readonly required: readonly ["id", "type", "name"];
                readonly properties: {
                    readonly id: {
                        readonly type: "integer";
                        readonly description: "The role id";
                        readonly example: 9;
                        readonly minimum: 0;
                    };
                    readonly type: {
                        readonly description: "A role can either be a global root role (applies to all projects) or a project role";
                        readonly type: "string";
                        readonly example: "root";
                    };
                    readonly name: {
                        readonly description: "The name of the role";
                        readonly type: "string";
                        readonly example: "Editor";
                    };
                    readonly description: {
                        readonly description: "A more detailed description of the role and what use it's intended for";
                        readonly type: "string";
                        readonly example: "Users with the editor role have access to most features in Unleash but can not manage users and roles in the global scope. Editors will be added as project owners when creating projects and get superuser rights within the context of these projects. Users with the editor role will also get access to most permissions on the default project by default.";
                    };
                    readonly project: {
                        readonly description: "What project the role belongs to";
                        readonly type: "string";
                        readonly nullable: true;
                        readonly example: "default";
                    };
                };
                readonly components: {};
            };
        };
    };
};
export type RolesSchema = FromSchema<typeof rolesSchema>;
//# sourceMappingURL=roles-schema.d.ts.map