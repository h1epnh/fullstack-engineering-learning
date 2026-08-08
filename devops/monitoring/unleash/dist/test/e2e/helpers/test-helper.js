"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertFeatureEnvironmentsLastSeen = exports.insertLastSeenAt = void 0;
exports.setupApp = setupApp;
exports.setupAppWithoutSupertest = setupAppWithoutSupertest;
exports.setupAppWithCustomConfig = setupAppWithCustomConfig;
exports.setupAppWithAuth = setupAppWithAuth;
exports.setupAppWithCustomAuth = setupAppWithCustomAuth;
exports.setupAppWithBaseUrl = setupAppWithBaseUrl;
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../../lib/app"));
const test_config_1 = require("../../config/test-config");
const option_1 = require("../../../lib/types/option");
const services_1 = require("../../../lib/services");
const session_db_1 = __importDefault(require("../../../lib/middleware/session-db"));
const types_1 = require("../../../lib/types");
const util_1 = require("../../../lib/util");
process.env.NODE_ENV = 'test';
function httpApis(request, config) {
    const base = config.server.baseUriPath || '';
    return {
        addStrategyToFeatureEnv: (postData, envName, featureName, project = types_1.DEFAULT_PROJECT, expectStatusCode = 200) => {
            const url = `${base}/api/admin/projects/${project}/features/${featureName}/environments/${envName}/strategies`;
            return request.post(url).send(postData).expect(expectStatusCode);
        },
        createFeature: (feature, project = types_1.DEFAULT_PROJECT, expectedResponseCode = 201) => {
            let body = feature;
            if (typeof feature === 'string') {
                body = {
                    name: feature,
                };
            }
            return request
                .post(`${base}/api/admin/projects/${project}/features`)
                .send(body)
                .set('Content-Type', 'application/json')
                .expect(expectedResponseCode);
        },
        getFeatures(name, expectedResponseCode = 200) {
            const featuresUrl = `/api/admin/features${name ? `/${name}` : ''}`;
            return request
                .get(featuresUrl)
                .set('Content-Type', 'application/json')
                .expect(expectedResponseCode);
        },
        getProjectFeatures(project = types_1.DEFAULT_PROJECT, name, expectedResponseCode = 200) {
            const featuresUrl = `/api/admin/projects/${project}/features${name ? `/${name}` : ''}`;
            return request
                .get(featuresUrl)
                .set('Content-Type', 'application/json')
                .expect(expectedResponseCode);
        },
        archiveFeature(name, project = types_1.DEFAULT_PROJECT, expectedResponseCode = 202) {
            return request
                .delete(`${base}/api/admin/projects/${project}/features/${name}`)
                .set('Content-Type', 'application/json')
                .expect(expectedResponseCode);
        },
        createContextField(contextField, expectedResponseCode = 201) {
            return request
                .post(`${base}/api/admin/context`)
                .send(contextField)
                .expect(expectedResponseCode);
        },
        linkProjectToEnvironment(project, environment = util_1.DEFAULT_ENV, expectedResponseCode = 200) {
            return request
                .post(`${base}/api/admin/projects/${project}/environments`)
                .send({
                environment,
            })
                .expect(expectedResponseCode);
        },
        importToggles(importPayload, expectedResponseCode = 200) {
            return request
                .post('/api/admin/features-batch/import')
                .send(importPayload)
                .set('Content-Type', 'application/json')
                .expect(expectedResponseCode);
        },
        addDependency(child, parent, project = types_1.DEFAULT_PROJECT, expectedResponseCode = 200) {
            return request
                .post(`/api/admin/projects/${project}/features/${child}/dependencies`)
                .send(typeof parent === 'string' ? { feature: parent } : parent)
                .set('Content-Type', 'application/json')
                .expect(expectedResponseCode);
        },
        addTag(feature, tag, expectedResponseCode = 201) {
            return request
                .post(`/api/admin/features/${feature}/tags`)
                .send({ type: tag.type, value: tag.value })
                .set('Content-Type', 'application/json')
                .expect(expectedResponseCode);
        },
        enableFeature(feature, environment, project = 'default', expectedResponseCode = 200) {
            return request
                .post(`/api/admin/projects/${project}/features/${feature}/environments/${environment}/on`)
                .expect(expectedResponseCode);
        },
        favoriteFeature(feature, project = 'default', expectedResponseCode = 200) {
            return request
                .post(`/api/admin/projects/${project}/features/${feature}/favorites`)
                .set('Content-Type', 'application/json')
                .expect(expectedResponseCode);
        },
        createSegment(postData, expectedResponseCode = 201) {
            return request
                .post(`/api/admin/segments`)
                .send(postData)
                .set('Content-Type', 'application/json')
                .expect(expectedResponseCode);
        },
        deleteSegment(segmentId, expectedResponseCode = 204) {
            return request
                .delete(`/api/admin/segments/${segmentId}`)
                .set('Content-Type', 'application/json')
                .expect(expectedResponseCode);
        },
        updateSegment(segmentId, postData, expectStatusCode = 204) {
            return request
                .put(`/api/admin/segments/${segmentId}`)
                .send(postData)
                .expect(expectStatusCode);
        },
        getRecordedEvents(project = null, expectedResponseCode = 200) {
            return request
                .post('/api/admin/events/search')
                .send({ project, query: '', limit: 50, offset: 0 })
                .set('Content-Type', 'application/json')
                .expect(expectedResponseCode);
        },
    };
}
async function createApp(stores, adminAuthentication = option_1.IAuthType.NONE, preHook, customOptions, db) {
    const config = (0, test_config_1.createTestConfig)({
        authentication: {
            type: adminAuthentication,
            customAuthHandler: preHook,
        },
        server: {
            unleashUrl: 'http://localhost:4242',
        },
        disableScheduler: true,
        ...{
            ...customOptions,
            experimental: {
                ...(customOptions?.experimental ?? {}),
                flags: {
                    strictSchemaValidation: true,
                    ...(customOptions?.experimental?.flags ?? {}),
                },
            },
        },
    });
    const services = (0, services_1.createServices)(stores, config, db);
    // @ts-expect-error We don't have a database for sessions here.
    const unleashSession = (0, session_db_1.default)(config, undefined);
    const app = await (0, app_1.default)(config, stores, services, unleashSession, db);
    const request = supertest_1.default.agent(app);
    const destroy = async () => {
        // iterate on the keys of services and if the services at that key has a function called destroy then call it
        await Promise.all(Object.keys(services).map(async (key) => {
            if (services[key].destroy) {
                await services[key].destroy();
            }
        }));
    };
    // TODO: use create from server-impl instead?
    return {
        request,
        destroy,
        services,
        config,
        ...httpApis(request, config),
    };
}
async function setupApp(stores) {
    return createApp(stores);
}
async function setupAppWithoutSupertest(stores, customOptions, db) {
    const config = (0, test_config_1.createTestConfig)({
        authentication: {
            type: option_1.IAuthType.DEMO,
        },
        server: {
            unleashUrl: 'http://localhost:4242',
        },
        disableScheduler: true,
        ...{
            ...customOptions,
            experimental: {
                ...(customOptions?.experimental ?? {}),
                flags: {
                    strictSchemaValidation: true,
                    ...(customOptions?.experimental?.flags ?? {}),
                },
            },
        },
    });
    const services = (0, services_1.createServices)(stores, config, db);
    // @ts-expect-error we don't have a db for the session here
    const unleashSession = (0, session_db_1.default)(config, undefined);
    const app = await (0, app_1.default)(config, stores, services, unleashSession, db);
    const server = app.listen(0);
    const destroy = async () => {
        // iterate on the keys of services and if the services at that key has a function called destroy then call it
        await Promise.all(Object.keys(services).map(async (key) => {
            if (services[key].destroy) {
                await services[key].destroy();
            }
        }));
        await server.close();
    };
    return {
        server,
        destroy,
        services,
        config,
    };
}
async function setupAppWithCustomConfig(stores, 
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
customOptions, db) {
    return createApp(stores, undefined, undefined, customOptions, db);
}
async function setupAppWithAuth(stores, 
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
customOptions, db) {
    return createApp(stores, option_1.IAuthType.DEMO, undefined, customOptions, db);
}
async function setupAppWithCustomAuth(stores, preHook, 
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
customOptions, db) {
    return createApp(stores, option_1.IAuthType.CUSTOM, preHook, customOptions, db);
}
async function setupAppWithBaseUrl(stores, baseUriPath = '/hosted') {
    return createApp(stores, undefined, undefined, {
        server: {
            unleashUrl: 'http://localhost:4242',
            baseUriPath,
        },
    });
}
const insertLastSeenAt = async (featureName, db, environment = 'default', date = '2023-10-01T12:34:56.000Z') => {
    try {
        await db.raw(`INSERT INTO last_seen_at_metrics (feature_name, environment, last_seen_at)
        VALUES ('${featureName}', '${environment}', '${date}');`);
        return date;
    }
    catch (err) {
        console.log(err);
        return Promise.resolve('');
    }
};
exports.insertLastSeenAt = insertLastSeenAt;
const insertFeatureEnvironmentsLastSeen = async (featureName, db, environment = 'default', date = '2022-05-01T12:34:56.000Z') => {
    await db.raw(`
        INSERT INTO feature_environments (feature_name, environment, last_seen_at, enabled)
        VALUES ('${featureName}', '${environment}', '${date}', true)
        ON CONFLICT (feature_name, environment) DO UPDATE SET last_seen_at = '${date}', enabled = true;
    `);
    return date;
};
exports.insertFeatureEnvironmentsLastSeen = insertFeatureEnvironmentsLastSeen;
//# sourceMappingURL=test-helper.js.map