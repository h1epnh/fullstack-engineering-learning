import { type IUnleashConfig, type IUnleashServices } from '../../types';
import type { Request, Response } from 'express';
import Controller from '../../routes/controller';
import type { IAuthRequest } from '../../routes/unleash-types';
import { type MaintenanceSchema } from '../../openapi/spec/maintenance-schema';
import type { ToggleMaintenanceSchema } from '../../openapi/spec/toggle-maintenance-schema';
export default class MaintenanceController extends Controller {
    private maintenanceService;
    private openApiService;
    private logger;
    constructor(config: IUnleashConfig, { maintenanceService, openApiService, }: Pick<IUnleashServices, 'maintenanceService' | 'openApiService'>);
    toggleMaintenance(req: IAuthRequest<unknown, unknown, ToggleMaintenanceSchema>, res: Response<MaintenanceSchema>): Promise<void>;
    getMaintenance(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=maintenance-controller.d.ts.map