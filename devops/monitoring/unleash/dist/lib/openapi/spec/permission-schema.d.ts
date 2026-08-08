import type { FromSchema } from 'json-schema-to-ts';
export declare const permissionSchema: {
    readonly $id: "#/components/schemas/permissionSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["permission"];
    readonly description: "Project and environment permissions";
    readonly properties: {
        readonly permission: {
            readonly description: "[Project](https://docs.getunleash.io/reference/rbac#project-permissions) or [environment](https://docs.getunleash.io/reference/rbac#environment-permissions) permission name";
            readonly type: "string";
            readonly example: "UPDATE_FEATURE_STRATEGY";
        };
        readonly project: {
            readonly description: "The project this permission applies to";
            readonly type: "string";
            readonly example: "my-project";
        };
        readonly environment: {
            readonly description: "The environment this permission applies to";
            readonly type: "string";
            readonly example: "development";
        };
    };
    readonly components: {};
};
export type PermissionSchema = FromSchema<typeof permissionSchema>;
//# sourceMappingURL=permission-schema.d.ts.map