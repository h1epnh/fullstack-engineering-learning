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
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareAndLogPostgresVersion = compareAndLogPostgresVersion;
const semver_1 = __importStar(require("semver"));
const MIN_SUPPORTED_POSTGRES_VERSION = semver_1.default.parse('13.0.0');
async function compareAndLogPostgresVersion(config, settingStore) {
    const logger = config.getLogger('server-impl/postgresVersionWarner');
    const postgresVersion = await settingStore.postgresVersion();
    const pgSemVer = semver_1.default.coerce(postgresVersion); // Postgres usually reports Major.Minor, semver needs a patch version included in string
    if (pgSemVer !== null && (0, semver_1.lt)(pgSemVer, MIN_SUPPORTED_POSTGRES_VERSION)) {
        logger.error(`You are running an unsupported version of PostgreSQL: ${postgresVersion}. You'll have to upgrade to Postgres 13 or newer to continue getting our support.`);
    }
    else {
        logger.info(`Running PostgreSQL version ${postgresVersion}.`);
    }
}
//# sourceMappingURL=postgres-version-checker.js.map