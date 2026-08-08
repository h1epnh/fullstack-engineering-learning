"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOutdatedSdk = void 0;
exports.findOutdatedSDKs = findOutdatedSDKs;
const semver_1 = __importDefault(require("semver"));
const config = {
    'unleash-client-node': '5.3.2',
    'unleash-client-java': '9.2.0',
    'unleash-client-go': '4.1.0',
    'unleash-client-python': '5.11.0',
    'unleash-client-ruby': '5.0.0',
    'unleash-client-dotnet': '4.1.3',
    'unleash-client-php': '2.3.0',
};
const isOutdatedSdk = (sdkVersion) => {
    if (!sdkVersion)
        return false;
    const [sdkName, version] = sdkVersion.split(':');
    const minVersion = config[sdkName];
    return Boolean(minVersion && semver_1.default.valid(version) && semver_1.default.lt(version, minVersion));
};
exports.isOutdatedSdk = isOutdatedSdk;
function findOutdatedSDKs(sdkVersions) {
    const uniqueSdkVersions = Array.from(new Set(sdkVersions));
    return uniqueSdkVersions.filter(exports.isOutdatedSdk);
}
//# sourceMappingURL=findOutdatedSdks.js.map