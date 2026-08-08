"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const make_fetch_happen_1 = __importDefault(require("make-fetch-happen"));
const version_1 = __importDefault(require("../util/version"));
class VersionService {
    constructor({ settingStore }, { getLogger, versionCheck, enterpriseVersion, telemetry, buildDate, }) {
        this.logger = getLogger('lib/services/version-service.js');
        this.settingStore = settingStore;
        this.current = {
            oss: version_1.default,
            enterprise: enterpriseVersion || '',
        };
        this.enabled = versionCheck.enable || false;
        this.telemetryEnabled = telemetry;
        this.versionCheckUrl = versionCheck.url;
        this.isLatest = true;
        this.buildDate = buildDate;
    }
    async readInstanceId() {
        try {
            const { id } = (await this.settingStore.get('instanceInfo')) ?? { id: undefined };
            return id;
        }
        catch (err) {
            this.logger.warn('Could not find instanceInfo', err);
        }
    }
    async getInstanceId() {
        if (!this.instanceId) {
            this.instanceId = await this.readInstanceId();
        }
        return this.instanceId;
    }
    async checkLatestVersion(telemetryDataProvider) {
        const instanceId = await this.getInstanceId();
        this.logger.debug(`Checking for newest version for instanceId=${instanceId}`);
        if (this.enabled) {
            try {
                const versionPayload = {
                    versions: this.current,
                    instanceId: instanceId,
                };
                if (this.telemetryEnabled) {
                    versionPayload.featureInfo = await telemetryDataProvider();
                }
                if (this.versionCheckUrl) {
                    const res = await (0, make_fetch_happen_1.default)(this.versionCheckUrl, {
                        method: 'POST',
                        body: JSON.stringify(versionPayload),
                        headers: { 'Content-Type': 'application/json' },
                    });
                    if (res.ok) {
                        const data = (await res.json());
                        this.latest = {
                            oss: data.versions.oss,
                            enterprise: data.versions.enterprise,
                        };
                        this.isLatest = data.latest;
                    }
                    else {
                        this.logger.info(`Could not check newest version. Status: ${res.status}`);
                    }
                }
                else {
                    this.logger.info('Had no URL to check newest version');
                }
            }
            catch (err) {
                this.logger.info('Could not check newest version', err);
            }
        }
    }
    async getVersionInfo() {
        const instanceId = await this.getInstanceId();
        return {
            current: this.current,
            latest: this.latest || {},
            isLatest: this.isLatest,
            instanceId: instanceId || 'unresolved-instance-id',
            buildDate: this.buildDate,
        };
    }
}
exports.default = VersionService;
//# sourceMappingURL=version-service.js.map