"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rbac_middleware_1 = __importDefault(require("./rbac-middleware"));
const user_1 = __importDefault(require("../types/user"));
const perms = __importStar(require("../types/permissions"));
const test_config_1 = require("../../test/config/test-config");
const api_user_1 = __importDefault(require("../types/api-user"));
const fake_feature_toggle_store_1 = __importDefault(require("../features/feature-toggle/fakes/fake-feature-toggle-store"));
const api_token_1 = require("../types/models/api-token");
const types_1 = require("../types");
const fake_segment_store_1 = __importDefault(require("../../test/fixtures/fake-segment-store"));
let config;
let featureToggleStore;
let segmentStore;
beforeEach(() => {
    featureToggleStore = new fake_feature_toggle_store_1.default();
    segmentStore = new fake_segment_store_1.default();
    config = (0, test_config_1.createTestConfig)();
});
test('should add checkRbac to request', () => {
    const accessService = {
        hasPermission: jest.fn(),
    };
    const func = (0, rbac_middleware_1.default)(config, { featureToggleStore, segmentStore }, accessService);
    const cb = jest.fn();
    const req = jest.fn();
    func(req, undefined, cb);
    // @ts-ignore
    expect(req.checkRbac).toBeTruthy();
    // @ts-ignore
    expect(typeof req.checkRbac).toBe('function');
});
test('should give api-user ADMIN permission', async () => {
    const accessService = {
        hasPermission: jest.fn(),
    };
    const func = (0, rbac_middleware_1.default)(config, { featureToggleStore, segmentStore }, accessService);
    const cb = jest.fn();
    const req = {
        user: new api_user_1.default({
            tokenName: 'api',
            permissions: [perms.ADMIN],
            project: '*',
            environment: '*',
            type: api_token_1.ApiTokenType.ADMIN,
            secret: 'a',
        }),
    };
    func(req, undefined, cb);
    const hasAccess = await req.checkRbac(perms.ADMIN);
    expect(hasAccess).toBe(true);
});
describe('ADMIN tokens should have user id -1337 when only passed through rbac-middleware', () => {
    /// Will be -42 (ADMIN_USER.id) when we have the api-token-middleware run first
    test('Should give ADMIN api-user userid -1337 (SYSTEM_USER_ID)', async () => {
        const accessService = {
            hasPermission: jest.fn(),
        };
        const func = (0, rbac_middleware_1.default)(config, { featureToggleStore, segmentStore }, accessService);
        const cb = jest.fn();
        const req = {
            user: new api_user_1.default({
                tokenName: 'api',
                permissions: [perms.ADMIN],
                project: '*',
                environment: '*',
                type: api_token_1.ApiTokenType.ADMIN,
                secret: 'a',
            }),
        };
        func(req, undefined, cb);
        const hasAccess = await req.checkRbac(perms.ADMIN);
        expect(req.user.id).toBe(types_1.SYSTEM_USER_ID);
        expect(hasAccess).toBe(true);
    });
    /// Will be -42 (ADMIN_USER.id) when we have the api-token-middleware run first
    test('Also when checking against permission NONE, userid should still be -1337', async () => {
        const accessService = {
            hasPermission: jest.fn(),
        };
        const func = (0, rbac_middleware_1.default)(config, { featureToggleStore, segmentStore }, accessService);
        const cb = jest.fn();
        const req = {
            user: new api_user_1.default({
                tokenName: 'api',
                permissions: [perms.ADMIN],
                project: '*',
                environment: '*',
                type: api_token_1.ApiTokenType.ADMIN,
                secret: 'a',
            }),
        };
        func(req, undefined, cb);
        const hasAccess = await req.checkRbac(perms.NONE);
        expect(req.user.id).toBe(types_1.SYSTEM_USER_ID);
        expect(hasAccess).toBe(true);
    });
});
test('should not give api-user ADMIN permission', async () => {
    const accessService = {
        hasPermission: jest.fn(),
    };
    const func = (0, rbac_middleware_1.default)(config, { featureToggleStore, segmentStore }, accessService);
    const cb = jest.fn();
    const req = {
        user: new api_user_1.default({
            tokenName: 'api',
            permissions: [perms.CLIENT],
            project: '*',
            environment: '*',
            type: api_token_1.ApiTokenType.CLIENT,
            secret: 'a',
        }),
    };
    func(req, undefined, cb);
    const hasAccess = await req.checkRbac(perms.ADMIN);
    expect(hasAccess).toBe(false);
    expect(accessService.hasPermission).toHaveBeenCalledTimes(0);
});
test('should not allow user to miss userId', async () => {
    jest.spyOn(global.console, 'error').mockImplementation(() => jest.fn());
    const accessService = {
        hasPermission: jest.fn(),
    };
    const func = (0, rbac_middleware_1.default)(config, { featureToggleStore, segmentStore }, accessService);
    const cb = jest.fn();
    const req = {
        user: {
            username: 'user',
        },
    };
    func(req, undefined, cb);
    const hasAccess = await req.checkRbac(perms.ADMIN);
    expect(hasAccess).toBe(false);
});
test('should return false for missing user', async () => {
    jest.spyOn(global.console, 'error').mockImplementation(() => jest.fn());
    const accessService = {
        hasPermission: jest.fn(),
    };
    const func = (0, rbac_middleware_1.default)(config, { featureToggleStore, segmentStore }, accessService);
    const cb = jest.fn();
    const req = {};
    func(req, undefined, cb);
    const hasAccess = await req.checkRbac(perms.ADMIN);
    expect(hasAccess).toBe(false);
    expect(accessService.hasPermission).toHaveBeenCalledTimes(0);
});
test('should verify permission for root resource', async () => {
    const accessService = {
        hasPermission: jest.fn(),
    };
    const func = (0, rbac_middleware_1.default)(config, { featureToggleStore, segmentStore }, accessService);
    const cb = jest.fn();
    const req = {
        user: new user_1.default({
            username: 'user',
            id: 1,
        }),
        params: {},
    };
    func(req, undefined, cb);
    await req.checkRbac(perms.ADMIN);
    expect(accessService.hasPermission).toHaveBeenCalledTimes(1);
    expect(accessService.hasPermission).toHaveBeenCalledWith(req.user, [perms.ADMIN], undefined, undefined);
});
test('should lookup projectId from params', async () => {
    const accessService = {
        hasPermission: jest.fn(),
    };
    const func = (0, rbac_middleware_1.default)(config, { featureToggleStore, segmentStore }, accessService);
    const cb = jest.fn();
    const req = {
        user: new user_1.default({
            username: 'user',
            id: 1,
        }),
        params: {
            projectId: 'some-proj',
        },
    };
    func(req, undefined, cb);
    await req.checkRbac(perms.UPDATE_PROJECT);
    expect(accessService.hasPermission).toHaveBeenCalledWith(req.user, [perms.UPDATE_PROJECT], req.params.projectId, undefined);
});
test('should lookup projectId from feature flag', async () => {
    const projectId = 'some-project-33';
    const featureName = 'some-feature-flag';
    const accessService = {
        hasPermission: jest.fn(),
    };
    featureToggleStore.getProjectId = jest.fn().mockReturnValue(projectId);
    const func = (0, rbac_middleware_1.default)(config, { featureToggleStore, segmentStore }, accessService);
    const cb = jest.fn();
    const req = {
        user: new user_1.default({
            username: 'user',
            id: 1,
        }),
        params: {
            featureName,
        },
    };
    func(req, undefined, cb);
    await req.checkRbac(perms.UPDATE_FEATURE);
    expect(accessService.hasPermission).toHaveBeenCalledWith(req.user, [perms.UPDATE_FEATURE], projectId, undefined);
});
test('should lookup projectId from data', async () => {
    const projectId = 'some-project-33';
    const featureName = 'some-feature-flag';
    const accessService = {
        hasPermission: jest.fn(),
    };
    const func = (0, rbac_middleware_1.default)(config, { featureToggleStore, segmentStore }, accessService);
    const cb = jest.fn();
    const req = {
        user: new user_1.default({
            username: 'user',
            id: 1,
        }),
        params: {},
        body: {
            featureName,
            project: projectId,
        },
    };
    func(req, undefined, cb);
    await req.checkRbac(perms.CREATE_FEATURE);
    expect(accessService.hasPermission).toHaveBeenCalledWith(req.user, [perms.CREATE_FEATURE], projectId, undefined);
});
test('Does not double check permission if not changing project when updating flag', async () => {
    const oldProjectId = 'some-project-34';
    const featureName = 'some-feature-flag';
    const accessService = {
        hasPermission: jest.fn().mockReturnValue(true),
    };
    featureToggleStore.getProjectId = jest.fn().mockReturnValue(oldProjectId);
    const func = (0, rbac_middleware_1.default)(config, { featureToggleStore, segmentStore }, accessService);
    const cb = jest.fn();
    const req = {
        user: new user_1.default({ username: 'user', id: 1 }),
        params: { featureName },
        body: { featureName, project: oldProjectId },
    };
    func(req, undefined, cb);
    await req.checkRbac(perms.UPDATE_FEATURE);
    expect(accessService.hasPermission).toHaveBeenCalledTimes(1);
    expect(accessService.hasPermission).toHaveBeenCalledWith(req.user, [perms.UPDATE_FEATURE], oldProjectId, undefined);
});
test('CREATE_TAG_TYPE does not need projectId', async () => {
    const accessService = {
        hasPermission: jest.fn().mockReturnValue(true),
    };
    const func = (0, rbac_middleware_1.default)(config, { featureToggleStore, segmentStore }, accessService);
    const cb = jest.fn();
    const req = {
        user: new user_1.default({ username: 'user', id: 1 }),
        params: {},
        body: { name: 'new-tag-type', description: 'New tag type for testing' },
    };
    func(req, undefined, cb);
    await req.checkRbac(perms.CREATE_TAG_TYPE);
    expect(accessService.hasPermission).toHaveBeenCalledTimes(1);
    expect(accessService.hasPermission).toHaveBeenCalledWith(req.user, [perms.CREATE_TAG_TYPE], undefined, undefined);
});
test('UPDATE_TAG_TYPE does not need projectId', async () => {
    const accessService = {
        hasPermission: jest.fn().mockReturnValue(true),
    };
    const func = (0, rbac_middleware_1.default)(config, { featureToggleStore, segmentStore }, accessService);
    const cb = jest.fn();
    const req = {
        user: new user_1.default({ username: 'user', id: 1 }),
        params: {},
        body: { name: 'new-tag-type', description: 'New tag type for testing' },
    };
    func(req, undefined, cb);
    await req.checkRbac(perms.UPDATE_TAG_TYPE);
    expect(accessService.hasPermission).toHaveBeenCalledTimes(1);
    expect(accessService.hasPermission).toHaveBeenCalledWith(req.user, [perms.UPDATE_TAG_TYPE], undefined, undefined);
});
test('DELETE_TAG_TYPE does not need projectId', async () => {
    const accessService = {
        hasPermission: jest.fn().mockReturnValue(true),
    };
    const func = (0, rbac_middleware_1.default)(config, { featureToggleStore, segmentStore }, accessService);
    const cb = jest.fn();
    const req = {
        user: new user_1.default({ username: 'user', id: 1 }),
        params: {},
        body: { name: 'new-tag-type', description: 'New tag type for testing' },
    };
    func(req, undefined, cb);
    await req.checkRbac(perms.DELETE_TAG_TYPE);
    expect(accessService.hasPermission).toHaveBeenCalledTimes(1);
    expect(accessService.hasPermission).toHaveBeenCalledWith(req.user, [perms.DELETE_TAG_TYPE], undefined, undefined);
});
test('should not expect featureName for UPDATE_FEATURE when projectId specified', async () => {
    const projectId = 'some-project-33';
    const accessService = {
        hasPermission: jest.fn(),
    };
    const func = (0, rbac_middleware_1.default)(config, { featureToggleStore, segmentStore }, accessService);
    const cb = jest.fn();
    const req = {
        user: new user_1.default({
            username: 'user',
            id: 1,
        }),
        params: {},
        body: {
            project: projectId,
        },
    };
    func(req, undefined, cb);
    await req.checkRbac(perms.UPDATE_FEATURE);
    expect(accessService.hasPermission).toHaveBeenCalledWith(req.user, [perms.UPDATE_FEATURE], projectId, undefined);
});
//# sourceMappingURL=rbac-middleware.test.js.map