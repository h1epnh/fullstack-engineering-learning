import type { Response } from 'express';
import type { IUnleashConfig } from '../../server-impl';
import type { IUnleashServices } from '../../types';
import Controller from '../controller';
import type { IAuthRequest } from '../unleash-types';
import { type UserSchema } from '../../openapi/spec/user-schema';
import type { LoginSchema } from '../../openapi/spec/login-schema';
export declare class SimplePasswordProvider extends Controller {
    private logger;
    private openApiService;
    private userService;
    constructor(config: IUnleashConfig, { userService, openApiService, }: Pick<IUnleashServices, 'userService' | 'openApiService'>);
    login(req: IAuthRequest<void, void, LoginSchema>, res: Response<UserSchema>): Promise<void>;
}
//# sourceMappingURL=simple-password-provider.d.ts.map