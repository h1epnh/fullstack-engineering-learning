"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const test_config_1 = require("../test/config/test-config");
const compression_1 = __importDefault(require("compression"));
jest.mock('compression', () => jest.fn().mockImplementation(() => (req, res, next) => {
    next();
}));
jest.mock('./routes', () => class Index {
    router() {
        return express_1.default.Router();
    }
});
const app_1 = __importDefault(require("./app"));
test('should not throw when valid config', async () => {
    const config = (0, test_config_1.createTestConfig)();
    // @ts-expect-error - We're passing in empty stores and services
    const app = await (0, app_1.default)(config, {}, {});
    expect(typeof app.listen).toBe('function');
});
test('should call preHook', async () => {
    let called = 0;
    const config = (0, test_config_1.createTestConfig)({
        preHook: () => {
            called++;
        },
    });
    // @ts-expect-error - We're passing in empty stores and services
    await (0, app_1.default)(config, {}, {});
    expect(called).toBe(1);
});
test('should call preRouterHook', async () => {
    let called = 0;
    const config = (0, test_config_1.createTestConfig)({
        preRouterHook: () => {
            called++;
        },
    });
    // @ts-expect-error - We're passing in empty stores and services
    await (0, app_1.default)(config, {}, {});
    expect(called).toBe(1);
});
describe('compression middleware', () => {
    beforeAll(() => {
        compression_1.default.mockClear();
    });
    afterEach(() => {
        compression_1.default.mockClear();
    });
    test.each([
        {
            disableCompression: true,
            expectCompressionEnabled: false,
        },
        {
            disableCompression: false,
            expectCompressionEnabled: true,
        },
        {
            disableCompression: null,
            expectCompressionEnabled: true,
        },
        {
            disableCompression: undefined,
            expectCompressionEnabled: true,
        },
    ])(`should expect the compression middleware to be $expectCompressionEnabled when configInput.server.disableCompression is $disableCompression`, async ({ disableCompression, expectCompressionEnabled }) => {
        const config = (0, test_config_1.createTestConfig)({
            server: {
                disableCompression: disableCompression,
            },
        });
        // @ts-expect-error - We're passing in empty stores and services
        await (0, app_1.default)(config, {}, {});
        expect(compression_1.default).toBeCalledTimes(+expectCompressionEnabled);
    });
});
//# sourceMappingURL=app.test.js.map