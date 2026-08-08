"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientSpecService = void 0;
const semver_1 = __importDefault(require("semver"));
const bad_data_error_1 = __importDefault(require("../error/bad-data-error"));
const semver_2 = require("../util/semver");
class ClientSpecService {
    constructor(config) {
        this.clientSpecHeader = 'Unleash-Client-Spec';
        this.clientSpecFeatures = {
            segments: (0, semver_2.mustParseStrictSemVer)('4.2.0'),
            deltaApi: (0, semver_2.mustParseStrictSemVer)('5.2.0'),
        };
        this.logger = config.getLogger('services/capability-service.ts');
    }
    requestSupportsSpec(request, feature) {
        return this.versionSupportsSpec(feature, request.header(this.clientSpecHeader));
    }
    versionSupportsSpec(feature, version) {
        if (!version) {
            return false;
        }
        const parsedVersion = (0, semver_2.parseStrictSemVer)(version);
        if (!parsedVersion && !/^\d/.test(version)) {
            throw new bad_data_error_1.default(`Invalid prefix in the ${this.clientSpecHeader} header: "${version}".`);
        }
        if (!parsedVersion) {
            throw new bad_data_error_1.default(`Invalid SemVer in the ${this.clientSpecHeader} header: "${version}".`);
        }
        return semver_1.default.gte(parsedVersion, this.clientSpecFeatures[feature]);
    }
}
exports.ClientSpecService = ClientSpecService;
//# sourceMappingURL=client-spec-service.js.map