"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
const new_relic_1 = __importDefault(require("./new-relic"));
const no_logger_1 = __importDefault(require("../../test/fixtures/no-logger"));
const node_zlib_1 = require("node:zlib");
const util_1 = require("util");
const asyncGunzip = (0, util_1.promisify)(node_zlib_1.gunzip);
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
const defaultParameters = {
    url: 'fakeUrl',
    licenseKey: 'fakeLicenseKey',
};
const defaultEvent = {
    id: 1,
    createdAt: new Date(),
    type: types_1.FEATURE_CREATED,
    createdBy: 'some@user.com',
    createdByUserId: -1337,
    featureName: 'some-toggle',
    data: {
        name: 'some-toggle',
        enabled: false,
        strategies: [{ name: 'default' }],
    },
};
const makeAddHandleEvent = (event, parameters) => {
    const addon = new new_relic_1.default(ARGS);
    return () => addon.handleEvent(event, parameters, INTEGRATION_ID);
};
describe('New Relic integration', () => {
    beforeEach(() => {
        registerEventMock.mockClear();
    });
    test.each([
        {
            partialEvent: { type: types_1.FEATURE_CREATED },
            test: '$type toggle',
        },
        {
            partialEvent: {
                type: types_1.FEATURE_ARCHIVED,
                data: {
                    name: 'some-toggle',
                },
            },
            test: 'FEATURE_ARCHIVED toggle with project info',
        },
        {
            partialEvent: {
                type: types_1.FEATURE_ARCHIVED,
                project: 'some-project',
                data: {
                    name: 'some-toggle',
                },
            },
            test: 'FEATURE_ARCHIVED with project info',
        },
        {
            partialEvent: {
                type: types_1.FEATURE_ENVIRONMENT_DISABLED,
                environment: 'development',
            },
            test: 'toggled environment',
        },
        {
            partialEvent: {
                type: types_1.FEATURE_ENVIRONMENT_DISABLED,
                environment: 'development',
            },
            partialParameters: {
                customHeaders: `{ "MY_CUSTOM_HEADER": "MY_CUSTOM_VALUE" }`,
            },
            test: 'customHeaders in headers when calling service',
        },
        {
            partialEvent: {
                type: types_1.FEATURE_ENVIRONMENT_DISABLED,
                environment: 'development',
            },
            partialParameters: {
                bodyTemplate: '{\n  "eventType": "{{event.type}}",\n  "createdBy": "{{event.createdBy}}"\n}',
            },
            test: 'custom body template',
        },
    ])('Should call New Relic Event API for $test', async ({ partialEvent, partialParameters }) => {
        const event = {
            ...defaultEvent,
            ...partialEvent,
        };
        const parameters = {
            ...defaultParameters,
            ...partialParameters,
        };
        const handleEvent = makeAddHandleEvent(event, parameters);
        await handleEvent();
        expect(fetchRetryCalls.length).toBe(1);
        const { url, options } = fetchRetryCalls[0];
        const jsonBody = JSON.parse((await asyncGunzip(options.body)).toString());
        expect(url).toBe(parameters.url);
        expect(options.method).toBe('POST');
        expect(options.headers['Api-Key']).toBe(parameters.licenseKey);
        expect(options.headers['Content-Type']).toBe('application/json');
        expect(options.headers['Content-Encoding']).toBe('gzip');
        expect(options.headers).toMatchSnapshot();
        expect(jsonBody.eventType).toBe('UnleashServiceEvent');
        expect(jsonBody.unleashEventType).toBe(event.type);
        expect(jsonBody.featureName).toBe(event.data.name);
        expect(jsonBody.environment).toBe(event.environment);
        expect(jsonBody.createdBy).toBe(event.createdBy);
        expect(jsonBody.createdByUserId).toBe(event.createdByUserId);
        expect(jsonBody.createdAt).toBe(event.createdAt.getTime());
    });
    test('Should call registerEvent', async () => {
        const handleEvent = makeAddHandleEvent(defaultEvent, defaultParameters);
        await handleEvent();
        expect(registerEventMock).toHaveBeenCalledTimes(1);
        expect(registerEventMock).toHaveBeenCalledWith({
            integrationId: INTEGRATION_ID,
            state: 'success',
            stateDetails: 'New Relic Events API request was successful with status code: 200.',
            event: (0, types_1.serializeDates)(defaultEvent),
            details: {
                url: defaultParameters.url,
                body: {
                    eventType: 'UnleashServiceEvent',
                    unleashEventType: defaultEvent.type,
                    featureName: defaultEvent.featureName,
                    environment: defaultEvent.environment,
                    createdBy: defaultEvent.createdBy,
                    createdByUserId: defaultEvent.createdByUserId,
                    createdAt: defaultEvent.createdAt.getTime(),
                    ...defaultEvent.data,
                },
            },
        });
    });
});
//# sourceMappingURL=new-relic.test.js.map