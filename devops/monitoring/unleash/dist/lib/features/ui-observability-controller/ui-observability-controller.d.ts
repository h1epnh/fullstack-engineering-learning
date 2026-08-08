import type { Request, Response } from 'express';
import Controller from '../../routes/controller';
import type { IUnleashConfig } from '../../types/option';
import type { IUnleashServices } from '../../types/services';
export declare class UiObservabilityController extends Controller {
    private logger;
    constructor(config: IUnleashConfig, { openApiService }: Pick<IUnleashServices, 'openApiService'>);
    recordUiError(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=ui-observability-controller.d.ts.map