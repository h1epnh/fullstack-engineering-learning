import type { Request, Response } from 'express';
import type { IUnleashConfig } from '../../types/option';
import type { IUnleashServices } from '../../types';
import Controller from '../controller';
import { type ConstraintSchema } from '../../openapi';
export default class ConstraintController extends Controller {
    private featureService;
    private openApiService;
    private readonly logger;
    constructor(config: IUnleashConfig, { featureToggleService, openApiService, }: Pick<IUnleashServices, 'featureToggleService' | 'openApiService'>);
    validateConstraint(req: Request<void, void, ConstraintSchema>, res: Response): Promise<void>;
}
//# sourceMappingURL=constraints.d.ts.map