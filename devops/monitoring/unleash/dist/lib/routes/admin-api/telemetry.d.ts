import type { Response } from 'express';
import type { OpenApiService } from '../../services';
import type { IAuthRequest } from '../unleash-types';
import type { IUnleashConfig } from '../../types/option';
import Controller from '../controller';
import type { IUnleashServices } from '../../types';
import { type TelemetrySettingsSchema } from '../../openapi/spec/telemetry-settings-schema';
declare class TelemetryController extends Controller {
    openApiService: OpenApiService;
    constructor(config: IUnleashConfig, { openApiService }: Pick<IUnleashServices, 'openApiService'>);
    getTelemetrySettings(req: IAuthRequest, res: Response<TelemetrySettingsSchema>): Promise<void>;
}
export default TelemetryController;
//# sourceMappingURL=telemetry.d.ts.map