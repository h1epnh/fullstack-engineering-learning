import type { FromSchema } from 'json-schema-to-ts';
export declare const addonSchema: {
    readonly $id: "#/components/schemas/addonSchema";
    readonly type: "object";
    readonly description: "An [addon](https://docs.getunleash.io/reference/addons) instance description. Contains data about what kind of provider it uses, whether it's enabled or not, what events it listens for, and more.";
    readonly required: readonly ["id", "description", "provider", "enabled", "parameters", "events"];
    readonly properties: {
        readonly id: {
            readonly type: "integer";
            readonly minimum: 1;
            readonly example: 27;
            readonly description: "The addon's unique identifier.";
        };
        readonly provider: {
            readonly type: "string";
            readonly description: "The addon provider, such as \"webhook\" or \"slack\".";
            readonly example: "webhook";
        };
        readonly description: {
            readonly type: "string";
            readonly description: "A description of the addon. `null` if no description exists.";
            readonly example: "This addon posts updates to our internal feature tracking system whenever a feature is created or updated.";
            readonly nullable: true;
        };
        readonly enabled: {
            readonly type: "boolean";
            readonly description: "Whether the addon is enabled or not.";
        };
        readonly parameters: {
            readonly type: "object";
            readonly additionalProperties: {};
            readonly example: {
                readonly url: "http://localhost:4242/webhook";
            };
            readonly description: "Parameters for the addon provider. This object has different required and optional properties depending on the provider you choose.";
        };
        readonly events: {
            readonly type: "array";
            readonly description: "The event types that trigger this specific addon.";
            readonly items: {
                readonly type: "string";
            };
            readonly example: readonly ["feature-created", "feature-updated"];
        };
        readonly projects: {
            readonly type: "array";
            readonly description: "The projects that this addon listens to events from. An empty list means it listens to events from **all** projects.";
            readonly example: readonly ["new-landing-project", "signups-v2"];
            readonly items: {
                readonly type: "string";
            };
        };
        readonly environments: {
            readonly type: "array";
            readonly description: "The list of environments that this addon listens to events from. An empty list means it listens to events from **all** environments.";
            readonly example: readonly ["development", "production"];
            readonly items: {
                readonly type: "string";
            };
        };
    };
    readonly components: {};
};
export type AddonSchema = FromSchema<typeof addonSchema>;
//# sourceMappingURL=addon-schema.d.ts.map