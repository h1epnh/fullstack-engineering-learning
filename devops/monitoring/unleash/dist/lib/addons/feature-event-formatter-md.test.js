"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
const feature_event_formatter_md_1 = require("./feature-event-formatter-md");
const util_1 = require("../util");
const testCases = [
    [
        'when groupId changed',
        {
            id: 920,
            type: types_1.FEATURE_STRATEGY_UPDATE,
            createdBy: 'user@company.com',
            createdByUserId: types_1.SYSTEM_USER_ID,
            createdAt: new Date('2022-06-01T10:03:11.549Z'),
            data: {
                id: '3f4bf713-696c-43a4-8ce7-d6c607108858',
                name: 'flexibleRollout',
                constraints: [],
                parameters: {
                    groupId: 'different-feature',
                    rollout: '32',
                    stickiness: 'default',
                },
            },
            preData: {
                id: '3f4bf713-696c-43a4-8ce7-d6c607108858',
                name: 'flexibleRollout',
                parameters: {
                    groupId: 'new-feature',
                    rollout: '32',
                    stickiness: 'default',
                },
                constraints: [],
            },
            tags: [],
            featureName: 'new-feature',
            project: 'my-other-project',
            environment: 'production',
        },
    ],
    [
        'when rollout percentage changed',
        {
            id: 920,
            type: types_1.FEATURE_STRATEGY_UPDATE,
            createdBy: 'user@company.com',
            createdByUserId: types_1.SYSTEM_USER_ID,
            createdAt: new Date('2022-06-01T10:03:11.549Z'),
            data: {
                id: '3f4bf713-696c-43a4-8ce7-d6c607108858',
                name: 'flexibleRollout',
                constraints: [],
                parameters: {
                    groupId: 'new-feature',
                    rollout: '32',
                    stickiness: 'default',
                },
            },
            preData: {
                id: '3f4bf713-696c-43a4-8ce7-d6c607108858',
                name: 'flexibleRollout',
                parameters: {
                    groupId: 'new-feature',
                    rollout: '67',
                    stickiness: 'default',
                },
                constraints: [],
            },
            tags: [],
            featureName: 'new-feature',
            project: 'my-other-project',
            environment: 'production',
        },
    ],
    [
        'when stickiness changed',
        {
            id: 920,
            type: types_1.FEATURE_STRATEGY_UPDATE,
            createdBy: 'user@company.com',
            createdByUserId: types_1.SYSTEM_USER_ID,
            createdAt: new Date('2022-06-01T10:03:11.549Z'),
            data: {
                id: '3f4bf713-696c-43a4-8ce7-d6c607108858',
                name: 'flexibleRollout',
                constraints: [],
                parameters: {
                    groupId: 'new-feature',
                    rollout: '67',
                    stickiness: 'random',
                },
            },
            preData: {
                id: '3f4bf713-696c-43a4-8ce7-d6c607108858',
                name: 'flexibleRollout',
                parameters: {
                    groupId: 'new-feature',
                    rollout: '67',
                    stickiness: 'default',
                },
                constraints: [],
            },
            tags: [],
            featureName: 'new-feature',
            project: 'my-other-project',
            environment: 'production',
        },
    ],
    [
        'when constraints and rollout percentage and stickiness changed',
        {
            id: 920,
            type: types_1.FEATURE_STRATEGY_UPDATE,
            createdBy: 'user@company.com',
            createdByUserId: types_1.SYSTEM_USER_ID,
            createdAt: new Date('2022-06-01T10:03:11.549Z'),
            data: {
                id: '3f4bf713-696c-43a4-8ce7-d6c607108858',
                name: 'flexibleRollout',
                constraints: [
                    {
                        values: ['x', 'y'],
                        inverted: false,
                        operator: util_1.IN,
                        contextName: 'appName',
                        caseInsensitive: false,
                    },
                ],
                parameters: {
                    groupId: 'new-feature',
                    rollout: '32',
                    stickiness: 'random',
                },
            },
            preData: {
                id: '3f4bf713-696c-43a4-8ce7-d6c607108858',
                name: 'flexibleRollout',
                parameters: {
                    groupId: 'new-feature',
                    rollout: '67',
                    stickiness: 'default',
                },
                constraints: [],
            },
            tags: [],
            featureName: 'new-feature',
            project: 'my-other-project',
            environment: 'production',
        },
    ],
    [
        'when neither rollout percentage nor stickiness changed',
        {
            id: 920,
            type: types_1.FEATURE_STRATEGY_UPDATE,
            createdBy: 'user@company.com',
            createdByUserId: types_1.SYSTEM_USER_ID,
            createdAt: new Date('2022-06-01T10:03:11.549Z'),
            data: {
                id: '3f4bf713-696c-43a4-8ce7-d6c607108858',
                name: 'flexibleRollout',
                constraints: [],
                parameters: {
                    groupId: 'new-feature',
                    rollout: '67',
                    stickiness: 'default',
                },
            },
            preData: {
                id: '3f4bf713-696c-43a4-8ce7-d6c607108858',
                name: 'flexibleRollout',
                parameters: {
                    groupId: 'new-feature',
                    rollout: '67',
                    stickiness: 'default',
                },
                constraints: [],
            },
            tags: [],
            featureName: 'new-feature',
            project: 'my-other-project',
            environment: 'production',
        },
    ],
    [
        'when strategy added',
        {
            id: 919,
            type: types_1.FEATURE_STRATEGY_ADD,
            createdBy: 'user@company.com',
            createdByUserId: types_1.SYSTEM_USER_ID,
            createdAt: new Date('2022-06-01T10:03:08.290Z'),
            data: {
                id: '3f4bf713-696c-43a4-8ce7-d6c607108858',
                name: 'flexibleRollout',
                constraints: [],
                parameters: {
                    groupId: 'new-feature',
                    rollout: '67',
                    stickiness: 'default',
                },
            },
            preData: null,
            tags: [],
            featureName: 'new-feature',
            project: 'my-other-project',
            environment: 'production',
        },
    ],
    [
        'when strategy removed',
        {
            id: 918,
            type: types_1.FEATURE_STRATEGY_REMOVE,
            createdBy: 'user@company.com',
            createdByUserId: types_1.SYSTEM_USER_ID,
            createdAt: new Date('2022-06-01T10:03:00.229Z'),
            data: null,
            preData: {
                id: '9591090e-acb0-4088-8958-21faaeb7147d',
                name: 'default',
                parameters: {},
                constraints: [],
            },
            tags: [],
            featureName: 'new-feature',
            project: 'my-other-project',
            environment: 'production',
        },
    ],
    ...[util_1.IN, util_1.NOT_IN, util_1.STR_CONTAINS, util_1.STR_STARTS_WITH, util_1.STR_ENDS_WITH].map((operator) => [
        'when default strategy updated',
        {
            id: 39,
            type: types_1.FEATURE_STRATEGY_UPDATE,
            createdBy: 'admin',
            createdByUserId: types_1.SYSTEM_USER_ID,
            createdAt: new Date('2023-02-20T20:23:28.791Z'),
            data: {
                id: 'f2d34aac-52ec-49d2-82d3-08d710e89eaa',
                name: 'default',
                constraints: [
                    {
                        values: ['x', 'y'],
                        inverted: false,
                        operator: operator,
                        contextName: 'appName',
                        caseInsensitive: false,
                    },
                    {
                        values: ['x'],
                        inverted: true,
                        operator: operator,
                        contextName: 'appName',
                        caseInsensitive: false,
                    },
                ],
                parameters: {},
                segments: [],
            },
            preData: {
                id: 'f2d34aac-52ec-49d2-82d3-08d710e89eaa',
                name: 'default',
                segments: [],
                parameters: {},
                constraints: [],
            },
            tags: [],
            featureName: 'aaa',
            project: 'default',
            environment: 'production',
        },
    ]),
    ...[
        util_1.NUM_EQ,
        util_1.NUM_GT,
        util_1.NUM_GTE,
        util_1.NUM_LT,
        util_1.NUM_LTE,
        util_1.DATE_BEFORE,
        util_1.DATE_AFTER,
        util_1.SEMVER_EQ,
        util_1.SEMVER_GT,
        util_1.SEMVER_LT,
    ].map((operator) => [
        `when default strategy updated with numeric constraint ${operator}`,
        {
            id: 39,
            type: types_1.FEATURE_STRATEGY_UPDATE,
            createdBy: 'admin',
            createdAt: new Date('2023-02-20T20:23:28.791Z'),
            createdByUserId: types_1.SYSTEM_USER_ID,
            data: {
                id: 'f2d34aac-52ec-49d2-82d3-08d710e89eaa',
                name: 'default',
                constraints: [],
                parameters: {},
                segments: [],
            },
            preData: {
                id: 'f2d34aac-52ec-49d2-82d3-08d710e89eaa',
                name: 'default',
                segments: [],
                parameters: {},
                constraints: [
                    {
                        value: '4',
                        values: [],
                        inverted: false,
                        operator: operator,
                        contextName: 'appName',
                        caseInsensitive: false,
                    },
                ],
            },
            tags: [],
            featureName: 'aaa',
            project: 'default',
            environment: 'production',
        },
    ]),
    [
        'when userIds changed',
        {
            id: 920,
            type: types_1.FEATURE_STRATEGY_UPDATE,
            createdBy: 'user@company.com',
            createdByUserId: types_1.SYSTEM_USER_ID,
            createdAt: new Date('2022-06-01T10:03:11.549Z'),
            data: {
                name: 'userWithId',
                constraints: [
                    {
                        values: ['x', 'y'],
                        inverted: false,
                        operator: util_1.IN,
                        contextName: 'appName',
                        caseInsensitive: false,
                    },
                ],
                parameters: {
                    userIds: 'a,b',
                },
                sortOrder: 9999,
                id: '9a995d94-5944-4897-a82f-0f7e65c2fb3f',
            },
            preData: {
                name: 'userWithId',
                constraints: [],
                parameters: {
                    userIds: '',
                },
                sortOrder: 9999,
                id: '9a995d94-5944-4897-a82f-0f7e65c2fb3f',
            },
            tags: [],
            featureName: 'new-feature',
            project: 'my-other-project',
            environment: 'production',
        },
    ],
    [
        'when IPs changed',
        {
            id: 920,
            type: types_1.FEATURE_STRATEGY_UPDATE,
            createdBy: 'user@company.com',
            createdByUserId: types_1.SYSTEM_USER_ID,
            createdAt: new Date('2022-06-01T10:03:11.549Z'),
            data: {
                name: 'remoteAddress',
                constraints: [
                    {
                        values: ['x', 'y'],
                        inverted: false,
                        operator: util_1.IN,
                        contextName: 'appName',
                        caseInsensitive: false,
                    },
                ],
                parameters: {
                    IPs: '127.0.0.1',
                },
            },
            preData: {
                name: 'remoteAddress',
                constraints: [],
                parameters: {
                    IPs: '',
                },
            },
            tags: [],
            featureName: 'new-feature',
            project: 'my-other-project',
            environment: 'production',
        },
    ],
    [
        'when host names changed',
        {
            id: 920,
            type: types_1.FEATURE_STRATEGY_UPDATE,
            createdBy: 'user@company.com',
            createdAt: new Date('2022-06-01T10:03:11.549Z'),
            createdByUserId: types_1.SYSTEM_USER_ID,
            data: {
                name: 'applicationHostname',
                constraints: [
                    {
                        values: ['x', 'y'],
                        inverted: false,
                        operator: util_1.IN,
                        contextName: 'appName',
                        caseInsensitive: false,
                    },
                ],
                parameters: {
                    hostNames: 'unleash.com',
                },
            },
            preData: {
                name: 'applicationHostname',
                constraints: [],
                parameters: {
                    hostNames: '',
                },
            },
            tags: [],
            featureName: 'new-feature',
            project: 'my-other-project',
            environment: 'production',
        },
    ],
    [
        'when no specific text for strategy exists yet',
        {
            id: 920,
            type: types_1.FEATURE_STRATEGY_UPDATE,
            createdBy: 'user@company.com',
            createdAt: new Date('2022-06-01T10:03:11.549Z'),
            createdByUserId: types_1.SYSTEM_USER_ID,
            data: {
                name: 'newStrategy',
                constraints: [
                    {
                        values: ['x', 'y'],
                        inverted: false,
                        operator: util_1.IN,
                        contextName: 'appName',
                        caseInsensitive: false,
                    },
                ],
                parameters: {
                    IPs: '127.0.0.1',
                },
            },
            preData: {
                name: 'newStrategy',
                constraints: [],
                parameters: {
                    IPs: '',
                },
            },
            tags: [],
            featureName: 'new-feature',
            project: 'my-other-project',
            environment: 'production',
        },
    ],
    [
        'when change request is scheduled',
        {
            id: 920,
            type: types_1.CHANGE_REQUEST_SCHEDULED,
            createdBy: 'user@company.com',
            createdAt: new Date('2022-06-01T10:03:11.549Z'),
            createdByUserId: types_1.SYSTEM_USER_ID,
            data: {
                changeRequestId: 1,
                scheduledDate: '2024-06-01T10:03:11.549Z',
            },
            preData: {},
            tags: [],
            featureName: 'new-feature',
            project: 'my-other-project',
            environment: 'production',
        },
    ],
    [
        'when scheduled change request succeeds ',
        {
            id: 920,
            type: types_1.CHANGE_REQUEST_SCHEDULED_APPLICATION_SUCCESS,
            createdBy: 'user@company.com',
            createdAt: new Date('2022-06-01T10:03:11.549Z'),
            createdByUserId: types_1.SYSTEM_USER_ID,
            data: {
                changeRequestId: 1,
            },
            preData: {},
            tags: [],
            featureName: 'new-feature',
            project: 'my-other-project',
            environment: 'production',
        },
    ],
    [
        'when scheduled change request fails ',
        {
            id: 920,
            type: types_1.CHANGE_REQUEST_SCHEDULED_APPLICATION_FAILURE,
            createdBy: 'user@company.com',
            createdByUserId: types_1.SYSTEM_USER_ID,
            createdAt: new Date('2022-06-01T10:03:11.549Z'),
            data: {
                changeRequestId: 1,
            },
            preData: {},
            tags: [],
            featureName: 'new-feature',
            project: 'my-other-project',
            environment: 'production',
        },
    ],
    [
        'when a scheduled change request is suspended',
        {
            id: 921,
            type: types_1.CHANGE_REQUEST_SCHEDULE_SUSPENDED,
            createdBy: 'user@company.com',
            createdByUserId: types_1.SYSTEM_USER_ID,
            createdAt: new Date('2022-06-01T10:03:11.549Z'),
            data: {
                changeRequestId: 1,
                reason: 'The user who scheduled this change request (user id: 6) has been deleted from this Unleash instance.',
            },
            preData: {},
            tags: [],
            project: 'my-other-project',
            environment: 'production',
        },
    ],
    [
        'when project archived',
        {
            id: 922,
            type: types_1.PROJECT_ARCHIVED,
            createdBy: 'user@company.com',
            createdByUserId: types_1.SYSTEM_USER_ID,
            createdAt: new Date('2024-11-25T10:33:59.459Z'),
            data: null,
            preData: null,
            tags: [],
            featureName: undefined,
            project: 'my-other-project',
            environment: 'production',
        },
    ],
];
testCases.forEach(([description, event]) => test(`Should format specialised text for events ${description}`, () => {
    const formatter = new feature_event_formatter_md_1.FeatureEventFormatterMd({
        unleashUrl: 'unleashUrl',
    });
    const formattedEvent = formatter.format(event);
    expect(formattedEvent).toMatchSnapshot();
}));
//# sourceMappingURL=feature-event-formatter-md.test.js.map