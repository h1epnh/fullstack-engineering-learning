import type { Response } from 'express';
import type { IAuthRequest } from '../../unleash-types';
import Controller from '../../controller';
import { type IUnleashConfig } from '../../../types/option';
import type { IUnleashServices } from '../../../types/services';
import { type MeSchema } from '../../../openapi/spec/me-schema';
import type { PasswordSchema } from '../../../openapi/spec/password-schema';
import { type ProfileSchema } from '../../../openapi/spec/profile-schema';
import { type RolesSchema } from '../../../openapi/spec/roles-schema';
declare class UserController extends Controller {
    private accessService;
    private userService;
    private userFeedbackService;
    private userSplashService;
    private openApiService;
    private projectService;
    private flagResolver;
    private userSubscriptionsService;
    constructor(config: IUnleashConfig, { accessService, userService, userFeedbackService, userSplashService, openApiService, projectService, transactionalUserSubscriptionsService, }: Pick<IUnleashServices, 'accessService' | 'userService' | 'userFeedbackService' | 'userSplashService' | 'openApiService' | 'projectService' | 'transactionalUserSubscriptionsService'>);
    getRoles(req: IAuthRequest, res: Response<RolesSchema>): Promise<void>;
    getMe(req: IAuthRequest, res: Response<MeSchema>): Promise<void>;
    getProfile(req: IAuthRequest, res: Response<ProfileSchema>): Promise<void>;
    changeMyPassword(req: IAuthRequest<unknown, unknown, PasswordSchema>, res: Response): Promise<void>;
}
export default UserController;
//# sourceMappingURL=user.d.ts.map