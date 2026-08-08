"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestConfig = createTestConfig;
const deepmerge_1 = __importDefault(require("deepmerge"));
const option_1 = require("../../lib/types/option");
const no_logger_1 = __importDefault(require("../fixtures/no-logger"));
const create_config_1 = require("../../lib/create-config");
const path_1 = __importDefault(require("path"));
function mergeAll(objects) {
    return deepmerge_1.default.all(objects.filter((i) => i));
}
function createTestConfig(config) {
    no_logger_1.default.setMuteError(true);
    const testConfig = {
        getLogger: no_logger_1.default,
        authentication: { type: option_1.IAuthType.NONE, createAdminUser: false },
        server: { secret: 'really-secret' },
        session: { db: false },
        versionCheck: { enable: false },
        disableScheduler: true,
        clientFeatureCaching: {
            enabled: false,
        },
        experimental: {
            flags: {
                embedProxy: true,
                embedProxyFrontend: true,
            },
        },
        publicFolder: path_1.default.join(__dirname, '../examples'),
    };
    const options = mergeAll([testConfig, config || {}]);
    return (0, create_config_1.createConfig)(options);
}
//# sourceMappingURL=test-config.js.map