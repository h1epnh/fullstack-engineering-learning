import type { FromSchema } from 'json-schema-to-ts';
export declare const addonsSchema: {
    readonly $id: "#/components/schemas/addonsSchema";
    readonly type: "object";
    readonly required: readonly ["addons", "providers"];
    readonly description: "An object containing two things:\n1. A list of all [addons](https://docs.getunleash.io/reference/addons) defined on this Unleash instance\n2. A list of all addon providers defined on this instance";
    readonly properties: {
        readonly addons: {
            readonly type: "array";
            readonly description: "All the addons that exist on this instance of Unleash.";
            readonly items: {
                readonly $ref: "#/components/schemas/addonSchema";
            };
        };
        readonly providers: {
            readonly type: "array";
            readonly description: "A list of  all available addon providers, along with their parameters and descriptions.";
            readonly example: readonly [{
                readonly name: "webhook";
                readonly displayName: "Webhook";
                readonly description: "A Webhook is a generic way to post messages from Unleash to third party services.";
                readonly documentationUrl: "https://docs.getunleash.io/docs/addons/webhook";
                readonly parameters: readonly [{
                    readonly name: "url";
                    readonly displayName: "Webhook URL";
                    readonly description: "(Required) Unleash will perform a HTTP Post to the specified URL (one retry if first attempt fails)";
                    readonly type: "url";
                    readonly required: true;
                    readonly sensitive: true;
                }, {
                    readonly name: "contentType";
                    readonly displayName: "Content-Type";
                    readonly placeholder: "application/json";
                    readonly description: "(Optional) The Content-Type header to use. Defaults to \"application/json\".";
                    readonly type: "text";
                    readonly required: false;
                    readonly sensitive: false;
                }, {
                    readonly name: "authorization";
                    readonly displayName: "Authorization";
                    readonly placeholder: "";
                    readonly description: "(Optional) The Authorization header to use. Not used if left blank.";
                    readonly type: "text";
                    readonly required: false;
                    readonly sensitive: true;
                }, {
                    readonly name: "bodyTemplate";
                    readonly displayName: "Body template";
                    readonly placeholder: "{\n  \"event\": \"{{event.type}}\",\n  \"createdBy\": \"{{event.createdBy}}\",\n  \"featureToggle\": \"{{event.data.name}}\",\n  \"timestamp\": \"{{event.data.createdAt}}\"\n}";
                    readonly description: "(Optional) You may format the body using a mustache template. If you don't specify anything, the format will similar to the events format (https://docs.getunleash.io/reference/api/legacy/unleash/admin/events)";
                    readonly type: "textfield";
                    readonly required: false;
                    readonly sensitive: false;
                }];
                readonly events: readonly ["feature-created", "feature-updated", "feature-archived", "feature-revived", "feature-stale-on", "feature-stale-off", "feature-environment-enabled", "feature-environment-disabled", "feature-strategy-remove", "feature-strategy-update", "feature-strategy-add", "feature-metadata-updated", "feature-variants-updated", "feature-project-change", "feature-tagged", "feature-untagged", "change-request-created", "change-request-discarded", "change-added", "change-discarded", "change-request-approved", "change-request-approval-added", "change-request-cancelled", "change-request-sent-to-review", "change-request-applied"];
            }, {
                readonly name: "slack";
                readonly displayName: "Slack";
                readonly description: "Allows Unleash to post updates to Slack.";
                readonly documentationUrl: "https://docs.getunleash.io/docs/addons/slack";
                readonly parameters: readonly [{
                    readonly name: "url";
                    readonly displayName: "Slack webhook URL";
                    readonly description: "(Required)";
                    readonly type: "url";
                    readonly required: true;
                    readonly sensitive: true;
                }, {
                    readonly name: "username";
                    readonly displayName: "Username";
                    readonly placeholder: "Unleash";
                    readonly description: "The username to use when posting messages to slack. Defaults to \"Unleash\".";
                    readonly type: "text";
                    readonly required: false;
                    readonly sensitive: false;
                }, {
                    readonly name: "emojiIcon";
                    readonly displayName: "Emoji Icon";
                    readonly placeholder: ":unleash:";
                    readonly description: "The emoji_icon to use when posting messages to slack. Defaults to \":unleash:\".";
                    readonly type: "text";
                    readonly required: false;
                    readonly sensitive: false;
                }, {
                    readonly name: "defaultChannel";
                    readonly displayName: "Default channel";
                    readonly description: "(Required) Default channel to post updates to if not specified in the slack-tag";
                    readonly type: "text";
                    readonly required: true;
                    readonly sensitive: false;
                }];
                readonly events: readonly ["feature-created", "feature-updated", "feature-archived", "feature-revived", "feature-stale-on", "feature-stale-off", "feature-environment-enabled", "feature-environment-disabled", "feature-strategy-remove", "feature-strategy-update", "feature-strategy-add", "feature-metadata-updated", "feature-variants-updated", "feature-project-change"];
                readonly tagTypes: readonly [{
                    readonly name: "slack";
                    readonly description: "Slack tag used by the slack-addon to specify the slack channel.";
                    readonly icon: "S";
                }];
            }, {
                readonly name: "teams";
                readonly displayName: "Microsoft Teams";
                readonly description: "Allows Unleash to post updates to Microsoft Teams.";
                readonly documentationUrl: "https://docs.getunleash.io/docs/addons/teams";
                readonly parameters: readonly [{
                    readonly name: "url";
                    readonly displayName: "Microsoft Teams webhook URL";
                    readonly description: "(Required)";
                    readonly type: "url";
                    readonly required: true;
                    readonly sensitive: true;
                }];
                readonly events: readonly ["feature-created", "feature-updated", "feature-archived", "feature-revived", "feature-stale-on", "feature-stale-off", "feature-environment-enabled", "feature-environment-disabled", "feature-strategy-remove", "feature-strategy-update", "feature-strategy-add", "feature-metadata-updated", "feature-variants-updated", "feature-project-change"];
            }, {
                readonly name: "datadog";
                readonly displayName: "Datadog";
                readonly description: "Allows Unleash to post updates to Datadog.";
                readonly documentationUrl: "https://docs.getunleash.io/docs/addons/datadog";
                readonly parameters: readonly [{
                    readonly name: "url";
                    readonly displayName: "Datadog Events URL";
                    readonly description: "Default URL: https://api.datadoghq.com/api/v1/events. Needs to be changed if your're not using the US1 site.";
                    readonly type: "url";
                    readonly required: false;
                    readonly sensitive: false;
                }, {
                    readonly name: "apiKey";
                    readonly displayName: "Datadog API key";
                    readonly placeholder: "j96c23b0f12a6b3434a8d710110bd862";
                    readonly description: "(Required) API key to connect to Datadog";
                    readonly type: "text";
                    readonly required: true;
                    readonly sensitive: true;
                }];
                readonly events: readonly ["feature-created", "feature-updated", "feature-archived", "feature-revived", "feature-stale-on", "feature-stale-off", "feature-environment-enabled", "feature-environment-disabled", "feature-strategy-remove", "feature-strategy-update", "feature-strategy-add", "feature-metadata-updated", "feature-project-change", "feature-variants-updated"];
                readonly tagTypes: readonly [{
                    readonly name: "datadog";
                    readonly description: "All Datadog tags added to a specific feature are sent to datadog event stream.";
                    readonly icon: "D";
                }];
            }];
            readonly items: {
                readonly $ref: "#/components/schemas/addonTypeSchema";
            };
        };
    };
    readonly components: {
        readonly schemas: {
            readonly addonSchema: {
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
            readonly addonTypeSchema: {
                readonly $id: "#/components/schemas/addonTypeSchema";
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["name", "displayName", "documentationUrl", "description"];
                readonly description: "An addon provider. Defines a specific addon type and what the end user must configure when creating a new addon of that type.";
                readonly properties: {
                    readonly name: {
                        readonly type: "string";
                        readonly description: "The name of the addon type. When creating new addons, this goes in the payload's `type` field.";
                        readonly example: "slack";
                    };
                    readonly displayName: {
                        readonly type: "string";
                        readonly description: "The addon type's name as it should be displayed in the admin UI.";
                        readonly example: "Slack";
                    };
                    readonly documentationUrl: {
                        readonly type: "string";
                        readonly description: "A URL to where you can find more information about using this addon type.";
                        readonly example: "https://docs.getunleash.io/docs/addons/slack";
                    };
                    readonly description: {
                        readonly type: "string";
                        readonly description: "A description of the addon type.";
                        readonly example: "Allows Unleash to post updates to Slack.";
                    };
                    readonly howTo: {
                        readonly type: "string";
                        readonly description: "A long description of how to use this addon type. This will be displayed on the top of configuration page. Can contain markdown.";
                        readonly example: "This is **how you use** this addon type...\n  - Step 1\n  - Step 2\n  - Step 3";
                    };
                    readonly tagTypes: {
                        readonly type: "array";
                        readonly description: "A list of [Unleash tag types](https://docs.getunleash.io/reference/feature-toggles#tags) that this addon uses. These tags will be added to the Unleash instance when an addon of this type is created.";
                        readonly example: readonly [{
                            readonly name: "slack";
                            readonly description: "Slack tag used by the slack-addon to specify the slack channel.";
                            readonly icon: "S";
                        }];
                        readonly items: {
                            readonly $ref: "#/components/schemas/tagTypeSchema";
                        };
                    };
                    readonly parameters: {
                        readonly type: "array";
                        readonly description: "The addon provider's parameters. Use these to configure an addon of this provider type. Items with `required: true` must be provided.";
                        readonly items: {
                            readonly $ref: "#/components/schemas/addonParameterSchema";
                        };
                        readonly example: readonly [{
                            readonly name: "url";
                            readonly displayName: "Slack webhook URL";
                            readonly description: "(Required)";
                            readonly type: "url";
                            readonly required: true;
                            readonly sensitive: true;
                        }, {
                            readonly name: "username";
                            readonly displayName: "Username";
                            readonly placeholder: "Unleash";
                            readonly description: "The username to use when posting messages to slack. Defaults to \"Unleash\".";
                            readonly type: "text";
                            readonly required: false;
                            readonly sensitive: false;
                        }, {
                            readonly name: "emojiIcon";
                            readonly displayName: "Emoji Icon";
                            readonly placeholder: ":unleash:";
                            readonly description: "The emoji_icon to use when posting messages to slack. Defaults to \":unleash:\".";
                            readonly type: "text";
                            readonly required: false;
                            readonly sensitive: false;
                        }, {
                            readonly name: "defaultChannel";
                            readonly displayName: "Default channel";
                            readonly description: "(Required) Default channel to post updates to if not specified in the slack-tag";
                            readonly type: "text";
                            readonly required: true;
                            readonly sensitive: false;
                        }];
                    };
                    readonly events: {
                        readonly type: "array";
                        readonly description: "All the [event types](https://docs.getunleash.io/reference/api/legacy/unleash/admin/events#feature-toggle-events) that are available for this addon provider.";
                        readonly items: {
                            readonly type: "string";
                        };
                        readonly example: readonly ["feature-created", "feature-updated", "feature-archived", "feature-revived", "feature-stale-on", "feature-stale-off", "feature-environment-enabled", "feature-environment-disabled", "feature-strategy-remove", "feature-strategy-update", "feature-strategy-add", "feature-metadata-updated", "feature-variants-updated", "feature-project-change"];
                    };
                    readonly installation: {
                        readonly type: "object";
                        readonly additionalProperties: false;
                        readonly required: readonly ["url"];
                        readonly description: "The installation configuration for this addon type.";
                        readonly properties: {
                            readonly url: {
                                readonly type: "string";
                                readonly description: "A URL to where the addon configuration should redirect to install addons of this type.";
                                readonly example: "https://unleash-slack-app.vercel.app/install";
                            };
                            readonly title: {
                                readonly type: "string";
                                readonly description: "The title of the installation configuration. This will be displayed to the user when installing addons of this type.";
                                readonly example: "Slack App installation";
                            };
                            readonly helpText: {
                                readonly type: "string";
                                readonly description: "The help text of the installation configuration. This will be displayed to the user when installing addons of this type.";
                                readonly example: "Clicking the Install button will send you to Slack to initiate the installation procedure for the Unleash Slack app for your workspace";
                            };
                        };
                    };
                    readonly alerts: {
                        readonly type: "array";
                        readonly description: "A list of alerts to display to the user when installing addons of this type.";
                        readonly items: {
                            readonly type: "object";
                            readonly additionalProperties: false;
                            readonly required: readonly ["type", "text"];
                            readonly properties: {
                                readonly type: {
                                    readonly type: "string";
                                    readonly enum: readonly ["success", "info", "warning", "error"];
                                    readonly description: "The type of alert. This determines the color of the alert.";
                                    readonly example: "info";
                                };
                                readonly text: {
                                    readonly type: "string";
                                    readonly description: "The text of the alert. This is what will be displayed to the user.";
                                    readonly example: "Please ensure you have the Unleash Slack App installed in your Slack workspace if you haven't installed it already. If you want the Unleash Slack App bot to post messages to private channels, you'll need to invite it to those channels.";
                                };
                            };
                        };
                    };
                    readonly deprecated: {
                        readonly type: "string";
                        readonly description: "This should be used to inform the user that this addon type is deprecated and should not be used. Deprecated addons will show a badge with this information on the UI.";
                        readonly example: "This integration is deprecated. Please try the new integration instead.";
                    };
                };
                readonly components: {
                    readonly schemas: {
                        readonly tagTypeSchema: {
                            readonly $id: "#/components/schemas/tagTypeSchema";
                            readonly type: "object";
                            readonly additionalProperties: false;
                            readonly description: "A tag type.";
                            readonly required: readonly ["name"];
                            readonly properties: {
                                readonly name: {
                                    readonly type: "string";
                                    readonly description: "The name of the tag type.";
                                    readonly example: "color";
                                };
                                readonly description: {
                                    readonly type: "string";
                                    readonly description: "The description of the tag type.";
                                    readonly example: "A tag type for describing the color of a tag.";
                                };
                                readonly icon: {
                                    readonly type: "string";
                                    readonly nullable: true;
                                    readonly description: "The icon of the tag type.";
                                    readonly example: "not-really-used";
                                };
                                readonly color: {
                                    readonly type: "string";
                                    readonly nullable: true;
                                    readonly description: "The hexadecimal color code for the tag type.";
                                    readonly example: "#FFFFFF";
                                    readonly pattern: "^#[0-9A-Fa-f]{6}$";
                                };
                            };
                            readonly components: {};
                        };
                        readonly addonParameterSchema: {
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
                    };
                };
            };
            readonly tagTypeSchema: {
                readonly $id: "#/components/schemas/tagTypeSchema";
                readonly type: "object";
                readonly additionalProperties: false;
                readonly description: "A tag type.";
                readonly required: readonly ["name"];
                readonly properties: {
                    readonly name: {
                        readonly type: "string";
                        readonly description: "The name of the tag type.";
                        readonly example: "color";
                    };
                    readonly description: {
                        readonly type: "string";
                        readonly description: "The description of the tag type.";
                        readonly example: "A tag type for describing the color of a tag.";
                    };
                    readonly icon: {
                        readonly type: "string";
                        readonly nullable: true;
                        readonly description: "The icon of the tag type.";
                        readonly example: "not-really-used";
                    };
                    readonly color: {
                        readonly type: "string";
                        readonly nullable: true;
                        readonly description: "The hexadecimal color code for the tag type.";
                        readonly example: "#FFFFFF";
                        readonly pattern: "^#[0-9A-Fa-f]{6}$";
                    };
                };
                readonly components: {};
            };
            readonly addonParameterSchema: {
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
        };
    };
};
export type AddonsSchema = FromSchema<typeof addonsSchema>;
//# sourceMappingURL=addons-schema.d.ts.map