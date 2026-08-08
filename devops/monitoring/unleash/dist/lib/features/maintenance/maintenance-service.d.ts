import type { IAuditUser, IUnleashConfig } from '../../types';
import type SettingService from '../../services/setting-service';
import type { MaintenanceSchema } from '../../openapi/spec/maintenance-schema';
export interface IMaintenanceStatus {
    isMaintenanceMode(): Promise<boolean>;
}
export default class MaintenanceService implements IMaintenanceStatus {
    private config;
    private logger;
    private settingService;
    private resolveMaintenance;
    constructor(config: IUnleashConfig, settingService: SettingService);
    isMaintenanceMode(): Promise<boolean>;
    getMaintenanceSetting(): Promise<MaintenanceSchema>;
    toggleMaintenanceMode(setting: MaintenanceSchema, auditUser: IAuditUser): Promise<void>;
}
//# sourceMappingURL=maintenance-service.d.ts.map