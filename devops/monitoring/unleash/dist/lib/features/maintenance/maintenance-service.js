"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const memoizee_1 = __importDefault(require("memoizee"));
const maintenance_settings_1 = require("../../types/settings/maintenance-settings");
const date_fns_1 = require("date-fns");
class MaintenanceService {
    constructor(config, settingService) {
        this.config = config;
        this.logger = config.getLogger('services/maintenance-service.ts');
        this.settingService = settingService;
        this.resolveMaintenance = (0, memoizee_1.default)(async () => (await this.getMaintenanceSetting()).enabled, {
            promise: true,
            maxAge: (0, date_fns_1.minutesToMilliseconds)(1),
        });
    }
    async isMaintenanceMode() {
        try {
            return (this.config.flagResolver.isEnabled('maintenanceMode') ||
                (await this.resolveMaintenance()));
        }
        catch (e) {
            this.logger.warn('Error checking maintenance mode', e);
            return false;
        }
    }
    async getMaintenanceSetting() {
        return this.settingService.getWithDefault(maintenance_settings_1.maintenanceSettingsKey, {
            enabled: false,
        });
    }
    async toggleMaintenanceMode(setting, auditUser) {
        //@ts-ignore
        this.resolveMaintenance.clear();
        return this.settingService.insert(maintenance_settings_1.maintenanceSettingsKey, setting, auditUser, false);
    }
}
exports.default = MaintenanceService;
module.exports = MaintenanceService;
//# sourceMappingURL=maintenance-service.js.map