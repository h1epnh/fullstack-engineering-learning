"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const integration_headers_1 = require("./integration-headers");
test('resolves known user agents to source labels', () => {
    expect((0, integration_headers_1.determineIntegrationSource)('axios/0.27.2')).toBe('Axios');
    expect((0, integration_headers_1.determineIntegrationSource)('axios/1.4.0')).toBe('Axios');
    expect((0, integration_headers_1.determineIntegrationSource)('curl/8.6.0')).toBe('Curl');
    expect((0, integration_headers_1.determineIntegrationSource)('node-fetch/1.0.0')).toBe('Node');
    expect((0, integration_headers_1.determineIntegrationSource)('node')).toBe('Node');
    expect((0, integration_headers_1.determineIntegrationSource)('python-requests/2.31.0')).toBe('Python');
    expect((0, integration_headers_1.determineIntegrationSource)('Terraform-Provider-Unleash/1.1.1')).toBe('TerraformUnleash');
    expect((0, integration_headers_1.determineIntegrationSource)('Jira-Cloud-Unleash')).toBe('JiraCloudUnleash');
    expect((0, integration_headers_1.determineIntegrationSource)('OpenAPI-Generator/1.0.0/go')).toBe('OpenAPIGO');
    expect((0, integration_headers_1.determineIntegrationSource)('Apache-HttpClient/4.5.13 (Java/11.0.22)')).toBe('Java');
    expect((0, integration_headers_1.determineIntegrationSource)('Go-http-client/1.1')).toBe('Go');
    expect((0, integration_headers_1.determineIntegrationSource)('rest-client/2.0.2 (linux-gnu x86_64) ruby/2.1.7p400')).toBe('RestClientRuby');
    expect((0, integration_headers_1.determineIntegrationSource)('No-http-client')).toBe('Other');
});
//# sourceMappingURL=integration-headers.test.js.map