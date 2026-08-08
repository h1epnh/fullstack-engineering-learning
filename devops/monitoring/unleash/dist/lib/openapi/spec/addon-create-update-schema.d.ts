import type { FromSchema } from 'json-schema-to-ts';
export declare const addonCreateUpdateSchema: {
    readonly $id: "#/components/schemas/addonCreateUpdateSchema";
    readonly type: "object";
    readonly required: readonly ["provider", "enabled", "parameters", "events"];
    readonly description: "Data required to create or update an [Unleash addon](https://docs.getunleash.io/reference/addons) instance.";
    readonly properties: {
        readonly provider: {
            readonly type: "string";
            readonly description: "The addon provider, such as \"webhook\" or \"slack\". This string is **case sensitive** and maps to the provider's `name` property.\n\nThe list of all supported providers and their parameters for a specific Unleash instance can be found by making a GET request to the `api/admin/addons` endpoint: the `providers` property of that response will contain all available providers.\n\nThe default set of providers can be found in the [addons reference documentation](https://docs.getunleash.io/reference/addons). The default supported options are:\n- `datadog` for [Datadog](https://docs.getunleash.io/reference/addons/datadog)\n- `slack` for [Slack](https://docs.getunleash.io/reference/addons/slack)\n- `teams` for [Microsoft Teams](https://docs.getunleash.io/reference/addons/teams)\n- `webhook` for [webhooks](https://docs.getunleash.io/reference/addons/webhook)\n\nThe provider you choose for your addon dictates what properties the `parameters` object needs. Refer to the documentation for each provider for more information.\n";
            readonly example: "webhook";
        };
        readonly description: {
            readonly type: "string";
            readonly description: "A description of the addon.";
            readonly example: "This addon posts updates to our internal feature tracking system whenever a feature is created or updated.";
        };
        readonly enabled: {
            readonly type: "boolean";
            readonly description: "Whether the addon should be enabled or not.";
        };
        readonly parameters: {
            readonly type: "object";
            readonly additionalProperties: {};
            readonly example: {
                readonly url: "http://localhost:4242/webhook";
            };
            readonly description: "Parameters for the addon provider. This object has different required and optional properties depending on the provider you choose. Consult the documentation for details.";
        };
        readonly events: {
            readonly type: "array";
            readonly description: "The event types that will trigger this specific addon.";
            readonly items: {
                readonly type: "string";
            };
            readonly example: readonly ["feature-created", "feature-updated"];
        };
        readonly projects: {
            readonly type: "array";
            readonly description: "The projects that this addon will listen to events from. An empty list means it will listen to events from **all** projects.";
            readonly example: readonly ["new-landing-project", "signups-v2"];
            readonly items: {
                readonly type: "string";
            };
        };
        readonly environments: {
            readonly type: "array";
            readonly description: "The list of environments that this addon will listen to events from. An empty list means it will listen to events from **all** environments.";
            readonly example: readonly ["development", "production"];
            readonly items: {
                readonly type: "string";
            };
        };
    };
    readonly components: {};
};
export type AddonCreateUpdateSchema = FromSchema<typeof addonCreateUpdateSchema>;
//# sourceMappingURL=addon-create-update-schema.d.ts.map