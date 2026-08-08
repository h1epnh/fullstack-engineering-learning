import type { FromSchema } from 'json-schema-to-ts';
export declare const versionSchema: {
    readonly $id: "#/components/schemas/versionSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly description: "Detailed information about an Unleash version";
    readonly required: readonly ["current", "latest", "isLatest"];
    readonly properties: {
        readonly current: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly description: "The current version of Unleash.";
            readonly properties: {
                readonly oss: {
                    readonly description: "The OSS version used when building this Unleash instance, represented as a git revision belonging to the [main Unleash git repo](https://github.com/Unleash/unleash/)";
                    readonly example: "5.3.0-main";
                    readonly type: "string";
                };
                readonly enterprise: {
                    readonly description: "The Enterpris version of Unleash used to build this instance, represented as a git revision belonging to the [Unleash Enterprise](https://github.com/ivarconr/unleash-enterprise) repository. Will be an empty string if no enterprise version was used,";
                    readonly example: "5.3.0-main+2105.45ed03c9";
                    readonly type: "string";
                };
            };
        };
        readonly latest: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly description: "Information about the latest available Unleash releases. Will be an empty object if no data is available.";
            readonly properties: {
                readonly oss: {
                    readonly description: "The latest available OSS version of Unleash";
                    readonly type: "string";
                    readonly example: "5.1.5";
                };
                readonly enterprise: {
                    readonly description: "The latest available Enterprise version of Unleash";
                    readonly type: "string";
                    readonly example: "5.1.5";
                };
            };
        };
        readonly isLatest: {
            readonly type: "boolean";
            readonly description: "Whether the Unleash server is running the latest release (`true`) or if there are updates available (`false`)";
            readonly example: true;
        };
        readonly instanceId: {
            readonly type: "string";
            readonly description: "The instance identifier of the Unleash instance";
            readonly example: "0d652a82-43db-4144-8e02-864b0b030710";
        };
        readonly buildDate: {
            readonly description: "The date and time of when this Unleash instance version was built";
            readonly type: "string";
            readonly format: "date-time";
            readonly nullable: true;
            readonly example: "2023-06-30T11:41:00.123Z";
        };
    };
    readonly components: {};
};
export type VersionSchema = FromSchema<typeof versionSchema>;
//# sourceMappingURL=version-schema.d.ts.map