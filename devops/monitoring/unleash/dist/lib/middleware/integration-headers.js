"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.determineIntegrationSource = exports.getFilteredOrigin = void 0;
const ORIGIN = 'origin';
const httpMatcher = /^https?:\/\//;
const userAgentMatches = [
    { label: 'Axios', matcher: /^axios/ },
    { label: 'Curl', matcher: /^curl/ },
    { label: 'Go', matcher: /^Go-http-client/ },
    { label: 'Python', matcher: /^python-requests/ },
    { label: 'Node', matcher: /^node/ },
    { label: 'Java', matcher: /^Apache-HttpClient.*Java/ },
    { label: 'JiraCloudUnleash', matcher: /^Jira-Cloud-Unleash/ },
    { label: 'TerraformUnleash', matcher: /^Terraform-Provider-Unleash/ },
    { label: 'OpenAPIGO', matcher: /^OpenAPI-Generator\/.*\/go/ },
    { label: 'RestClientRuby', matcher: /^rest-client\/.*ruby/ },
];
const getFilteredOrigin = (request) => {
    const origin = request.headers[ORIGIN];
    if (origin && httpMatcher.test(origin)) {
        return origin;
    }
    return undefined;
};
exports.getFilteredOrigin = getFilteredOrigin;
const determineIntegrationSource = (userAgent) => {
    return (userAgentMatches.find((candidate) => candidate.matcher.test(userAgent))
        ?.label ?? 'Other');
};
exports.determineIntegrationSource = determineIntegrationSource;
//# sourceMappingURL=integration-headers.js.map