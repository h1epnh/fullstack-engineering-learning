"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fast_check_1 = __importDefault(require("fast-check"));
const arbitraries_test_1 = require("../../../arbitraries.test");
const playground_request_schema_test_1 = require("../../../../lib/openapi/spec/playground-request-schema.test");
const database_init_1 = __importDefault(require("../../helpers/database-init"));
const test_helper_1 = require("../../helpers/test-helper");
const model_1 = require("../../../../lib/types/model");
const no_logger_1 = __importDefault(require("../../../fixtures/no-logger"));
const api_token_1 = require("../../../../lib/types/models/api-token");
let app;
let db;
let token;
beforeAll(async () => {
    db = await (0, database_init_1.default)('playground_api_serial', no_logger_1.default);
    app = await (0, test_helper_1.setupAppWithCustomConfig)(db.stores, {}, db.rawDatabase);
    const { apiTokenService } = app.services;
    token = await apiTokenService.createApiTokenWithProjects({
        type: api_token_1.ApiTokenType.ADMIN,
        tokenName: 'tester',
        environment: api_token_1.ALL,
        projects: [api_token_1.ALL],
    });
});
afterAll(async () => {
    await app.destroy();
    await db.destroy();
});
const reset = (database) => async () => {
    await database.stores.featureToggleStore.deleteAll();
    await database.stores.featureStrategiesStore.deleteAll();
    await database.stores.environmentStore.deleteAll();
};
const toArray = (x) => [x];
const testParams = {
    numRuns: 1, // Default is 100 which is not good for E2E tests
    interruptAfterTimeLimit: 4000, // Default timeout in Jest 5000ms
    markInterruptAsFailure: false, // When set to false, timeout during initial cases will not be considered as a failure
};
const playgroundRequest = async (testApp, secret, request) => {
    const { body, } = await testApp.request
        .post('/api/admin/playground')
        .set('Authorization', secret)
        .send(request)
        .expect(200);
    return body;
};
describe('Playground API E2E', () => {
    // utility function for seeding the database before runs
    const seedDatabase = async (database, features, environment) => {
        // create environment if necessary
        await database.stores.environmentStore
            .create({
            name: environment,
            type: 'development',
            enabled: true,
        })
            .catch(() => {
            // purposefully left empty: env creation may fail if the
            // env already exists, and because of the async nature
            // of things, this is the easiest way to make it work.
        });
        return Promise.all(features.map(async (feature) => {
            // create feature
            const toggle = await database.stores.featureToggleStore.create(feature.project, {
                ...feature,
                createdAt: undefined,
                variants: null,
            });
            // enable/disable the feature in environment
            await database.stores.featureEnvironmentStore.addEnvironmentToFeature(feature.name, environment, feature.enabled);
            await database.stores.featureToggleStore.saveVariants(feature.project, feature.name, [
                ...(feature.variants ?? []).map((variant) => ({
                    ...variant,
                    weightType: model_1.WeightType.VARIABLE,
                    stickiness: 'default',
                })),
            ]);
            // assign strategies
            await Promise.all((feature.strategies || []).map((strategy, index) => database.stores.featureStrategiesStore.createStrategyFeatureEnv({
                parameters: {},
                constraints: [],
                ...strategy,
                featureName: feature.name,
                environment,
                strategyName: strategy.name,
                disabled: !!(index % 2),
                projectId: feature.project,
            })));
            return toggle;
        }));
    };
    it('Returned features should be a subset of the provided flags', async () => {
        await fast_check_1.default.assert(fast_check_1.default
            .asyncProperty((0, arbitraries_test_1.clientFeatures)({ minLength: 1 }), (0, playground_request_schema_test_1.generate)(), async (features, request) => {
            // seed the database
            await seedDatabase(db, features, request.environment);
            const body = await playgroundRequest(app, token.secret, request);
            // the returned list should always be a subset of the provided list
            expect(features.map((feature) => feature.name)).toEqual(expect.arrayContaining(body.features.map((feature) => feature.name)));
        })
            .afterEach(reset(db)), testParams);
    });
    it('should filter the list according to the input parameters', async () => {
        await fast_check_1.default.assert(fast_check_1.default
            .asyncProperty((0, playground_request_schema_test_1.generate)(), (0, arbitraries_test_1.clientFeatures)({ minLength: 1 }), async (request, features) => {
            await seedDatabase(db, features, request.environment);
            // get a subset of projects that exist among the features
            const [projects] = fast_check_1.default.sample(fast_check_1.default.oneof(fast_check_1.default.constant(api_token_1.ALL), fast_check_1.default.uniqueArray(fast_check_1.default.constantFrom(...features.map((feature) => feature.project)))));
            request.projects = projects;
            // create a list of features that can be filtered
            // pass in args that should filter the list
            const body = await playgroundRequest(app, token.secret, request);
            switch (projects) {
                case api_token_1.ALL:
                    // no features have been filtered out
                    return body.features.length === features.length;
                case []:
                    // no feature should be without a project
                    return body.features.length === 0;
                default:
                    // every feature should be in one of the prescribed projects
                    return body.features.every((feature) => projects.includes(feature.projectId));
            }
        })
            .afterEach(reset(db)), testParams);
    });
    it('should map project and name correctly', async () => {
        // note: we're not testing `isEnabled` and `variant` here, because
        // that's the SDK's responsibility and it's tested elsewhere.
        await fast_check_1.default.assert(fast_check_1.default
            .asyncProperty((0, arbitraries_test_1.clientFeatures)(), fast_check_1.default.context(), async (features, ctx) => {
            await seedDatabase(db, features, 'default');
            const body = await playgroundRequest(app, token.secret, {
                projects: api_token_1.ALL,
                environment: 'default',
                context: {
                    appName: 'playground-test',
                },
            });
            const createDict = (xs) => xs.reduce((acc, next) => ({ ...acc, [next.name]: next }), {});
            const mappedToggles = createDict(body.features);
            if (features.length !== body.features.length) {
                ctx.log(`I expected the number of mapped flags (${body.features.length}) to be the same as the number of created toggles (${features.length}), but that was not the case.`);
                return false;
            }
            return features.every((feature) => {
                const mapped = mappedToggles[feature.name];
                expect(mapped).toBeTruthy();
                return (feature.name === mapped.name &&
                    feature.project === mapped.projectId);
            });
        })
            .afterEach(reset(db)), testParams);
    });
    it('isEnabledInCurrentEnvironment should always match feature.enabled', async () => {
        await fast_check_1.default.assert(fast_check_1.default
            .asyncProperty((0, arbitraries_test_1.clientFeatures)(), fast_check_1.default.context(), async (features, ctx) => {
            await seedDatabase(db, features, 'default');
            const body = await playgroundRequest(app, token.secret, {
                projects: api_token_1.ALL,
                environment: 'default',
                context: {
                    appName: 'playground-test',
                },
            });
            const createDict = (xs) => xs.reduce((acc, next) => ({ ...acc, [next.name]: next }), {});
            const mappedToggles = createDict(body.features);
            ctx.log(JSON.stringify(features));
            ctx.log(JSON.stringify(mappedToggles));
            return features.every((feature) => feature.enabled ===
                mappedToggles[feature.name]
                    .isEnabledInCurrentEnvironment);
        })
            .afterEach(reset(db)), testParams);
    });
    describe('context application', () => {
        it('applies appName constraints correctly', async () => {
            const appNames = ['A', 'B', 'C'];
            // Choose one of the app names at random
            const appName = () => fast_check_1.default.constantFrom(...appNames);
            // generate a list of features that are active only for a specific
            // app name (constraints). Each feature will be constrained to a
            // random appName from the list above.
            const constrainedFeatures = () => fast_check_1.default.uniqueArray(fast_check_1.default
                .tuple((0, arbitraries_test_1.clientFeature)(), fast_check_1.default.record({
                name: fast_check_1.default.constant('default'),
                constraints: fast_check_1.default
                    .record({
                    values: appName().map(toArray),
                    inverted: fast_check_1.default.constant(false),
                    operator: fast_check_1.default.constant('IN'),
                    contextName: fast_check_1.default.constant('appName'),
                    caseInsensitive: fast_check_1.default.boolean(),
                })
                    .map(toArray),
            }))
                .map(([feature, strategy]) => ({
                ...feature,
                enabled: true,
                strategies: [strategy],
            })), { selector: (feature) => feature.name });
            await fast_check_1.default.assert(fast_check_1.default
                .asyncProperty(fast_check_1.default
                .tuple(appName(), (0, playground_request_schema_test_1.generate)())
                .map(([generatedAppName, req]) => ({
                ...req,
                // generate a context that has appName set to
                // one of the above values
                context: {
                    appName: generatedAppName,
                    environment: 'default',
                },
            })), constrainedFeatures(), async (req, features) => {
                await seedDatabase(db, features, req.environment);
                const body = await playgroundRequest(app, token.secret, req);
                const shouldBeEnabled = features.reduce((acc, next) => ({
                    ...acc,
                    [next.name]: 
                    // @ts-ignore
                    next.strategies[0].constraints[0]
                        .values[0] === req.context.appName,
                }), {});
                return body.features.every((feature) => feature.isEnabled ===
                    shouldBeEnabled[feature.name]);
            })
                .afterEach(reset(db)), {
                ...testParams,
                examples: [],
            });
        });
        it('applies dynamic context fields correctly', async () => {
            const contextValue = () => fast_check_1.default.oneof(fast_check_1.default.record({
                name: fast_check_1.default.constant('remoteAddress'),
                value: fast_check_1.default.ipV4(),
                operator: fast_check_1.default.constant('IN'),
            }), fast_check_1.default.record({
                name: fast_check_1.default.constant('sessionId'),
                value: fast_check_1.default.uuid(),
                operator: fast_check_1.default.constant('IN'),
            }), fast_check_1.default.record({
                name: fast_check_1.default.constant('userId'),
                value: fast_check_1.default.emailAddress(),
                operator: fast_check_1.default.constant('IN'),
            }));
            const constrainedFeatures = () => fast_check_1.default.uniqueArray(fast_check_1.default
                .tuple((0, arbitraries_test_1.clientFeature)(), contextValue().map((context) => ({
                name: 'default',
                constraints: [
                    {
                        values: [context.value],
                        inverted: false,
                        operator: context.operator,
                        contextName: context.name,
                        caseInsensitive: false,
                    },
                ],
            })))
                .map(([feature, strategy]) => ({
                ...feature,
                enabled: true,
                strategies: [strategy],
            })), { selector: (feature) => feature.name });
            await fast_check_1.default.assert(fast_check_1.default
                .asyncProperty(fast_check_1.default
                .tuple(contextValue(), (0, playground_request_schema_test_1.generate)())
                .map(([generatedContextValue, req]) => ({
                ...req,
                // generate a context that has a dynamic context field set to
                // one of the above values
                context: {
                    ...req.context,
                    [generatedContextValue.name]: generatedContextValue.value,
                },
            })), constrainedFeatures(), async (req, features) => {
                await seedDatabase(db, features, 'default');
                const body = await playgroundRequest(app, token.secret, req);
                const contextField = Object.values(req.context)[0];
                const shouldBeEnabled = features.reduce((acc, next) => ({
                    ...acc,
                    [next.name]: next.strategies[0].constraints[0]
                        .values[0] === contextField,
                }), {});
                return body.features.every((feature) => feature.isEnabled ===
                    shouldBeEnabled[feature.name]);
            })
                .afterEach(reset(db)), testParams);
        });
        it('applies custom context fields correctly', async () => {
            const environment = 'default';
            const contextValue = () => fast_check_1.default.record({
                name: fast_check_1.default.constantFrom('Context field A', 'Context field B'),
                value: fast_check_1.default.constantFrom('Context value 1', 'Context value 2'),
            });
            const constrainedFeatures = () => fast_check_1.default.uniqueArray(fast_check_1.default
                .tuple((0, arbitraries_test_1.clientFeature)(), contextValue().map((context) => ({
                name: 'default',
                constraints: [
                    {
                        values: [context.value],
                        inverted: false,
                        operator: 'IN',
                        contextName: context.name,
                        caseInsensitive: false,
                    },
                ],
            })))
                .map(([feature, strategy]) => ({
                ...feature,
                enabled: true,
                strategies: [strategy],
            })), { selector: (feature) => feature.name });
            // generate a constraint to be used for the context and a request
            // that contains that constraint value.
            const constraintAndRequest = () => fast_check_1.default
                .tuple(contextValue(), fast_check_1.default.constantFrom('top', 'nested'), (0, playground_request_schema_test_1.generate)())
                .map(([generatedContextValue, placement, req]) => {
                const request = placement === 'top'
                    ? {
                        ...req,
                        environment,
                        context: {
                            ...req.context,
                            [generatedContextValue.name]: generatedContextValue.value,
                        },
                    }
                    : {
                        ...req,
                        environment,
                        context: {
                            ...req.context,
                            properties: {
                                [generatedContextValue.name]: generatedContextValue.value,
                            },
                        },
                    };
                return {
                    generatedContextValue,
                    request,
                };
            });
            await fast_check_1.default.assert(fast_check_1.default
                .asyncProperty(constraintAndRequest(), constrainedFeatures(), fast_check_1.default.context(), async ({ generatedContextValue, request }, features, ctx) => {
                await seedDatabase(db, features, environment);
                const body = await playgroundRequest(app, token.secret, request);
                const shouldBeEnabled = features.reduce((acc, next) => {
                    const constraint = next.strategies[0].constraints[0];
                    return {
                        ...acc,
                        [next.name]: constraint.contextName ===
                            generatedContextValue.name &&
                            constraint.values[0] ===
                                generatedContextValue.value,
                    };
                }, {});
                ctx.log(`Got these ${JSON.stringify(body.features)} and I expect them to be enabled/disabled: ${JSON.stringify(shouldBeEnabled)}`);
                return body.features.every((feature) => feature.isEnabled ===
                    shouldBeEnabled[feature.name]);
            })
                .afterEach(reset(db)), testParams);
        });
        it('context is applied to variant checks', async () => {
            const environment = 'development';
            const featureName = 'feature-name';
            const customContextFieldName = 'customField';
            const customContextValue = 'customValue';
            const features = [
                {
                    project: 'any-project',
                    strategies: [
                        {
                            name: 'default',
                            constraints: [
                                {
                                    contextName: customContextFieldName,
                                    operator: 'IN',
                                    values: [customContextValue],
                                },
                            ],
                        },
                    ],
                    stale: false,
                    enabled: true,
                    name: featureName,
                    type: 'experiment',
                    variants: [
                        {
                            name: 'a',
                            weight: 1000,
                            weightType: 'variable',
                            stickiness: 'default',
                            overrides: [],
                        },
                    ],
                },
            ];
            await seedDatabase(db, features, environment);
            const request = {
                projects: api_token_1.ALL,
                environment,
                context: {
                    appName: 'playground',
                    [customContextFieldName]: customContextValue,
                },
            };
            const body = await playgroundRequest(app, token.secret, request);
            // when enabled, this toggle should have one of the variants
            expect(body.features[0].variant.name).toBe('a');
        });
    });
});
//# sourceMappingURL=playground.e2e.test.js.map