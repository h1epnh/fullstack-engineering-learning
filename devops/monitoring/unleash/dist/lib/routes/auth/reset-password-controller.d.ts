import type { Request, Response } from 'express';
import Controller from '../controller';
import type { IUnleashConfig } from '../../types/option';
import type { IUnleashServices } from '../../types';
import { type TokenUserSchema } from '../../openapi/spec/token-user-schema';
import type { EmailSchema } from '../../openapi/spec/email-schema';
interface IValidateQuery {
    token: string;
}
interface IChangePasswordBody {
    token: string;
    password: string;
}
declare class ResetPasswordController extends Controller {
    private userService;
    private openApiService;
    private logger;
    constructor(config: IUnleashConfig, { userService, openApiService, }: Pick<IUnleashServices, 'userService' | 'openApiService'>);
    sendResetPasswordEmail(req: Request<unknown, unknown, EmailSchema>, res: Response): Promise<void>;
    validatePassword(req: Request, res: Response): Promise<void>;
    validateToken(req: Request<unknown, unknown, unknown, IValidateQuery>, res: Response<TokenUserSchema>): Promise<void>;
    changePassword(req: Request<unknown, unknown, IChangePasswordBody, unknown>, res: Response): Promise<void>;
    private logout;
}
export default ResetPasswordController;
//# sourceMappingURL=reset-password-controller.d.ts.map