"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nock_1 = __importDefault(require("nock"));
const store_1 = __importDefault(require("../../test/fixtures/store"));
const version_1 = __importDefault(require("../util/version"));
const no_logger_1 = __importDefault(require("../../test/fixtures/no-logger"));
const version_service_1 = __importDefault(require("./version-service"));
const random_id_1 = require("../util/random-id");
beforeAll(() => {
    nock_1.default.disableNetConnect();
});
afterAll(() => {
    nock_1.default.enableNetConnect();
});
const fakeTelemetryData = {
    featureToggles: 0,
    users: 0,
    projects: 1,
    contextFields: 3,
    groups: 0,
    roles: 5,
    customRootRoles: 0,
    customRootRolesInUse: 0,
    environments: 1,
    segments: 0,
    strategies: 3,
    SAMLenabled: false,
    OIDCenabled: false,
    featureExports: 0,
    featureImports: 0,
    customStrategies: 3,
    customStrategiesInUse: 0,
    instanceId: '1460588e-d5f4-4ac2-9962-c8631f6b8dad',
    versionOSS: '6.4.1',
    versionEnterprise: '',
    activeUsers30: 0,
    activeUsers60: 0,
    activeUsers90: 0,
    productionChanges30: 0,
    productionChanges60: 0,
    productionChanges90: 0,
    postgresVersion: '17.1 (Debian 17.1-1.pgdg120+1)',
};
test('yields current versions', async () => {
    const url = `https://${(0, random_id_1.randomId)()}.example.com`;
    const stores = (0, store_1.default)();
    const latest = {
        oss: '5.0.0',
        enterprise: '5.0.0',
    };
    const scope = (0, nock_1.default)(url)
        .post('/')
        .reply(() => [
        200,
        JSON.stringify({
            latest: false,
            versions: latest,
        }),
    ]);
    const service = new version_service_1.default(stores, {
        getLogger: no_logger_1.default,
        versionCheck: { url, enable: true },
        telemetry: true,
    });
    await service.checkLatestVersion(() => Promise.resolve(fakeTelemetryData));
    const versionInfo = await service.getVersionInfo();
    expect(scope.isDone()).toEqual(true);
    expect(versionInfo.current.oss).toBe(version_1.default);
    expect(versionInfo.current.enterprise).toBeFalsy();
    expect(versionInfo.latest.oss).toBe(latest.oss);
    expect(versionInfo.latest.enterprise).toBe(latest.enterprise);
});
test('supports setting enterprise version as well', async () => {
    const url = `https://${(0, random_id_1.randomId)()}.example.com`;
    const stores = (0, store_1.default)();
    const enterpriseVersion = '3.7.0';
    const latest = {
        oss: '4.0.0',
        enterprise: '4.0.0',
    };
    const scope = (0, nock_1.default)(url)
        .post('/')
        .reply(() => [
        200,
        JSON.stringify({
            latest: false,
            versions: latest,
        }),
    ]);
    const service = new version_service_1.default(stores, {
        getLogger: no_logger_1.default,
        versionCheck: { url, enable: true },
        enterpriseVersion,
        telemetry: true,
    });
    await service.checkLatestVersion(() => Promise.resolve(fakeTelemetryData));
    const versionInfo = await service.getVersionInfo();
    expect(scope.isDone()).toEqual(true);
    expect(versionInfo.current.oss).toBe(version_1.default);
    expect(versionInfo.current.enterprise).toBe(enterpriseVersion);
    expect(versionInfo.latest.oss).toBe(latest.oss);
    expect(versionInfo.latest.enterprise).toBe(latest.enterprise);
});
test('if version check is not enabled should not make any calls', async () => {
    const url = `https://${(0, random_id_1.randomId)()}.example.com`;
    const stores = (0, store_1.default)();
    const enterpriseVersion = '3.7.0';
    const latest = {
        oss: '4.0.0',
        enterprise: '4.0.0',
    };
    const scope = (0, nock_1.default)(url)
        .get('/')
        .reply(() => [
        200,
        JSON.stringify({
            latest: false,
            versions: latest,
        }),
    ]);
    const service = new version_service_1.default(stores, {
        getLogger: no_logger_1.default,
        versionCheck: { url, enable: false },
        enterpriseVersion,
        telemetry: true,
    });
    await service.checkLatestVersion(() => Promise.resolve(fakeTelemetryData));
    const versionInfo = await service.getVersionInfo();
    expect(scope.isDone()).toEqual(false);
    expect(versionInfo.current.oss).toBe(version_1.default);
    expect(versionInfo.current.enterprise).toBe(enterpriseVersion);
    expect(versionInfo.latest.oss).toBeFalsy();
    expect(versionInfo.latest.enterprise).toBeFalsy();
    nock_1.default.cleanAll();
});
test('sets featureinfo', async () => {
    const url = `https://${(0, random_id_1.randomId)()}.example.com`;
    const stores = (0, store_1.default)();
    const enterpriseVersion = '4.0.0';
    const latest = {
        oss: '4.0.0',
        enterprise: '4.0.0',
    };
    const scope = (0, nock_1.default)(url)
        .post('/', (body) => body.featureInfo &&
        body.featureInfo.featureToggles ===
            fakeTelemetryData.featureToggles &&
        body.featureInfo.environments ===
            fakeTelemetryData.environments)
        .reply(() => [
        200,
        JSON.stringify({
            latest: true,
            versions: latest,
        }),
    ]);
    const service = new version_service_1.default(stores, {
        getLogger: no_logger_1.default,
        versionCheck: { url, enable: true },
        enterpriseVersion,
        telemetry: true,
    });
    await service.checkLatestVersion(() => Promise.resolve(fakeTelemetryData));
    expect(scope.isDone()).toEqual(true);
    nock_1.default.cleanAll();
});
test('counts toggles', async () => {
    const url = `https://${(0, random_id_1.randomId)()}.example.com`;
    const stores = (0, store_1.default)();
    const enterpriseVersion = '4.0.0';
    const latest = {
        oss: '4.0.0',
        enterprise: '4.0.0',
    };
    const scope = (0, nock_1.default)(url)
        .post('/', (body) => body.featureInfo &&
        body.featureInfo.featureToggles ===
            fakeTelemetryData.featureToggles &&
        body.featureInfo.environments ===
            fakeTelemetryData.environments &&
        body.featureInfo.customStrategies ===
            fakeTelemetryData.customStrategies &&
        body.featureInfo.customStrategiesInUse ===
            fakeTelemetryData.customRootRolesInUse &&
        body.featureInfo.OIDCenabled === fakeTelemetryData.OIDCenabled)
        .reply(() => [
        200,
        JSON.stringify({
            latest: true,
            versions: latest,
        }),
    ]);
    const service = new version_service_1.default(stores, {
        getLogger: no_logger_1.default,
        versionCheck: { url, enable: true },
        enterpriseVersion,
        telemetry: true,
    });
    await service.checkLatestVersion(() => Promise.resolve(fakeTelemetryData));
    expect(scope.isDone()).toEqual(true);
    nock_1.default.cleanAll();
});
test('counts custom strategies', async () => {
    const url = `https://${(0, random_id_1.randomId)()}.example.com`;
    const stores = (0, store_1.default)();
    const enterpriseVersion = '4.0.0';
    const latest = {
        oss: '4.0.0',
        enterprise: '4.0.0',
    };
    const scope = (0, nock_1.default)(url)
        .post('/', (body) => body.featureInfo &&
        body.featureInfo.featureToggles ===
            fakeTelemetryData.featureToggles &&
        body.featureInfo.environments ===
            fakeTelemetryData.environments &&
        body.featureInfo.customStrategies ===
            fakeTelemetryData.customStrategies &&
        body.featureInfo.customStrategiesInUse ===
            fakeTelemetryData.customRootRolesInUse &&
        body.featureInfo.OIDCenabled === fakeTelemetryData.OIDCenabled)
        .reply(() => [
        200,
        JSON.stringify({
            latest: true,
            versions: latest,
        }),
    ]);
    const service = new version_service_1.default(stores, {
        getLogger: no_logger_1.default,
        versionCheck: { url, enable: true },
        enterpriseVersion,
        telemetry: true,
    });
    await service.checkLatestVersion(() => Promise.resolve(fakeTelemetryData));
    expect(scope.isDone()).toEqual(true);
    nock_1.default.cleanAll();
});
test('counts active users', async () => {
    const url = `https://${(0, random_id_1.randomId)()}.example.com`;
    const stores = (0, store_1.default)();
    const enterpriseVersion = '4.0.0';
    const latest = {
        oss: '4.0.0',
        enterprise: '4.0.0',
    };
    const scope = (0, nock_1.default)(url)
        .post('/', (body) => body.featureInfo &&
        body.featureInfo.activeUsers30 ===
            fakeTelemetryData.activeUsers30 &&
        body.featureInfo.activeUsers60 ===
            fakeTelemetryData.activeUsers60 &&
        body.featureInfo.activeUsers90 ===
            fakeTelemetryData.activeUsers90)
        .reply(() => [
        200,
        JSON.stringify({
            latest: true,
            versions: latest,
        }),
    ]);
    const service = new version_service_1.default(stores, {
        getLogger: no_logger_1.default,
        versionCheck: { url, enable: true },
        enterpriseVersion,
        telemetry: true,
    });
    await service.checkLatestVersion(() => Promise.resolve(fakeTelemetryData));
    expect(scope.isDone()).toEqual(true);
    nock_1.default.cleanAll();
});
test('Counts production changes', async () => {
    const url = `https://${(0, random_id_1.randomId)()}.example.com`;
    const stores = (0, store_1.default)();
    const enterpriseVersion = '4.0.0';
    const latest = {
        oss: '4.0.0',
        enterprise: '4.0.0',
    };
    const scope = (0, nock_1.default)(url)
        .post('/', (body) => body.featureInfo &&
        body.featureInfo.productionChanges30 ===
            fakeTelemetryData.productionChanges30 &&
        body.featureInfo.productionChanges60 ===
            fakeTelemetryData.productionChanges60 &&
        body.featureInfo.productionChanges90 ===
            fakeTelemetryData.productionChanges90)
        .reply(() => [
        200,
        JSON.stringify({
            latest: true,
            versions: latest,
        }),
    ]);
    const service = new version_service_1.default(stores, {
        getLogger: no_logger_1.default,
        versionCheck: { url, enable: true },
        enterpriseVersion,
        telemetry: true,
    });
    await service.checkLatestVersion(() => Promise.resolve(fakeTelemetryData));
    expect(scope.isDone()).toEqual(true);
    nock_1.default.cleanAll();
});
//# sourceMappingURL=version-service.test.js.map