import type { Request, Response } from 'express';
import Controller from '../controller';
import type { IUnleashConfig, IUnleashServices } from '../../types';
import type { IAuthRequest } from '../unleash-types';
import { type AddonSchema } from '../../openapi/spec/addon-schema';
import { type AddonsSchema } from '../../openapi/spec/addons-schema';
import type { AddonCreateUpdateSchema } from '../../openapi/spec/addon-create-update-schema';
import { type BasePaginationParameters } from '../../openapi/spec/base-pagination-parameters';
import { type IntegrationEventsSchema } from '../../openapi/spec/integration-events-schema';
type AddonServices = Pick<IUnleashServices, 'addonService' | 'openApiService' | 'integrationEventsService'>;
declare class AddonController extends Controller {
    private logger;
    private addonService;
    private openApiService;
    private integrationEventsService;
    private flagResolver;
    constructor(config: IUnleashConfig, { addonService, openApiService, integrationEventsService, }: AddonServices);
    getAddons(req: Request, res: Response<AddonsSchema>): Promise<void>;
    getAddon(req: Request<{
        id: number;
    }, any, any, any>, res: Response<AddonSchema>): Promise<void>;
    updateAddon(req: IAuthRequest<{
        id: number;
    }, any, AddonCreateUpdateSchema, any>, res: Response<AddonSchema>): Promise<void>;
    createAddon(req: IAuthRequest<AddonCreateUpdateSchema, any, any, any>, res: Response<AddonSchema>): Promise<void>;
    deleteAddon(req: IAuthRequest<{
        id: number;
    }, any, any, any>, res: Response<void>): Promise<void>;
    getIntegrationEvents(req: IAuthRequest<{
        id: number;
    }, unknown, unknown, BasePaginationParameters>, res: Response<IntegrationEventsSchema>): Promise<void>;
}
export default AddonController;
//# sourceMappingURL=addon.d.ts.map