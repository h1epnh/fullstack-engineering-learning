import type { FromSchema } from 'json-schema-to-ts';
export declare const addonParameterSchema: {
    readonly $id: "#/components/schemas/addonParameterSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["name", "displayName", "type", "required", "sensitive"];
    readonly description: "An addon parameter definition.";
    readonly properties: {
        readonly name: {
            readonly type: "string";
            readonly example: "emojiIcon";
            readonly description: "The name of the parameter as it is used in code. References to this parameter should use this value.";
        };
        readonly displayName: {
            readonly type: "string";
            readonly example: "Emoji Icon";
            readonly description: "The name of the parameter as it is shown to the end user in the Admin UI.";
        };
        readonly type: {
            readonly type: "string";
            readonly description: "The type of the parameter. Corresponds roughly to [HTML `input` field types](https://developer.mozilla.org/docs/Web/HTML/Element/Input#input_types). Multi-line inut fields are indicated as `textfield` (equivalent to the HTML `textarea` tag).";
            readonly example: "text";
        };
        readonly description: {
            readonly type: "string";
            readonly example: "The emoji_icon to use when posting messages to slack. Defaults to \":unleash:\".";
            readonly description: "A description of the parameter. This should explain to the end user what the parameter is used for.";
        };
        readonly placeholder: {
            readonly type: "string";
            readonly example: ":unleash:";
            readonly description: "The default value for this parameter. This value is used if no other value is provided.";
        };
        readonly required: {
            readonly type: "boolean";
            readonly example: false;
            readonly description: "Whether this parameter is required or not. If a parameter is required, you must give it a value when you create the addon. If it is not required it can be left out. It may receive a default value in those cases.";
        };
        readonly sensitive: {
            readonly type: "boolean";
            readonly example: false;
            readonly description: "Indicates whether this parameter is **sensitive** or not. Unleash will not return sensitive parameters to API requests. It will instead use a number of asterisks to indicate that a value is set, e.g. \"******\". The number of asterisks does not correlate to the parameter's value.";
        };
    };
    readonly components: {};
};
export type AddonParameterSchema = FromSchema<typeof addonParameterSchema>;
//# sourceMappingURL=addon-parameter-schema.d.ts.map