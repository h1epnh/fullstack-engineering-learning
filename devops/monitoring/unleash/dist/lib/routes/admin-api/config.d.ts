import type { Response } from 'express';
import type { AuthedRequest } from '../../types/core';
import type { IUnleashServices } from '../../types/services';
import { type IUnleashConfig } from '../../types/option';
import Controller from '../controller';
import { type UiConfigSchema } from '../../openapi/spec/ui-config-schema';
import type { IAuthRequest } from '../unleash-types';
import type { SetUiConfigSchema } from '../../openapi/spec/set-ui-config-schema';
import type { SetCorsSchema } from '../../openapi/spec/set-cors-schema';
declare class ConfigController extends Controller {
    private versionService;
    private settingService;
    private frontendApiService;
    private emailService;
    private clientInstanceService;
    private sessionService;
    private maintenanceService;
    private flagResolver;
    private readonly openApiService;
    constructor(config: IUnleashConfig, { versionService, settingService, emailService, openApiService, frontendApiService, maintenanceService, clientInstanceService, sessionService, }: Pick<IUnleashServices, 'versionService' | 'settingService' | 'emailService' | 'openApiService' | 'frontendApiService' | 'maintenanceService' | 'clientInstanceService' | 'sessionService'>);
    getUiConfig(req: AuthedRequest, res: Response<UiConfigSchema>): Promise<void>;
    setUiConfig(req: IAuthRequest<void, void, SetUiConfigSchema>, res: Response<string>): Promise<void>;
    setCors(req: IAuthRequest<void, void, SetCorsSchema>, res: Response<string>): Promise<void>;
}
export default ConfigController;
//# sourceMappingURL=config.d.ts.map