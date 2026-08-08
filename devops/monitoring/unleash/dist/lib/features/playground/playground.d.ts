import type { Request, Response } from 'express';
import type { IUnleashConfig } from '../../types/option';
import type { IUnleashServices } from '../../types/services';
import Controller from '../../routes/controller';
import { type PlaygroundResponseSchema } from '../../openapi/spec/playground-response-schema';
import type { PlaygroundRequestSchema } from '../../openapi/spec/playground-request-schema';
import type { AdvancedPlaygroundRequestSchema } from '../../openapi/spec/advanced-playground-request-schema';
import type { AdvancedPlaygroundResponseSchema } from '../../openapi/spec/advanced-playground-response-schema';
import type { IAuthRequest } from '../../routes/unleash-types';
export default class PlaygroundController extends Controller {
    private openApiService;
    private playgroundService;
    private flagResolver;
    constructor(config: IUnleashConfig, { openApiService, playgroundService, }: Pick<IUnleashServices, 'openApiService' | 'playgroundService'>);
    evaluateContext(req: Request<any, any, PlaygroundRequestSchema>, res: Response<PlaygroundResponseSchema>): Promise<void>;
    evaluateAdvancedContext(req: IAuthRequest<any, any, AdvancedPlaygroundRequestSchema>, res: Response<AdvancedPlaygroundResponseSchema>): Promise<void>;
}
//# sourceMappingURL=playground.d.ts.map