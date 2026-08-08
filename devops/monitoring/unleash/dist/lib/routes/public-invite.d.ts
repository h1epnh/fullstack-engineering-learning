import type { Response } from 'express';
import Controller from './controller';
import type { IAuthRequest } from './unleash-types';
import type { IUnleashConfig, IUnleashServices } from '../types';
import { type UserSchema } from '../openapi/spec/user-schema';
import type { CreateInvitedUserSchema } from '../openapi/spec/create-invited-user-schema';
interface TokenParam {
    token: string;
}
export declare class PublicInviteController extends Controller {
    private publicSignupTokenService;
    private openApiService;
    private logger;
    constructor(config: IUnleashConfig, { publicSignupTokenService, openApiService, }: Pick<IUnleashServices, 'publicSignupTokenService' | 'openApiService'>);
    validate(req: IAuthRequest<TokenParam, void>, res: Response): Promise<void>;
    addTokenUser(req: IAuthRequest<TokenParam, void, CreateInvitedUserSchema>, res: Response<UserSchema>): Promise<void>;
}
export {};
//# sourceMappingURL=public-invite.d.ts.map