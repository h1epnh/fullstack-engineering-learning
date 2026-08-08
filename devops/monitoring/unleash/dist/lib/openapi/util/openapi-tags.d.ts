declare const OPENAPI_TAGS: readonly [{
    readonly name: "Addons";
    readonly description: "Create, update, and delete [Unleash addons](https://docs.getunleash.io/addons).";
}, {
    readonly name: "Admin UI";
    readonly description: "Configuration for the Unleash Admin UI. These endpoints should not be relied upon and can change at any point without prior notice.";
}, {
    readonly name: "API tokens";
    readonly description: "Create, update, and delete [Unleash API tokens](https://docs.getunleash.io/reference/api-tokens-and-client-keys).";
}, {
    readonly name: "Archive";
    readonly description: "Revive or permanently delete [archived feature flags](https://docs.getunleash.io/advanced/archived_toggles).";
}, {
    readonly name: "Auth";
    readonly description: "Manage logins, passwords, etc.";
}, {
    readonly name: "Banners";
    readonly description: "Create, update, flag, and delete [banners](https://docs.getunleash.io/reference/banners).";
}, {
    readonly name: "Change Requests";
    readonly description: "API for managing [change requests](https://docs.getunleash.io/reference/change-requests).";
}, {
    readonly name: "Client";
    readonly description: "Endpoints for [Unleash server-side clients](https://docs.getunleash.io/reference/sdks).";
}, {
    readonly name: "Context";
    readonly description: "Create, update, and delete [context fields](https://docs.getunleash.io/reference/unleash-context) that Unleash is aware of.";
}, {
    readonly name: "Dependencies";
    readonly description: "Manage feature dependencies.";
}, {
    readonly name: "Edge";
    readonly description: "Endpoints related to Unleash on the Edge.";
}, {
    readonly name: "Environments";
    readonly description: "Create, update, delete, enable or disable [environments](https://docs.getunleash.io/reference/environments) for this Unleash instance.";
}, {
    readonly name: "Events";
    readonly description: "Read events from this Unleash instance.";
}, {
    readonly name: "Feature Types";
    readonly description: "Manage [feature flag types](https://docs.getunleash.io/reference/feature-toggles#feature-flag-types).";
}, {
    readonly name: "Features";
    readonly description: "Create, update, and delete [feature flags](https://docs.getunleash.io/reference/feature-toggles).";
}, {
    readonly name: "Frontend API";
    readonly description: "API for connecting client-side (frontend) applications to Unleash.";
}, {
    readonly name: "Import/Export";
    readonly description: "[Import and export](https://docs.getunleash.io/how-to/how-to-environment-import-export) the state of your Unleash instance.";
}, {
    readonly name: "Instance Admin";
    readonly description: "Instance admin endpoints used to manage the Unleash instance itself.";
}, {
    readonly name: "Maintenance";
    readonly description: "Enable/disable the maintenance mode of Unleash.";
}, {
    readonly name: "Metrics";
    readonly description: "Register, read, or delete metrics recorded by Unleash.";
}, {
    readonly name: "Notifications";
    readonly description: "API for managing [notifications](https://docs.getunleash.io/reference/notifications).";
}, {
    readonly name: "Operational";
    readonly description: "Endpoints related to the operational status of this Unleash instance.";
}, {
    readonly name: "Personal access tokens";
    readonly description: "Create, update, and delete [Personal access tokens](https://docs.getunleash.io/reference/api-tokens-and-client-keys#personal-access-tokens).";
}, {
    readonly name: "Playground";
    readonly description: "Evaluate an Unleash context against your feature flags.";
}, {
    readonly name: "Projects";
    readonly description: "Create, update, and delete [Unleash projects](https://docs.getunleash.io/reference/projects).";
}, {
    readonly name: "Public signup tokens";
    readonly description: "Create, update, and delete [Unleash Public Signup tokens](https://docs.getunleash.io/reference/public-signup-tokens).";
}, {
    readonly name: "Search";
    readonly description: "Search for features.";
}, {
    readonly name: "Segments";
    readonly description: "Create, update, delete, and manage [segments](https://docs.getunleash.io/reference/segments).";
}, {
    readonly name: "Service Accounts";
    readonly description: "Endpoints for managing [Service Accounts](https://docs.getunleash.io/reference/service-accounts), which enable programmatic access to the Unleash API.";
}, {
    readonly name: "Strategies";
    readonly description: "Create, update, delete, manage [custom strategies](https://docs.getunleash.io/reference/custom-activation-strategies).";
}, {
    readonly name: "Tags";
    readonly description: "Create, update, and delete [tags and tag types](https://docs.getunleash.io/reference/feature-toggles#tags).";
}, {
    readonly name: "Telemetry";
    readonly description: "API for information about telemetry collection";
}, {
    readonly name: "Unstable";
    readonly description: "Experimental endpoints that may change or disappear at any time.";
}, {
    readonly name: "Users";
    readonly description: "Manage users and passwords.";
}];
export declare const openApiTags: ({
    readonly name: "Addons";
    readonly description: "Create, update, and delete [Unleash addons](https://docs.getunleash.io/addons).";
} | {
    readonly name: "Admin UI";
    readonly description: "Configuration for the Unleash Admin UI. These endpoints should not be relied upon and can change at any point without prior notice.";
} | {
    readonly name: "API tokens";
    readonly description: "Create, update, and delete [Unleash API tokens](https://docs.getunleash.io/reference/api-tokens-and-client-keys).";
} | {
    readonly name: "Archive";
    readonly description: "Revive or permanently delete [archived feature flags](https://docs.getunleash.io/advanced/archived_toggles).";
} | {
    readonly name: "Auth";
    readonly description: "Manage logins, passwords, etc.";
} | {
    readonly name: "Banners";
    readonly description: "Create, update, flag, and delete [banners](https://docs.getunleash.io/reference/banners).";
} | {
    readonly name: "Change Requests";
    readonly description: "API for managing [change requests](https://docs.getunleash.io/reference/change-requests).";
} | {
    readonly name: "Client";
    readonly description: "Endpoints for [Unleash server-side clients](https://docs.getunleash.io/reference/sdks).";
} | {
    readonly name: "Context";
    readonly description: "Create, update, and delete [context fields](https://docs.getunleash.io/reference/unleash-context) that Unleash is aware of.";
} | {
    readonly name: "Dependencies";
    readonly description: "Manage feature dependencies.";
} | {
    readonly name: "Edge";
    readonly description: "Endpoints related to Unleash on the Edge.";
} | {
    readonly name: "Environments";
    readonly description: "Create, update, delete, enable or disable [environments](https://docs.getunleash.io/reference/environments) for this Unleash instance.";
} | {
    readonly name: "Events";
    readonly description: "Read events from this Unleash instance.";
} | {
    readonly name: "Feature Types";
    readonly description: "Manage [feature flag types](https://docs.getunleash.io/reference/feature-toggles#feature-flag-types).";
} | {
    readonly name: "Features";
    readonly description: "Create, update, and delete [feature flags](https://docs.getunleash.io/reference/feature-toggles).";
} | {
    readonly name: "Frontend API";
    readonly description: "API for connecting client-side (frontend) applications to Unleash.";
} | {
    readonly name: "Import/Export";
    readonly description: "[Import and export](https://docs.getunleash.io/how-to/how-to-environment-import-export) the state of your Unleash instance.";
} | {
    readonly name: "Instance Admin";
    readonly description: "Instance admin endpoints used to manage the Unleash instance itself.";
} | {
    readonly name: "Maintenance";
    readonly description: "Enable/disable the maintenance mode of Unleash.";
} | {
    readonly name: "Metrics";
    readonly description: "Register, read, or delete metrics recorded by Unleash.";
} | {
    readonly name: "Notifications";
    readonly description: "API for managing [notifications](https://docs.getunleash.io/reference/notifications).";
} | {
    readonly name: "Operational";
    readonly description: "Endpoints related to the operational status of this Unleash instance.";
} | {
    readonly name: "Personal access tokens";
    readonly description: "Create, update, and delete [Personal access tokens](https://docs.getunleash.io/reference/api-tokens-and-client-keys#personal-access-tokens).";
} | {
    readonly name: "Playground";
    readonly description: "Evaluate an Unleash context against your feature flags.";
} | {
    readonly name: "Projects";
    readonly description: "Create, update, and delete [Unleash projects](https://docs.getunleash.io/reference/projects).";
} | {
    readonly name: "Public signup tokens";
    readonly description: "Create, update, and delete [Unleash Public Signup tokens](https://docs.getunleash.io/reference/public-signup-tokens).";
} | {
    readonly name: "Search";
    readonly description: "Search for features.";
} | {
    readonly name: "Segments";
    readonly description: "Create, update, delete, and manage [segments](https://docs.getunleash.io/reference/segments).";
} | {
    readonly name: "Service Accounts";
    readonly description: "Endpoints for managing [Service Accounts](https://docs.getunleash.io/reference/service-accounts), which enable programmatic access to the Unleash API.";
} | {
    readonly name: "Strategies";
    readonly description: "Create, update, delete, manage [custom strategies](https://docs.getunleash.io/reference/custom-activation-strategies).";
} | {
    readonly name: "Tags";
    readonly description: "Create, update, and delete [tags and tag types](https://docs.getunleash.io/reference/feature-toggles#tags).";
} | {
    readonly name: "Telemetry";
    readonly description: "API for information about telemetry collection";
} | {
    readonly name: "Unstable";
    readonly description: "Experimental endpoints that may change or disappear at any time.";
} | {
    readonly name: "Users";
    readonly description: "Manage users and passwords.";
})[];
export type OpenApiTag = (typeof OPENAPI_TAGS)[number]['name'];
export {};
//# sourceMappingURL=openapi-tags.d.ts.map