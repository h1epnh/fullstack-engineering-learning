"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const frontend_api_service_1 = require("./frontend-api-service");
const no_logger_1 = __importDefault(require("../../../test/fixtures/no-logger"));
const api_token_1 = require("../../types/models/api-token");
const events_1 = __importDefault(require("events"));
const metric_events_1 = require("../../metric-events");
test('frontend api service fetching features from global cache', async () => {
    const irrelevant = {};
    const globalFrontendApiCache = {
        getToggles(_) {
            return [
                {
                    name: 'toggleA',
                    enabled: true,
                    project: 'projectA',
                    type: 'release',
                    variants: [],
                    strategies: [
                        { name: 'default', parameters: [], constraints: [] },
                    ],
                },
                {
                    name: 'toggleB',
                    enabled: false,
                    project: 'projectA',
                    type: 'release',
                    variants: [],
                    strategies: [
                        { name: 'default', parameters: [], constraints: [] },
                    ],
                },
            ];
        },
        getToggle(name, token) {
            return this.getToggles(token).find((t) => t.name === name);
        },
    };
    const eventBus = new events_1.default();
    let createdFrontendRepositoriesCount = 0;
    eventBus.on(metric_events_1.FRONTEND_API_REPOSITORY_CREATED, () => {
        createdFrontendRepositoriesCount++;
    });
    const frontendApiService = new frontend_api_service_1.FrontendApiService({ getLogger: no_logger_1.default, eventBus }, irrelevant, irrelevant, globalFrontendApiCache);
    const features = await frontendApiService.getFrontendApiFeatures({
        projects: ['irrelevant'],
        environment: 'irrelevant',
        type: api_token_1.ApiTokenType.FRONTEND,
    }, {});
    expect(features).toMatchObject([{ name: 'toggleA' }]);
    expect(features).toHaveLength(1);
    expect(createdFrontendRepositoriesCount).toBe(1);
});
//# sourceMappingURL=frontend-api-service.test.js.map