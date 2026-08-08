"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("../types/events");
const webhook_1 = __importDefault(require("./webhook"));
const no_logger_1 = __importDefault(require("../../test/fixtures/no-logger"));
const types_1 = require("../types");
let fetchRetryCalls = [];
const registerEventMock = jest.fn();
const INTEGRATION_ID = 1337;
const ARGS = {
    getLogger: no_logger_1.default,
    unleashUrl: 'http://some-url.com',
    integrationEventsService: {},
    flagResolver: { isEnabled: (expName) => false },
    eventBus: {},
};
jest.mock('./addon', () => class Addon {
    constructor(definition, { getLogger }) {
        this.logger = getLogger('addon/test');
        fetchRetryCalls = [];
    }
    async fetchRetry(url, options, retries, backoff) {
        fetchRetryCalls.push({
            url,
            options,
            retries,
            backoff,
        });
        return Promise.resolve({ ok: true, status: 200 });
    }
    async registerEvent(event) {
        return registerEventMock(event);
    }
});
describe('Webhook integration', () => {
    beforeEach(() => {
        registerEventMock.mockClear();
    });
    test('Should handle event without "bodyTemplate"', () => {
        const addon = new webhook_1.default(ARGS);
        const event = {
            id: 1,
            createdAt: new Date(),
            createdByUserId: types_1.SYSTEM_USER_ID,
            type: events_1.FEATURE_CREATED,
            createdBy: 'some@user.com',
            featureName: 'some-toggle',
            data: {
                name: 'some-toggle',
                enabled: false,
                strategies: [{ name: 'default' }],
            },
        };
        const parameters = {
            url: 'http://test.webhook.com',
        };
        addon.handleEvent(event, parameters, INTEGRATION_ID);
        expect(fetchRetryCalls.length).toBe(1);
        expect(fetchRetryCalls[0].url).toBe(parameters.url);
        expect(fetchRetryCalls[0].options.body).toBe(JSON.stringify(event));
    });
    test('Should format event with "bodyTemplate"', () => {
        const addon = new webhook_1.default(ARGS);
        const event = {
            id: 1,
            createdAt: new Date(),
            createdByUserId: types_1.SYSTEM_USER_ID,
            type: events_1.FEATURE_CREATED,
            createdBy: 'some@user.com',
            featureName: 'some-toggle',
            data: {
                name: 'some-toggle',
                enabled: false,
                strategies: [{ name: 'default' }],
            },
        };
        const parameters = {
            url: 'http://test.webhook.com/plain',
            bodyTemplate: '{{event.type}} on toggle {{event.data.name}}',
            contentType: 'text/plain',
        };
        addon.handleEvent(event, parameters, INTEGRATION_ID);
        const call = fetchRetryCalls[0];
        expect(fetchRetryCalls.length).toBe(1);
        expect(call.url).toBe(parameters.url);
        expect(call.options.headers['Content-Type']).toBe('text/plain');
        expect(call.options.body).toBe('feature-created on toggle some-toggle');
    });
    test('should allow for eventJson and eventMarkdown in bodyTemplate', async () => {
        const addon = new webhook_1.default(ARGS);
        const event = {
            id: 1,
            createdAt: new Date('2024-07-24T00:00:00.000Z'),
            createdByUserId: types_1.SYSTEM_USER_ID,
            type: events_1.FEATURE_CREATED,
            createdBy: 'some@user.com',
            featureName: 'some-toggle',
            project: 'default',
            data: {
                name: 'some-toggle',
                enabled: false,
                strategies: [{ name: 'default' }],
            },
        };
        const parameters = {
            url: 'http://test.webhook.com/plain',
            bodyTemplate: '{\n  "json": {{{eventJson}}},\n  "markdown": "{{eventMarkdown}}"\n}',
            contentType: 'text/plain',
        };
        addon.handleEvent(event, parameters, INTEGRATION_ID);
        const call = fetchRetryCalls[0];
        expect(fetchRetryCalls.length).toBe(1);
        expect(call.url).toBe(parameters.url);
        expect(call.options.headers['Content-Type']).toBe('text/plain');
        expect(call.options.body).toMatchSnapshot();
        expect(JSON.parse(JSON.parse(call.options.body).json)).toEqual((0, types_1.serializeDates)(event));
    });
    test('Should format event with "authorization"', () => {
        const addon = new webhook_1.default(ARGS);
        const event = {
            id: 1,
            createdAt: new Date(),
            createdByUserId: types_1.SYSTEM_USER_ID,
            type: events_1.FEATURE_CREATED,
            createdBy: 'some@user.com',
            featureName: 'some-toggle',
            data: {
                name: 'some-toggle',
                enabled: false,
                strategies: [{ name: 'default' }],
            },
        };
        const parameters = {
            url: 'http://test.webhook.com/plain',
            bodyTemplate: '{{event.type}} on toggle {{event.data.name}}',
            contentType: 'text/plain',
            authorization: 'API KEY 123abc',
        };
        addon.handleEvent(event, parameters, INTEGRATION_ID);
        const call = fetchRetryCalls[0];
        expect(fetchRetryCalls.length).toBe(1);
        expect(call.url).toBe(parameters.url);
        expect(call.options.headers.Authorization).toBe(parameters.authorization);
        expect(call.options.body).toBe('feature-created on toggle some-toggle');
    });
    test('Should handle custom headers', async () => {
        const addon = new webhook_1.default(ARGS);
        const event = {
            id: 1,
            createdAt: new Date(),
            createdByUserId: types_1.SYSTEM_USER_ID,
            type: events_1.FEATURE_CREATED,
            createdBy: 'some@user.com',
            featureName: 'some-toggle',
            data: {
                name: 'some-toggle',
                enabled: false,
                strategies: [{ name: 'default' }],
            },
        };
        const parameters = {
            url: 'http://test.webhook.com/plain',
            bodyTemplate: '{{event.type}} on toggle {{event.data.name}}',
            contentType: 'text/plain',
            authorization: 'API KEY 123abc',
            customHeaders: `{ "MY_CUSTOM_HEADER": "MY_CUSTOM_VALUE" }`,
        };
        addon.handleEvent(event, parameters, INTEGRATION_ID);
        const call = fetchRetryCalls[0];
        expect(fetchRetryCalls.length).toBe(1);
        expect(call.url).toBe(parameters.url);
        expect(call.options.headers.Authorization).toBe(parameters.authorization);
        expect(call.options.headers.MY_CUSTOM_HEADER).toBe('MY_CUSTOM_VALUE');
        expect(call.options.body).toBe('feature-created on toggle some-toggle');
    });
    test('Should call registerEvent', async () => {
        const addon = new webhook_1.default(ARGS);
        const event = {
            id: 1,
            createdAt: new Date(),
            createdByUserId: types_1.SYSTEM_USER_ID,
            type: events_1.FEATURE_CREATED,
            createdBy: 'some@user.com',
            featureName: 'some-toggle',
            data: {
                name: 'some-toggle',
                enabled: false,
                strategies: [{ name: 'default' }],
            },
        };
        const parameters = {
            url: 'http://test.webhook.com/plain',
            bodyTemplate: '{{event.type}} on toggle {{event.data.name}}',
            contentType: 'text/plain',
            authorization: 'API KEY 123abc',
            customHeaders: `{ "MY_CUSTOM_HEADER": "MY_CUSTOM_VALUE" }`,
        };
        await addon.handleEvent(event, parameters, INTEGRATION_ID);
        expect(registerEventMock).toHaveBeenCalledTimes(1);
        expect(registerEventMock).toHaveBeenCalledWith({
            integrationId: INTEGRATION_ID,
            state: 'success',
            stateDetails: 'Webhook request was successful with status code: 200.',
            event: (0, types_1.serializeDates)(event),
            details: {
                url: parameters.url,
                contentType: parameters.contentType,
                body: 'feature-created on toggle some-toggle',
            },
        });
    });
});
//# sourceMappingURL=webhook.test.js.map