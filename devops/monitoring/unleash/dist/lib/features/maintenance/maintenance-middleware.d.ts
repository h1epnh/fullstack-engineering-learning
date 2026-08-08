import type { IUnleashConfig } from '../../types';
import type MaintenanceService from './maintenance-service';
export declare const MAINTENANCE_MODE_ENABLED = "Unleash is currently in maintenance mode.";
declare const maintenanceMiddleware: ({ getLogger }: Pick<IUnleashConfig, "getLogger" | "flagResolver">, maintenanceService: MaintenanceService) => any;
export default maintenanceMiddleware;
//# sourceMappingURL=maintenance-middleware.d.ts.map