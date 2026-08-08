import type { Response } from 'express';
import Controller from '../../../routes/controller';
import type { IFlagResolver, IUnleashServices } from '../../../types';
import type { IUnleashConfig } from '../../../types/option';
import type { Logger } from '../../../logger';
import type ClientInstanceService from './instance-service';
import type { IAuthRequest } from '../../../server-impl';
import type { OpenApiService } from '../../../services/openapi-service';
import type { ClientApplicationSchema } from '../../../openapi/spec/client-application-schema';
export default class RegisterController extends Controller {
    logger: Logger;
    clientInstanceService: ClientInstanceService;
    openApiService: OpenApiService;
    flagResolver: IFlagResolver;
    constructor({ clientInstanceService, openApiService, }: Pick<IUnleashServices, 'clientInstanceService' | 'openApiService'>, config: IUnleashConfig);
    private resolveEnvironment;
    private resolveProject;
    registerClientApplication(req: IAuthRequest<unknown, void, ClientApplicationSchema>, res: Response<void>): Promise<void>;
}
//# sourceMappingURL=register.d.ts.map