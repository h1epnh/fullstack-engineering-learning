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
const no_logger_1 = __importDefault(require("../../test/fixtures/no-logger"));
const permissions_1 = require("../types/permissions");
const test_config_1 = require("../../test/config/test-config");
const api_user_1 = __importDefault(require("../types/api-user"));
const api_token_1 = require("../types/models/api-token");
const api_token_middleware_1 = __importStar(require("./api-token-middleware"));
let config;
beforeEach(() => {
    config = (0, test_config_1.createTestConfig)({
        getLogger: no_logger_1.default,
        authentication: {
            enableApiToken: true,
        },
    });
});
test('should not do anything if request does not contain a authorization', async () => {
    const apiTokenService = {
        getUserForToken: jest.fn(),
    };
    const func = (0, api_token_middleware_1.default)(config, { apiTokenService });
    const cb = jest.fn();
    const req = {
        header: jest.fn(),
    };
    await func(req, undefined, cb);
    expect(req.header).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledTimes(1);
});
test('should not add user if unknown token', async () => {
    const apiTokenService = {
        getUserForToken: jest.fn(),
    };
    const func = (0, api_token_middleware_1.default)(config, { apiTokenService });
    const cb = jest.fn();
    const req = {
        header: jest.fn().mockReturnValue('some-token'),
        user: undefined,
    };
    await func(req, undefined, cb);
    expect(cb).toHaveBeenCalled();
    expect(req.header).toHaveBeenCalled();
    expect(req.user).toBeFalsy();
});
test('should not make database query when provided PAT format', async () => {
    const apiTokenService = {
        getUserForToken: jest.fn(),
    };
    const func = (0, api_token_middleware_1.default)(config, { apiTokenService });
    const cb = jest.fn();
    const req = {
        header: jest.fn().mockReturnValue('user:asdkjsdhg3'),
        user: undefined,
    };
    await func(req, undefined, cb);
    expect(apiTokenService.getUserForToken).not.toHaveBeenCalled();
    expect(req.header).toHaveBeenCalled();
    expect(cb).toHaveBeenCalled();
    expect(req.user).toBeFalsy();
});
test('should add user if known token', async () => {
    const apiUser = new api_user_1.default({
        tokenName: 'default',
        permissions: [permissions_1.CLIENT],
        project: api_token_1.ALL,
        environment: api_token_1.ALL,
        type: api_token_1.ApiTokenType.CLIENT,
        secret: 'a',
    });
    const apiTokenService = {
        getUserForToken: jest.fn().mockReturnValue(apiUser),
    };
    const func = (0, api_token_middleware_1.default)(config, { apiTokenService });
    const cb = jest.fn();
    const req = {
        header: jest.fn().mockReturnValue('some-known-token'),
        user: undefined,
        path: '/api/client',
    };
    await func(req, undefined, cb);
    expect(cb).toHaveBeenCalled();
    expect(req.header).toHaveBeenCalled();
    expect(req.user).toBe(apiUser);
});
test('should not add user if not /api/client', async () => {
    expect.assertions(5);
    const apiUser = new api_user_1.default({
        tokenName: 'default',
        permissions: [permissions_1.CLIENT],
        project: api_token_1.ALL,
        environment: api_token_1.ALL,
        type: api_token_1.ApiTokenType.CLIENT,
        secret: 'a',
    });
    const apiTokenService = {
        getUserForToken: jest.fn().mockReturnValue(apiUser),
    };
    const func = (0, api_token_middleware_1.default)(config, { apiTokenService });
    const cb = jest.fn();
    const res = {
        status: (code) => ({
            send: (data) => {
                expect(code).toEqual(403);
                expect(data).toEqual({ message: api_token_middleware_1.TOKEN_TYPE_ERROR_MESSAGE });
            },
        }),
    };
    const req = {
        header: jest.fn().mockReturnValue('some-known-token'),
        user: undefined,
        path: '/api/admin',
    };
    await func(req, res, cb);
    expect(cb).not.toHaveBeenCalled();
    expect(req.header).toHaveBeenCalled();
    expect(req.user).toBeUndefined();
});
test('should not add user if disabled', async () => {
    const apiUser = new api_user_1.default({
        tokenName: 'default',
        permissions: [permissions_1.CLIENT],
        project: api_token_1.ALL,
        environment: api_token_1.ALL,
        type: api_token_1.ApiTokenType.CLIENT,
        secret: 'a',
    });
    const apiTokenService = {
        getUserForToken: jest.fn().mockReturnValue(apiUser),
    };
    const disabledConfig = (0, test_config_1.createTestConfig)({
        getLogger: no_logger_1.default,
        authentication: {
            enableApiToken: false,
            createAdminUser: false,
        },
    });
    const func = (0, api_token_middleware_1.default)(disabledConfig, { apiTokenService });
    const cb = jest.fn();
    const req = {
        header: jest.fn().mockReturnValue('some-known-token'),
        user: undefined,
    };
    const send = jest.fn();
    const res = {
        status: () => {
            return {
                send: send,
            };
        },
    };
    await func(req, res, cb);
    expect(send).not.toHaveBeenCalled();
    expect(cb).toHaveBeenCalled();
    expect(req.user).toBeFalsy();
});
test('should call next if apiTokenService throws', async () => {
    no_logger_1.default.setMuteError(true);
    const apiTokenService = {
        getUserForToken: () => {
            throw new Error('hi there, i am stupid');
        },
    };
    const func = (0, api_token_middleware_1.default)(config, { apiTokenService });
    const cb = jest.fn();
    const req = {
        header: jest.fn().mockReturnValue('some-token'),
        user: undefined,
    };
    await func(req, undefined, cb);
    expect(cb).toHaveBeenCalled();
    no_logger_1.default.setMuteError(false);
});
test('should call next if apiTokenService throws x2', async () => {
    jest.spyOn(global.console, 'error').mockImplementation(() => jest.fn());
    const apiTokenService = {
        getUserForToken: () => {
            throw new Error('hi there, i am stupid');
        },
    };
    const func = (0, api_token_middleware_1.default)(config, { apiTokenService });
    const cb = jest.fn();
    const req = {
        header: jest.fn().mockReturnValue('some-token'),
        user: undefined,
    };
    await func(req, undefined, cb);
    expect(cb).toHaveBeenCalled();
});
test('should add user if client token and /edge/metrics', async () => {
    const apiUser = new api_user_1.default({
        tokenName: 'default',
        permissions: [permissions_1.CLIENT],
        project: api_token_1.ALL,
        environment: api_token_1.ALL,
        type: api_token_1.ApiTokenType.CLIENT,
        secret: 'a',
    });
    const apiTokenService = {
        getUserForToken: jest.fn().mockReturnValue(apiUser),
    };
    const func = (0, api_token_middleware_1.default)(config, { apiTokenService });
    const cb = jest.fn();
    const req = {
        header: jest.fn().mockReturnValue('some-known-token'),
        user: undefined,
        path: '/edge/metrics',
        method: 'POST',
    };
    await func(req, undefined, cb);
    expect(cb).toHaveBeenCalled();
    expect(req.header).toHaveBeenCalled();
    expect(req.user).toBe(apiUser);
});
//# sourceMappingURL=api-token-middleware.test.js.map