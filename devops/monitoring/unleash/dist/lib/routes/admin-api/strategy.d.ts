import type { IUnleashConfig } from '../../types/option';
import type { IUnleashServices } from '../../types/services';
import Controller from '../controller';
import type { Request, Response } from 'express';
import type { IAuthRequest } from '../unleash-types';
import { type StrategySchema } from '../../openapi/spec/strategy-schema';
import { type StrategiesSchema } from '../../openapi/spec/strategies-schema';
import type { CreateStrategySchema } from '../../openapi/spec/create-strategy-schema';
import type { UpdateStrategySchema } from '../../openapi/spec/update-strategy-schema';
declare class StrategyController extends Controller {
    private logger;
    private strategyService;
    private openApiService;
    constructor(config: IUnleashConfig, { strategyService, openApiService, }: Pick<IUnleashServices, 'strategyService' | 'openApiService'>);
    getAllStrategies(req: Request, res: Response<StrategiesSchema>): Promise<void>;
    getStrategy(req: Request, res: Response<StrategySchema>): Promise<void>;
    removeStrategy(req: IAuthRequest, res: Response): Promise<void>;
    createStrategy(req: IAuthRequest<unknown, unknown, CreateStrategySchema>, res: Response<StrategySchema>): Promise<void>;
    updateStrategy(req: IAuthRequest<{
        name: string;
    }, UpdateStrategySchema>, res: Response<void>): Promise<void>;
    deprecateStrategy(req: IAuthRequest, res: Response<void>): Promise<void>;
    reactivateStrategy(req: IAuthRequest, res: Response<void>): Promise<void>;
}
export default StrategyController;
//# sourceMappingURL=strategy.d.ts.map