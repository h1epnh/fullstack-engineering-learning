"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const no_logger_1 = __importDefault(require("../../test/fixtures/no-logger"));
const pat_middleware_1 = __importDefault(require("./pat-middleware"));
const user_1 = __importDefault(require("../types/user"));
const notfound_error_1 = __importDefault(require("../error/notfound-error"));
let config;
beforeEach(() => {
    config = {
        getLogger: no_logger_1.default,
        flagResolver: {
            isEnabled: jest.fn().mockReturnValue(true),
        },
    };
});
test('should not set user if unknown token', async () => {
    // @ts-expect-error wrong type
    const accountService = {
        getAccountByPersonalAccessToken: jest.fn(),
        addPATSeen: jest.fn(),
    };
    const func = (0, pat_middleware_1.default)(config, { accountService });
    const cb = jest.fn();
    const req = {
        header: jest.fn().mockReturnValue('user:some-token'),
        user: undefined,
    };
    await func(req, undefined, cb);
    expect(cb).toHaveBeenCalled();
    expect(req.header).toHaveBeenCalled();
    expect(req.user).toBeFalsy();
});
test('should not set user if token wrong format', async () => {
    // @ts-expect-error wrong type
    const accountService = {
        getAccountByPersonalAccessToken: jest.fn(),
    };
    const func = (0, pat_middleware_1.default)(config, { accountService });
    const cb = jest.fn();
    const req = {
        header: jest.fn().mockReturnValue('token-not-starting-with-user'),
        user: undefined,
    };
    await func(req, undefined, cb);
    expect(accountService.getAccountByPersonalAccessToken).not.toHaveBeenCalled();
    expect(cb).toHaveBeenCalled();
    expect(req.header).toHaveBeenCalled();
    expect(req.user).toBeFalsy();
});
test('should add user if known token', async () => {
    const apiUser = new user_1.default({
        id: 44,
        username: 'my-user',
    });
    // @ts-expect-error wrong type
    const accountService = {
        getAccountByPersonalAccessToken: jest.fn().mockReturnValue(apiUser),
        addPATSeen: jest.fn(),
    };
    const func = (0, pat_middleware_1.default)(config, { accountService });
    const cb = jest.fn();
    const req = {
        header: jest.fn().mockReturnValue('user:some-known-token'),
        user: undefined,
        path: '/api/client',
    };
    await func(req, undefined, cb);
    expect(cb).toHaveBeenCalled();
    expect(req.header).toHaveBeenCalled();
    expect(req.user).toBe(apiUser);
});
test('should call next if accountService throws exception', async () => {
    no_logger_1.default.setMuteError(true);
    // @ts-expect-error wrong types
    const accountService = {
        getAccountByPersonalAccessToken: () => {
            throw new Error('Error occurred');
        },
    };
    const func = (0, pat_middleware_1.default)(config, { accountService });
    const cb = jest.fn();
    const req = {
        header: jest.fn().mockReturnValue('user:some-token'),
        user: undefined,
    };
    await func(req, undefined, cb);
    expect(cb).toHaveBeenCalled();
    no_logger_1.default.setMuteError(false);
});
test('Should not log at error level if user not found', async () => {
    const fakeLogger = {
        debug: () => { },
        info: () => { },
        warn: jest.fn(),
        error: jest.fn(),
        fatal: console.error,
    };
    const conf = {
        getLogger: () => {
            return fakeLogger;
        },
        flagResolver: {
            isEnabled: jest.fn().mockReturnValue(true),
        },
    };
    // @ts-expect-error wrong type
    const accountService = {
        getAccountByPersonalAccessToken: jest.fn().mockImplementation(() => {
            throw new notfound_error_1.default('Could not find pat');
        }),
    };
    const mw = (0, pat_middleware_1.default)(conf, { accountService });
    const cb = jest.fn();
    const req = {
        header: jest.fn().mockReturnValue('user:some-token'),
        user: undefined,
    };
    await mw(req, undefined, cb);
    expect(fakeLogger.error).not.toHaveBeenCalled();
    expect(fakeLogger.warn).toHaveBeenCalled();
});
//# sourceMappingURL=pat-middleware.test.js.map